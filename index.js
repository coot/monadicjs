/** @module */
"use strict"

const ctrl = require("./lib/ctrl");

function unwrap(obj, idx) {
  while (--idx >= 0)
    obj = obj.value
  return obj
}


function wrap(obj, idx) {
  while (--idx >= 0)
    obj = { value: obj, done: false }
  return obj
}


let id = 0

/**
 * @function do_ Haskell's do
 */
function do_(monad, doG, cb, stack=[]) {
  const doBlock = ctrl(doG(stack), stack, id)
  if (!doBlock._id) doBlock._id = id++

  if (stack.length === 0) {
    stack.push({ monad, doBlock })
    const { value, done } = doBlock.next()
    if (done)
      return cb(value)

    return (function inner(stack, args) {
      const {value, done} = args,
        { monad, doBlock }= stack[stack.length - 1]
      console.log(`${monad.name}: ${JSON.stringify(args)} ${stack.length}`)
      debugger
      if (!done)
        return monad.join(stack, unwrap(value, stack.length), inner.bind(null, stack))
      // here I should deal with return values (which should by of type Monad)
      else if (stack.length <= 1) {
        console.log(`value: ${value}, ${stack.length}`)
        return cb(unwrap(value, stack.length - 1))
      }
    })(stack, {value, done})
  } else {
    return (function* innerG(stack) {
      stack.push({ monad , doBlock })
      let result = yield* doBlock
      stack.pop()
      return result
    })(stack)
  }
}

class MaybeM {
  static return(value) {return value}
  static fail(error) {return null}
  static join(stack, value, cb) {
    console.log(`MaybeM.join(${stack.length}, ${JSON.stringify(value)})`)
    if (value !== null) {
      const { doBlock } = stack[0]
      cb(doBlock.next(wrap(value, stack.length)))
    } else {
      const { doBlock } = stack[stack.length - 1]
      if (stack.length > 1) {
        doBlock.next({ value: null, done: true })
        cb(stack[0].doBlock.next({ value: null, done: false }))
      } else
        cb(doBlock.next({ value: null, done: true }))
    }
  }
}

class PromiseM {
  static return(value) {return Promise.resolve(value)}
  static fail(error) {return Promise.resolve(null)}
  static join(stack, promise, cb) {
    promise
      .then(value => {
        const { doBlock } = stack[0]
        console.log(`PromiseM: then: doBlock.next(${JSON.stringify(wrap(value, stack.length))})`)
        cb(doBlock.next(wrap(value, stack.length)))
      })
      .catch(err => {
        const { doBlock } = stack[stack.length - 1]
        console.log(`PromiseM: catch: ${JSON.stringify(err)}`)
        if (stack.length > 1) {
          doBlock.next({ value: Promise.reject(null), done: true})
          cb(stack[0].doBlock.next({ value: Promise.reject(null), done: false}))
        } else
          cb(doBlock.next({ value: Promise.reject(null), done: true}))
      })
  }
}

exports.do = do_

function* maybeComp() {
  const x = yield 1
  const y = yield 2
  const z = yield 3
  console.log('maybeComp:', x, y, z)
  return x + y + z
}

function* maybeCompFail() {
  const x = yield 1
  const y = yield null
  const z = yield 3
  console.log('maybeCompFail:', x, y, z)
  return x + y + z
}

function* promiseComp() {
  const x = yield new Promise((resolve, reject) => {
    setTimeout(resolve.bind(null, 1), 200)
  })
  const y = yield new Promise((resolve, reject) => {
    setTimeout(resolve.bind(null, 2), 200)
  })
  const z = yield new Promise((resolve, reject) => {
    setTimeout(resolve.bind(null, 3), 200)
  })
  console.log(`promiseComp.return: ${x} ${y} ${z}`)
  return Promise.resolve(x + y + z)
}

function* promiseCompFail() {
  const x = yield new Promise((resolve, reject) => {
    setTimeout(resolve.bind(null, 1), 200)
  })
  const y = yield new Promise((resolve, reject) => {
    setTimeout(reject.bind(null, new Error('ups...')), 200)
  })
  const z = yield new Promise((resolve, reject) => {
    setTimeout(resolve.bind(null, 3), 200)
  })
  return Promise.resolve(x + y + z)
}

if (require.main === module) {
  // do_(MaybeM, maybeComp, v => console.log(`maybeComp: ${JSON.stringify(v)}`))
  // console.log('\n')
  // do_(MaybeM, maybeCompFail, v => console.log(`maybeComp: ${JSON.stringify(v)}`))
  // console.log('\n')

  // do_(PromiseM, promiseComp, promise => promise.then((v) => console.log(`promiseComp: ${v}`)).catch((e) => console.log(`promiseComp: error ${e}`)))
  // do_(PromiseM, promiseCompFail, promise => promise.then((v) => console.log(`promiseCompFail: ${v}`)).catch((e) => console.log(`promiseCompFail: ${e}`)))
  
   
    /*
     * do_(MaybeM, function* (stack) {
     *   let a = yield 0
     *   console.log(`a=${a}`)
     *   let b = yield* do_(MaybeM, maybeCompFail, null, stack)
     *   console.log(`b=${JSON.stringify(b)}`)
     *   let c = yield 4
     *   console.log(`c=${c}`)
     *   return [a, b, c]
     * }, val => console.log(`val: ${JSON.stringify(val)}`))
     */


    // TODO: return Promise -> deal with return values
    
     // do_(MaybeM, function* (stack) {
       // const x = yield -1
       // const y = yield 0
       // const z = yield* do_(PromiseM, promiseComp, null, stack)
       // console.log(`z ${JSON.stringify(z)} ${z && z.constructor ? z.constructor.name : z}`)
       // const a = yield 4
       // const b = yield 5
       // return z.then(z => [x, y, z, a, b])
     // }, p => {
       // if (p)
         // p
           // .then(v => console.log(`mixed (then): ${v}`))
           // .catch(e => console.log(`mixed (catch): ${e}`));
       // else
         // console.log(`mixed ?: ${p}`);
     // })

  /*
   * do_(PromiseM, function* (stack) {
   *   const x = yield new Promise((resolve, _) => setTimeout(resolve.bind(null, 1), 200))
   *   const y = yield new Promise((resolve, _) => setTimeout(resolve.bind(null, 2), 200))
   *   const z = yield* do_(MaybeM, maybeComp, null, stack)
   *   return x + y + z
   * }, v => console.log(`mixed': ${v}`))
   */
}
