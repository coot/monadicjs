/** @module */
"use strict"

const Monad = require("./monad")
const { wrap } = require("./utils")

/**
 * @alias module:lib/either.Either
 * @description Either type.  Do not construct instances using `new Either()`.
 * Use `Right` and `Left` constructors.  If you want to subclass just use
 * prototype inhertiance directly.
 */
class Either extends Monad {

  constructor() {
    throw Error("use Right(value) or Left(value) to construct Either")
  }

  return(value)  {return Right(value)}
  fail(err) {return Left(err)}

  join(stack, cb) {
    if (this instanceof Right) {
      const { doBlock } = stack[0]
      cb(doBlock.next(wrap(this.fromRight(), stack.length)))
    } else {
      const { doBlock } = stack[stack.length - 1]
      doBlock.next({ value: this, done: true })
      cb(stack[0].doBlock.next({ value: this, done: false }))
    }
  }

  toString() {
    return this instanceof Right ? `Right(${this.fromRight()})` : `Left(${this.fromLeft()})`
  }
}

/**
 * @method
 * @description Right constructor.  You can check if an object is instance of
 * Right simply by `o instanceof Right`.  `o instanceof Either` will return
 * true as well.
 * @param {any} value
 * @return {Right}
 */
function Right(value) {
  return {
    __proto__: Right.prototype,
    fromRight() {return value},
  }
}

Right.prototype = {
  __proto__: Either.prototype,
  fromLeft() {throw Error("Either.fromLeft: Right")},
}


/**
 * @method
 * @description Left contructor.  You can check if an object is instance of
 * Right simply by `o instance Left`, `o instance Left` will return true as
 * well.
 * @param {any} value
 * @returns {Left}
 */
function Left(value) {
  return {
    __proto__: Left.prototype,
    fromLeft() {return value},
  }
}

Left.prototype = {
  __proto__: Either.prototype,
  fromRight() {throw Error("Either.fromRight: Left")},
}

module.exports = {
  Either, Right, Left
}

