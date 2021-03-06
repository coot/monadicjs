/** @module */
"use strict"

const ctrl = require("./lib/ctrl")
const Monad = require("./lib/monad")
const { Maybe, Just, Nothing } = require("./lib/maybe")
const { Either, Left, Right } = require("./lib/either")
const NodeContinuationMonad = require("./lib/node-continuation")
const PromiseMonad = require("./lib/promise")
const { unwrap, wrap } = require("./lib/utils")
const { State, get, put, modify } = require("./lib/state")


let id = 0

/**
 * @function do_ Haskell's do
 */
function do_(doG, cb, stack=[], data={}) {
  const doBlock = ctrl(doG(stack), stack, id)
  if (!doBlock._id) doBlock._id = id++

  if (stack.length === 0) {
    stack.push(Object.assign({}, { data }, { doBlock }))
    const { value, done } = doBlock.next()
    if (done)
      return cb(value)

    return (function inner(stack, args) {
      const {value, done} = args,
        { doBlock }= stack[stack.length - 1]
      if (!done) {
        const received = unwrap(value, stack.length)
        if (received instanceof Monad)
          return received.join(stack, inner.bind(null, stack))
        else if (received instanceof Promise)
          return PromiseMonad.join(stack, received, inner.bind(null, stack))
        else if (received instanceof Function)
          return NodeContinuationMonad.join(stack, received, inner.bind(null, stack))
      // here I should deal with return values (which should by of type Monad)
      } else if (stack.length <= 1) {
        const returnValue = unwrap(value, stack.length - 1)
          cb(returnValue)
      }
    })(stack, {value, done})
  } else {
    return (function* wrapper(stack) {
      stack.push({ doBlock })
      let result = yield* doBlock
      stack.pop()
      return result
    })(stack)
  }
}

function doP(gen, data={}) {
  return new Promise((resolve, reject) => {
    do_(gen, resolve, [], data)
  })
}


module.exports = {
  do: do_,
  doP,
  Maybe, Nothing, Just,
  NodeContinuationMonad,
  PromiseMonad,
  Monad,
  Either, Left, Right,
  State, get, put, modify,
}
