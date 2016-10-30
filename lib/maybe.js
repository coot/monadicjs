/** @module */
"use strict"

const Monad = require("./monad")
const { wrap } = require("./utils")

class Maybe extends Monad {
  // name: "Maybe",
  // __proto__: Monad,

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


function Just(value) {
  return {
    __proto__: Just.prototype,
    fromJust() {return value},
  }
}

Just.prototype = {
  __proto__: Maybe.prototype,
}

const Nothing = (function Nothing() {
  return {
    __proto__: Maybe.prototype,
    fromJust() {throw Error("Maybe.fromJust: Nothing")}
  }
})()


exports.Maybe = Maybe
exports.Just = Just
exports.Nothing = Nothing
