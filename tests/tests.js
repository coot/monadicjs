"use strict";
const assert = require("assert")

const ctrl = require("../lib/ctrl")
const { "do": do_, Either, MaybeM, PromiseEitherM } = require("../index.js")

describe("controller", function() {
  it("should return initial value", function() {
    function* g() {
      yield 1
    }
    const gCtrl = ctrl(g())
    const { value, done } = gCtrl.next()
    assert.equal(value.value, 1)
    assert.equal(value.done, false)
    assert.equal(done, false)
  })

  it("should yield from the generator", function() {
    function* g() {
      const value = yield null
      yield value
    }
    const gCtrl = ctrl(g())
    gCtrl.next()

    let { value, done } = gCtrl.next({value: 1, done: false})
    assert.deepStrictEqual(value, {value: 1, done: false})
    assert.equal(done, false)
  })

  it("should return from the generator", function() {
    function* g() {
      const value = yield null
      return value
    }
    const gCtrl = ctrl(g())
    gCtrl.next()

    let { value, done } = gCtrl.next({value: 1, done: false})
    assert.deepStrictEqual(value,  1)
    assert.equal(done, true)
    // NOTE: this indicates that I should `return ret` inside `controller`
  })

  it("ask to return from the generator", function() {
    function* g() {
      let value = yield null;
      while (true)
        value = yield value
    }

    const gCtrl = ctrl(g())
    gCtrl.next()

    gCtrl.next({value: 1, done: false})
    gCtrl.next({value: 2, done: true})
    let { value, done } = gCtrl.next()

    assert.equal(value, 2)
    assert.equal(done, true)
  })
})

function* maybeComp(m, g, stack) {
  const results = []
  results.push(yield 1)
  results.push(yield 2)
  results.push(yield 3)
  if (g) {
    const inner = yield* do_(m, g, null, stack)
    if (Array.isArray(inner))
      Array.prototype.push.apply(results, inner)
    else
      results.push(inner)
  }
  return results
}

function* maybeCompFail() {
  const results = []
  results.push(yield 1)
  results.push(yield null)
  results.push(yield 3)
  return results
}

describe("MaybeM", function() {
  it("should return the result", done => {
    do_(MaybeM, maybeComp.bind(null, null, null), results => {
      assert.deepStrictEqual(results, [1, 2, 3])
      done()
    })
  })

  it("should return null on failure", done => {
    do_(MaybeM, maybeCompFail, results => {
      assert.equal(results, null)
      done()
    })
  })

  it("should yield* from a successful computation", done => {
    do_(
      MaybeM,
      maybeComp.bind(null, MaybeM, maybeComp),
      results => {
        assert.deepStrictEqual(results, [1,2,3,1,2,3])
        done()
      }
    )
  })

  it("should yield* from a failing computation", done => {
    do_(
      MaybeM,
      maybeComp.bind(null, MaybeM, maybeCompFail),
      results => {
        assert.deepStrictEqual(results, [1,2,3,null])
        done()
      }
    )
  })

  it("should yield* from yield* from a successful computation", done => {
    do_(
      MaybeM,
      maybeComp.bind(
        null,
        MaybeM,
        maybeComp.bind(
          null,
          MaybeM,
          maybeComp
        )
      ),
      results => {
        assert.deepStrictEqual(results, [1,2,3,1,2,3,1,2,3])
        done()
      })
  })

  it("should yield* from yield* from a failing computation", done => {
    do_(
      MaybeM,
      maybeComp.bind(
        null,
        MaybeM,
        maybeCompFail.bind(
          null,
          MaybeM,
          maybeCompFail
        )
      ),
      results => {
        assert.deepStrictEqual(results, [1,2,3,null])
        done()
      })
  })
})

function* promiseComp(m, g, stack) {
  const results = []
  results.push(yield new Promise((resolve, reject) => {
    setTimeout(resolve.bind(null, 1), 10)
  }))
  results.push(yield new Promise((resolve, reject) => {
    setTimeout(resolve.bind(null, 2), 10)
  }))
  results.push(yield new Promise((resolve, reject) => {
    setTimeout(resolve.bind(null, 3), 10)
  }))

  if (g) {
    const inner = yield* do_(m, g, null, stack)
    if (inner instanceof Either)
      results.push(inner)
    else
      Array.prototype.push.apply(results, inner)
  }

  return results
}

function* promiseCompFail() {
  const results = []
  results.push(yield new Promise((resolve, reject) => {
    setTimeout(resolve.bind(null, 1), 10)
  }))
  results.push(yield new Promise((resolve, reject) => {
    setTimeout(reject.bind(null, new Error('ups...')), 10)
  }))
  results.push(yield new Promise((resolve, reject) => {
    setTimeout(resolve.bind(null, 3), 10)
  }))
  return results
}

describe("PromiseEitherM", function() {
  it("should return the result", done => {
    do_(PromiseEitherM, promiseComp.bind(null, null, null), results => {
      assert.deepStrictEqual(
        results,
        [new Either(null, 1), new Either(null, 2), new Either(null, 3)]
      )
      done()
    })
  })

  it("should return error on failure", done => {
    do_(PromiseEitherM, promiseCompFail, results => {
      assert.deepEqual(results, [new Error('ups...'), null])
      done()
    })
  })

  it("should yield* from a successful computation", done => {
    do_(
      PromiseEitherM,
      promiseComp.bind(null, PromiseEitherM, promiseComp),
      results => {
        assert.deepStrictEqual(
          results,
          [
            new Either(null, 1),
            new Either(null, 2),
            new Either(null, 3),
            new Either(null, 1),
            new Either(null, 2),
            new Either(null, 3)
          ]
        )
        done();
      }
    )
  })

  it("should yield* from a failing computation", done => {
    do_(
      PromiseEitherM,
      promiseComp.bind(null, PromiseEitherM, promiseCompFail),
      results => {
        assert.deepStrictEqual(
          results,
          [
            new Either(null, 1),
            new Either(null, 2),
            new Either(null, 3),
            new Either(new Error('ups...'), null),
          ]
        )
        done()
      }
    )
  })
})
