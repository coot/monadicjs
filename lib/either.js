/** @module */
"use strict"

const Monad = require("./monad")
const { wrap } = require("./utils")

class Either extends Monad {

  return(value)  {return Right(value)}
  fail(err) {return Left(err)}

  join(stack, cb) {
    // console.log(`Either.join ${this.isRight ? `Right(${this.fromRight()}` : `Left(${this.fromLeft()})`}`)
    if (this.isRight) {
      const { doBlock } = stack[0]
      cb(doBlock.next(wrap(this.fromRight(), stack.length)))
    } else {
      const { doBlock } = stack[stack.length - 1]
      doBlock.next({ value: this, done: true })
      cb(stack[0].doBlock.next({ value: this, done: false }))
    }
  }

  toString() {
    return this.isRight ? `Right(${this.fromRight()})` : `Left(${this.fromLeft()})`
  }
}


function Right(value) {
  return {
    __proto__: Either.prototype,
    isRight: true,
    isLeft: false,
    fromRight() {return value},
    fromLeft() {throw Error("Either.fromLeft: Right")},
  }
}


function Left(value) {
  return {
    __proto__: Either.prototype,
    isRight: false,
    isLeft: true,
    fromRight() {throw Error("Either.fromRight: Left")},
    fromLeft() {return value},
  }
}


exports.Either = Either
exports.Right = Right
exports.Left = Left

