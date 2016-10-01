/** @module */
"use strict"

const ctrl = require("./lib/ctrl");

/**
 * @function do_ Haskell's do
 */
function do_(monad, doG, cb, stack=[]) {
  const doBlock = doG(stack)
  if (stack.length === 0) {
    stack.push({ monad, doBlock })
    const { value, done } = doBlock.next()
    if (done)
      return cb(value)

    return (function inner(stack, args) {
      const {value, done} = args,
        { monad, doBlock }= stack[stack.length - 1]
      console.log(`${monad.name}: ${value} ${done} ${stack.length}`)
      if (!done)
        return monad.join(stack, value, inner.bind(null, stack))
      else if (stack.length <= 1)
        return cb(value)
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
    if (value !== null) {
      const { doBlock } = stack[0]
      cb(doBlock.next(value))
    } else {
      debugger
      const { doBlock } = stack[stack.length - 1]
      const { value } = doBlock.return(null)
      cb(stack[0].doBlock.next(value))
    }
  }
}

class PromiseM {
  static return(value) {return Promise.resolve(value)}
  static fail(error) {return Promise.reject(error)}
  static join(stack, promise, cb) {
    promise
      .then(val => {
        const { doBlock } = stack[0]
        cb(doBlock.next(val))
      })
      .catch(err => {
        const { doBlock } = stack[stack.length - 1]
        let returnValue = this.fail(err)
        cb(doBlock.return(returnValue))
        let idx = stack.length - 1
        while(--idx >= 0) {
          returnValue = stack[idx].monad.fail(returnValue)
          stack[idx].doBlock.return(returnValue)
        }
      })
  }
}

exports.do = do_

function* maybeComp() {
  const x = yield 1
  const y = yield 2
  const z = yield 3
  return x + y + z
}

function* maybeCompFail() {
  const x = yield 1
  const y = yield null
  const z = yield 3
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
  /*
   * do_(MaybeM, maybeComp, v => console.log(`maybeComp: ${v}`))
   * do_(MaybeM, maybeCompFail, v => console.log(`maybeComp: ${v}`))
   */
  /*
   * do_(PromiseM, promiseComp, promise => promise.then((v) => console.log(`promiseComp: ${v}`)).catch((e) => console.log(`promiseComp: error ${e}`)))
   * do_(PromiseM, promiseCompFail, promise => promise.then((v) => console.log(`promiseCompFail: ${v}`)).catch((e) => console.log(`promiseCompFail: ${e}`)))
   */
  do_(MaybeM, function* (stack) {
    let a = yield 1
    let b = yield* do_(MaybeM, maybeCompFail, null, stack)
    console.log(`b=${b}`)
    let c = yield 2
    return a + b + c
  }, val => console.log(`x: ${val}`))
  /*
   * do_(MaybeM, function* (stack) {
   *   const x = yield 1
   *   const y = yield 2
   *   const promise = yield* do_(PromiseM, promiseComp, null, stack)
   *   const w = yield 3
   *   const a = yield 4
   *   return promise.then(z =>  a + x + y + z + w)
   * }, p => {
   *   if (p)
   *     p
   *       .then(v => console.log(`mixed (then): ${v}`))
   *       .catch(e => console.log(`mixed (catch): ${e}`));
   *   else
   *     console.log(`mixed ?: ${p}`);
   * })
   */
  /*
   * do_(PromiseM, function* (stack) {
   *   const x = yield new Promise((resolve, _) => setTimeout(resolve.bind(null, 1), 200))
   *   const y = yield new Promise((resolve, _) => setTimeout(resolve.bind(null, 2), 200))
   *   const z = yield* do_(MaybeM, maybeComp, null, stack)
   *   return x + y + z
   * }, v => console.log(`mixed': ${v}`))
   */
}
