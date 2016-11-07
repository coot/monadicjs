/** @module */
"use static"

const Monad = require("./monad")
const { wrap } = require("./utils")


/**
 * @alias module:lib/promise.Promise
 * @description The Promise Monad.
 */
const PromiseMonad = {
  __proto__: Monad,

  return(value) {
    return Promise.resolve(value)
  },

  fail(value) {
    return Promise.reject(value)
  },

  join(stack, promise, cb) {
    // console.log(`PromiseMonad: ${Array.isArray(stack)} ${promise instanceof Promise}`)
    promise
      .then(value => {
        const { doBlock } = stack[0]
        // console.log(`PromiseMonad: then: doBlock.next(${JSON.stringify(wrap(value, stack.length))})`)
        cb(doBlock.next(wrap(value, stack.length)))
      })
      .catch(err => {
        const { doBlock } = stack[stack.length - 1]
        /*
         * console.log(`PromiseMonad: catch: ${JSON.stringify(err)}`)
         * console.log(err)
         */
        const value = this.fail(err)
        doBlock.next({ value, done: true })
        cb(stack[0].doBlock.next({ value, done: false }))
      })
  },
}


module.exports = PromiseMonad
