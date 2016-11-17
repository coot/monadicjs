"use strict"
const assert = require("assert")
const fs = require("fs")
const path = require("path")

const { "do": do_, Just, Nothing } = require("../index")
const NodeContinuationMonad = require("../lib/node-continuation")


function* readFiles(stack) {
  const results = []
  results.push(yield fs.readFile.bind(null, module.filename))
  results.push(yield fs.readFile.bind(null,
    path.join(path.dirname(module.filename), "./maybe.js")
  ))
  return NodeContinuationMonad.return(results)
}

function* readFilesFail(stack) {
  const results = []
  results.push(yield fs.readFile.bind(null, module.filename))
  results.push(yield fs.readFile.bind(null,
    path.join(path.dirname(module.filename), "___no_such_file__")
  ))
  return NodeContinuationMonad.return(results)
}

function* returnFail(stack) {
  const results = []
  results.push(yield fs.readFile.bind(null, module.filename))
  return NodeContinuationMonad.fail(new Error("error"))
}

describe("NodeContinuationMonad", function() {
  it("should return the result", done => {
    do_(readFiles, nc => {
      const [err, results] = nc
      assert.strictEqual(err, null)
      assert.strictEqual(results[0] instanceof Buffer, true)
      assert.strictEqual(results[1] instanceof Buffer, true)
      done()
    })
  })

  it("should return error on failure", done => {
    do_(readFilesFail, nc => {
      const [err, results] = nc
      assert.strictEqual(err instanceof Error, true)
      assert.strictEqual(results, null)
      done()
    })
  })

  it("should return failure", done => {
    do_(returnFail, nc => {
      const [err, results] = nc
      assert.strictEqual(err instanceof Error, true)
      assert.strictEqual(err.message, "error")
      assert.strictEqual(results, null)
      done()
    })
  })

  function* maybeComp(g, stack) {
    const results = []
    results.push(yield Just(1))
    results.push(yield* do_(g, null, stack))
    return results
  }

  it("should yield from inner computation", done => {
    do_(
      maybeComp.bind(null, readFiles),
      results => {
        assert.strictEqual(results[1] instanceof NodeContinuationMonad, true)
        const [err, files] = results[1]
        assert.strictEqual(err, null)
        assert.strictEqual(files.every(f => f instanceof Buffer), true)
        done()
      }
    )
  })

  it("should return failure from inner computation", done => {
    do_(
      maybeComp.bind(null, readFilesFail),
      results => {
        assert.strictEqual(results[1] instanceof NodeContinuationMonad, true)
        const [err, files] = results[1]
        assert.strictEqual(err instanceof Error, true)
        assert.strictEqual(files, null)
        done()
      }
    )
  })
})
