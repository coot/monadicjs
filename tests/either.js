"use strict"

const assert = require("assert")
const { "do": do_, Right, Left } = require("../index")

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
  it("should return the result", done => {
    do_(eitherComp.bind(null, null), results => {
      assert.deepStrictEqual(results, [1, 2, 3])
      done()
    })
  })

  it("should return Left on error", done => {
    do_(eitherCompFail, result => {
      assert.equal(result.isLeft, true)
      assert.equal(result.fromLeft(), 2)
      done()
    })
  })

  it("should yield* from a successful computation", done => {
    do_(
      eitherComp.bind(null, eitherComp.bind(null, null)),
      results => {
        assert.deepStrictEqual(results, [1,2,3,1,2,3])
        done()
      }
    )
  })

  it("should yield* from a failing computation", done => {
    do_(
      eitherComp.bind(null, eitherCompFail),
      results => {
        assert.deepStrictEqual(results.slice(0, 3), [1,2,3])
        assert.strictEqual(results[3].isLeft, true)
        assert.strictEqual(results[3].fromLeft(), 2)
        done()
      }
    )
  })
})
