/** @module */
"use strict"

const ctrl = require("./lib/ctrl")
const Monad = require("./lib/monad")
const { Maybe, Just, Nothing } = require("./lib/maybe")
const PromiseMonad = require("./lib/promise")
const { unwrap, wrap } = require("./lib/utils")


let id = 0

/**
 * @function do_ Haskell's do
 */
function do_(doG, cb, stack=[]) {
  const doBlock = ctrl(doG(stack), stack, id)
  if (!doBlock._id) doBlock._id = id++

  if (stack.length === 0) {
    stack.push({ doBlock })
    const { value, done } = doBlock.next()
    if (done)
      return cb(value)

    return (function inner(stack, args) {
      const {value, done} = args,
        { doBlock }= stack[stack.length - 1]
      if (!done) {
        const received = unwrap(value, stack.length)
        // console.log("received", received.toString())
        if (received instanceof Monad)
          return received.join(stack, inner.bind(null, stack))
        else if (received instanceof Promise)
          return PromiseMonad.join(stack, received, inner.bind(null, stack))
      // here I should deal with return values (which should by of type Monad)
      } else if (stack.length <= 1) {
        // console.log(`value: ${JSON.stringify(value)}, ${stack.length}`)
        return cb(unwrap(value, stack.length - 1))
      }
    })(stack, {value, done})
  } else {
    return (function* wrapper(stack) {
      stack.push({ doBlock })
      let result = yield* doBlock
      stack.pop()
      // console.log(`wrapper ${JSON.stringify(result)}`)
      return result
    })(stack)
  }
}


module.exports = {
  do: do_,
  Maybe,
  Nothing,
  Just,
  PromiseMonad,
  Monad,
}
