/** @module */
"use static"

const Monad = require("./monad")
const { wrap } = require("./utils")


class NodeContinuationMonad extends Array {

  constructor(err=null, value=null) {
    super(err, value)
  }

  static return(value) {
    return new NodeContinuationMonad(null, value)
  }

  static fail(err) {
    return new NodeContinuationMonad(err, null)
  }

  static join(stack, nodeCb, cb) {
    nodeCb((err, ...args) => {
      if (!err) {
        const { doBlock } = stack[0]
        cb(doBlock.next(wrap(args.length > 1 ? args : args[0], stack.length)))
      } else {
        const { doBlock } = stack[stack.length - 1]
        const value = NodeContinuationMonad.fail(err)
        doBlock.next({ value, done: true })
        cb(stack[0].doBlock.next({ value, done: false }))
      }
    })
  }
}


module.exports = NodeContinuationMonad
