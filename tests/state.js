"use strict"

const assert = require("assert")
const { "do": do_, State, get, put, modify, Monad } = require("../index")
const stateGame = require("../examples/state-game")

describe("State", function() {
  describe("game", function() {
    it("should play ;)", function(done) {
      do_(stateGame("caacbcb"), (state) => {
        const [on, result] = state
        assert.equal(on, true)
        assert.equal(result, 1)
        done()
      }, [], {state: [false, 0]})
    })
  })

  describe("get", function() {
    it("should yield the default state", function() {
      do_(
        function* () {
          const state = yield get
          return state
        },
        state => {
          assert.equal(state, 1)
        },
        [],
        { state: 1 }
      )
    })

    it("should yield null if state was not defined", function() {
      do_(
        function* () {
          const state = yield get
          return state
        },
        state => {
          assert.equal(state, null)
        },
        []
      )
    })
  })

  describe("put", function() {
    it("should insert a new state", function() {
      const state = 1
      do_(
        function* () {
          yield put(2)
          return yield get
        },
        state => {
          assert.equal(state, 2)
        },
        [],
        { state }
      )
    })

    it("should insert a new state even if initial state was not defined", function() {
      do_(
        function* () {
          yield put(2)
          return yield get
        },
        state => {
          assert.equal(state, 2)
        },
        []
      )

    })
  })

  describe("modify", function() {
    it("should modify the state", function() {
      do_(
        function* () {
          yield modify(s => s + 1)
          return yield get
        },
        state => {
          assert.equal(state, 2)
        },
        [],
        { state: 1 }
      )
    })
  })
})

