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
      // console.log(`${monad.name}: ${JSON.stringify(args)} ${stack.length}`)
      if (!done)
        return monad.join(stack, unwrap(value, stack.length), inner.bind(null, stack))
      // here I should deal with return values (which should by of type Monad)
      else if (stack.length <= 1) {
        // console.log(`value: ${JSON.stringify(value)}, ${stack.length}`)
        return cb(unwrap(value, stack.length - 1))
      }
    })(stack, {value, done})
  } else {
    return (function* wrapper(stack) {
      stack.push({ monad , doBlock })
      let result = yield* doBlock
      stack.pop()
      // console.log(`wrapper ${JSON.stringify(result)}`)
      return result
    })(stack)
  }
}

class MaybeM {
  static join(stack, value, cb) {
    // console.log(`MaybeM.join(${stack.length}, ${JSON.stringify(value)})`)
    if (value !== null) {
      const { doBlock } = stack[0]
      cb(doBlock.next(wrap(value, stack.length)))
    } else {
      const { doBlock } = stack[stack.length - 1]
      doBlock.next({ value: null, done: true })
      cb(stack[0].doBlock.next({ value: null, done: false }))
    }
  }
}

class Either extends Array {
  constructor(left, right) {
    super(left, right)
  }
}

class PromiseEitherM {
  static join(stack, promise, cb) {
    promise
      .then(value => {
        const { doBlock } = stack[0]
        // console.log(`PromiseEitherM: then: doBlock.next(${JSON.stringify(wrap(value, stack.length))})`)
        cb(doBlock.next(wrap(new Either(null, value), stack.length)))
      })
      .catch(err => {
        const { doBlock } = stack[stack.length - 1]
        // console.log(`PromiseEitherM: catch: ${JSON.stringify(err)}`)
        const value = new Either(err, null)
        doBlock.next({ value, done: true})
        cb(stack[0].doBlock.next({ value, done: false}))
      })
  }
}

exports.do = do_
exports.Either = Either
exports.MaybeM = MaybeM
exports.PromiseEitherM = PromiseEitherM
