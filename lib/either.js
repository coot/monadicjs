/** @module */
"use strict"

const Monad = require("./monad")
const { wrap } = require("./utils")

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

exports.Either = Either
exports.Right = Right
exports.Left = Left

