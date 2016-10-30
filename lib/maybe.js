/** @module */
"use strict"

const Monad = require("./monad")
const { wrap } = require("./utils")

/**
 * @description Maybe type.  Do not construct instances using `new Maybe()`, use `Just()`
 * or `Nothing`.  You can subclass using prototype inheritance directly.
 */
class Maybe extends Monad {

  /**
   * do not use the constructor, instead construct using `Just` or use the
   * singleton `Nothing`.
   */
  constructor() {
    throw Error("use Just(value) or Nothing to construct instances")
  }

  return(value)  {return Just(value)}
  fail() {return Nothing}

  join(stack, cb) {
    if (this instanceof Just) {
      const { doBlock } = stack[0]
      cb(doBlock.next(wrap(this.fromJust(), stack.length)))
    } else {
      const { doBlock } = stack[stack.length - 1]
      doBlock.next({ value: this.fail(), done: true })
      cb(stack[0].doBlock.next({ value: this.fail(), done: false }))
    }
  }

  toString() {
    return this === Nothing ? "Nothing" : `Just(${this.fromJust()})`
  }
}


/**
 * Just constructor.  You can check if an object is instance of Just simply
 * by `o instanceof Just`.  `o instanceof Maybe` will return true as well.
 * @param {any} value
 * @return {Right}
 */
function Just(value) {
  return {
    __proto__: Just.prototype,
    fromJust() {return value},
  }
}

Just.prototype = {
  __proto__: Maybe.prototype,
}

/**
 * Nothing - a singleton.  Like `null`.  You can check that an object is
 * `Nothing` by `o === Nothing`.
 */
const Nothing = (function Nothing() {
  return {
    __proto__: Maybe.prototype,
    fromJust() {throw Error("Maybe.fromJust: Nothing")}
  }
})()


exports.Maybe = Maybe
exports.Just = Just
exports.Nothing = Nothing
