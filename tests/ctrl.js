"use strict"
const assert = require("assert")

const ctrl = require("../lib/ctrl")

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
