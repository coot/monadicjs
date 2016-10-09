"use strict"
const assert = require("assert")

const {do: do_} = require("../index")


function* promiseComp(g, stack) {
  const results = []
  results.push(yield Promise.resolve(1))
  results.push(yield Promise.resolve(2))
  results.push(yield Promise.resolve(3))

  if (g) {
    const inner = yield* do_(g, null, stack)
    if (inner instanceof Promise)
      results.push(inner)
    else
      Array.prototype.push.apply(results, inner)
  }

  /*
   * we could return `Promise.resolve(results)` but this would not work when
   * one of the results is a promise.  Which is the case if `g` was another
   * promise based computation.
   */
  return Promise.all(results)
}

function* promiseCompFail() {
  const results = []
  results.push(yield Promise.resolve(1))
  results.push(yield Promise.reject(new Error('ups...')))

  // these lines will not be called
  results.push(yield Promise.resolve(3))
  return Promise.all(results)
}

describe("PromiseMonad", function() {
  it("should return the result", done => {
    do_(promiseComp.bind(null, null), promise => {
      promise.then(
        results => {
          assert.deepStrictEqual(
            results,
            [1, 2, 3]
          )
          done()
        },
        err => {
          assert.equal(true, false)
          done()
        }
      )
    })
  })

  it("should return error on failure", done => {
    do_(promiseCompFail, promise => {
      promise.then(
        () => {
          assert.equal(true, false)
          done()
        },
        err => {
          assert.strictEqual(err instanceof Error, true)
          assert.strictEqual(err.message, 'ups...')
          done()
        }
      )
    })
  })
  
  it("should yield* from a successful computation", done => {
    do_(
      promiseComp.bind(null, promiseComp.bind(null, null)),
      promise => {
        promise.then(
          results => {
            assert.deepStrictEqual(
              results,
              [ 1, 2, 3, [1, 2, 3]]
            )
            done();
          },
          () => {
            assert.equal(true, false)
            done()
          }
        )
      }
    )
  })

  it("should yield* from a failing computation", done => {
    do_(
      promiseComp.bind(null, promiseCompFail),
      promise => promise.then(
        () => {
          assert.equal(true, false)
          done()
        },
        err => {
          assert.strictEqual(err instanceof Error, true)
          assert.strictEqual(err.message, 'ups...')
          done()
        }
      )
    )
  })
})
