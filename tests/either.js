"use strict"

const assert = require("assert")
const { "do": do_, doPromise, Right, Left, Either, Monad } = require("../index")

function* eitherComp(g, stack) {
  const results = []
  results.push(yield Right(1))
  results.push(yield Right(2))
  results.push(yield Right(3))
  if (g)  {
    const inner = yield* do_(g, null, stack)
    if (Array.isArray(inner))
      Array.prototype.push.apply(results, inner)
    else
      results.push(inner)
  }
  return results
}

function* eitherCompFail() {
  const results = []
  results.push(yield Right(1))
  results.push(yield Left(2))
  results.push(yield Right(3))
  return results
}

describe("Either", function() {
  describe("Right", () => {
    it("should return instance of Right", () => {
      assert.equal(Right(null) instanceof Right, true)
    })

    it("should return instance of Either", () => {
      assert.equal(Right(null) instanceof Either, true)
    })

    it("should return instance of Monad", () => {
      assert.equal(Right(null) instanceof Monad, true)
    })
  })

  describe("Left", () => {
    it("should return instance of Left", () => {
      assert.equal(Left(null) instanceof Left, true)
    })

    it("should return instance of Either", () => {
      assert.equal(Left(null) instanceof Either, true)
    })

    it("should return instance of Monad", () => {
      assert.equal(Left(null) instanceof Monad, true)
    })
  })
  it("should return the result", done => {
    doPromise(eitherComp.bind(null, null))
      .then( results => {
        assert.deepStrictEqual(results, [1, 2, 3])
        done()
      })
  })

  it("should return Left on error", done => {
    doPromise(eitherCompFail)
      .then(result => {
        assert.equal(result instanceof Left, true)
        assert.equal(result.fromLeft(), 2)
        done()
      })
  })

  it("should yield* from a successful computation", done => {
    doPromise(
      eitherComp.bind(null, eitherComp.bind(null, null))
    )
      .then(results => {
        assert.deepStrictEqual(results, [1,2,3,1,2,3])
        done()
      })
  })

  it("should yield* from a failing computation", done => {
    doPromise(
      eitherComp.bind(null, eitherCompFail)
    )
      .then(results => {
        assert.deepStrictEqual(results.slice(0, 3), [1,2,3])
        assert.strictEqual(results[3] instanceof Left, true)
        assert.strictEqual(results[3].fromLeft(), 2)
        done()
      })
  })
})
