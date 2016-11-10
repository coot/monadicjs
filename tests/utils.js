"use strict"

const assert = require("assert")
const utils = require("../lib/utils")

describe("utils", function() {
  describe("wrap", function() {
    it("should wrap the value", function() {
      const wrapped = utils.wrap(0, 1)
      assert.deepEqual(wrapped, {value: 0, done: false})
    })
  })

  describe("unwrap", function() {
    it("should unwrap a value", function() {
      const value = utils.unwrap({value: 0, done: false}, 1)
      assert.strictEqual(value, 0)
    })

    it("should inverse the wrap function", function() {
      assert.deepEqual(utils.unwrap(utils.wrap(0, 10), 9), {value: 0, done: false})
      assert.strictEqual(utils.unwrap(utils.wrap(0, 10), 10), 0)
    })
  })
})
