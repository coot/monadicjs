'use strict'

/*
 * do_ - Haskell's do
 */
function do_(join, doG, cb, stack=[]) {
  const doBlock = doG(stack)
  if (stack.length === 0) {
    stack.push({ join, doBlock })
    const { value, done } = doBlock.next()
    if (done)
      return cb(value)

    return (function inner(stack, args) {
      const {value, done} = args,
        { join }= stack[stack.length - 1]
      // console.log(`${join.name}: ${value} ${done}`)
      return (!done) ? join(stack, value, inner.bind(null, stack)) : cb(value)
    })(stack, {value, done})
  } else {
    return (function* innerG(stack) {
      stack.push({ join , doBlock })
      let result = yield* doBlock
      stack.pop()
      return result
    })(stack)
  }
}

function maybeJoin(stack, value, cb) {
  const { doBlock } = stack[stack.length - 1]
  if (value !== null) {
    cb(doBlock.next(value))
  } else {
    cb(doBlock.return(null))
    let idx = stack.length - 1
    // stop all generators down to the bottom
    // this is how Maybe works in Haskell
    while (--idx >= 0) {
      stack[idx].doBlock.return(null)
    }
  }
}

function promiseJoin(stack, promise, cb) {
  const { doBlock } = stack[stack.length - 1]
  promise
    .then(val => {
      cb(doBlock.next(val))
    })
    .catch(err => {
      cb(doBlock.throw(err))
    })
}

exports.do = do_


function* maybeComp() {
  const x = yield 1
  const y = yield 2
  const z = yield null
  return x + y + z
}

function* promiseComp() {
  const x = yield new Promise((resolve, reject) => {
    setTimeout(resolve.bind(null, 1), 200)
  })
  const y = yield new Promise((resolve, reject) => {
    setTimeout(resolve.bind(null, 2), 200)
  })
  const z = yield new Promise((resolve, reject) => {
    setTimeout(resolve.bind(null, 3), 200)
  })
  return Promise.resolve(x + y + z)
}

if (require.main === module) {
  do_(maybeJoin, maybeComp, v => console.log(`maybeComp: ${v}`))
  do_(promiseJoin, promiseComp, promise => promise.then((v) => console.log(`promiseComp: ${v}`)))
  do_(maybeJoin, function* (stack) {
    const x = yield 1
    const y = yield 2
    const promise = yield* do_(promiseJoin, promiseComp, null, stack)
    const w = yield 3
    return promise.then(z => x + y + z + w)
  }, p => p ? p.then(v => console.log(`mixed: ${v}`)) : console.log(`mixed: ${p}`));
  do_(promiseJoin, function* (stack) {
    const x = yield new Promise((resolve, _) => setTimeout(resolve.bind(null, 1), 200))
    const y = yield new Promise((resolve, _) => setTimeout(resolve.bind(null, 2), 200))
    const z = yield* do_(maybeJoin, maybeComp, null, stack)
    return x + y + z
  }, v => console.log(`mixed': ${v}`))
}
