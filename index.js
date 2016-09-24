'use strict'

/*
 * do_ - Haskell's do
 *  it should return a generator which yields the result of the do expression
 *  this way one will be able to:
 *    + turn do_ into an expression, like Haskell's that evaluates to the last
 *      statement
 *    + combine yield from an inner do, i.e. combine do's the way one can do
 *      that in Haskell (see h' in m.hs)
 */
function do_(doG, cb) {
  const doBlock = doG(),
    { value: monad, done } = doBlock.next()
  if (done)
    return cb(monad)

  return (function inner(args) {
    const {value: monad, done} = args
    console.log(`${monad.__proto__.constructor.name}: ${monad.value} ${done}`)
    return (!done) ? monad.join(doBlock, inner) : cb(monad)
  })({value: monad, done})
}

class Monad {
  constructor(value) {
    this.value = value
  }

  /*
   * join - equivalent to  >>= in Haskell written in contiuation style
   *  it should call `cb(doBlock.next(...)` or cb(doBlock.return(...)` or
   *  `cb(doBlock.throw(...)`.  If you omit the call to `cb` the `doBlock`
   *  generator will not resume.
   */
  join(doBlock, cb) {
    throw new Error('not implemented')
  }

  return(value) {
    return new (Object.getPrototypeOf(this)).constructor(value)
  }
}

class MaybeM extends Monad {
  join(doBlock, cb) {
    if (this.value !== null)
      cb(doBlock.next(this.value))
    else
      cb(doBlock.return(this.return(null)))
  }
}

class PromiseM extends Monad {
  constructor(value) {

    if (!(value instanceof Promise))
      value = Promise.resolve(value)
    super(value)
  }

  join(doBlock, cb) {
    const value = this.value
      .then(val => cb(doBlock.next(val)))
      .catch(val => cb(doBlock.throw(val)))
  }
}

exports.do = do_
exports.Monad = Monad
exports.MaybeM = MaybeM


function* maybeComp() {
  const x = yield new MaybeM(1)
  const y = yield new MaybeM(2)
  const z = yield new MaybeM(3)
  return new MaybeM(x + y + z)
}

function* promiseComp() {
  const x = yield new PromiseM(new Promise((resolve, reject) => {
    setTimeout(resolve.bind(null, 1), 200)
  }))
  const y = yield new PromiseM(new Promise((resolve, reject) => {
    setTimeout(resolve.bind(null, 2), 200)
  }))
  const z = yield new PromiseM(new Promise((resolve, reject) => {
    setTimeout(resolve.bind(null, 3), 200)
  }))
  return new PromiseM(x + y + z)
}

if (require.main === module) {
  console.log('\nMaybeComp\n')
  do_(maybeComp, m => console.log(`maybeComp: ${m.value}`))
  console.log('\nPromiseComp\n')
  do_(promiseComp, m => m.value.then((v) => console.log(`promiseComp: ${v}`)))
  /*
   * console.log('\nMixedComp\n')
   * do_(function* () {
   *   const x = yield new MaybeM(1)
   *   // note: Haskell's typechecker would complain here!
   *   const y = yield new PromiseM(new Promise((resolve, _) => setTimeout(resolve.bind(null, 2), 200)))
   *   return new MaybeM(x + y);
   * }, m => console.log(`mixed: ${m.value}`));
   */

  // this is how to do the same to make Haskell happy
  /*
   * do_(function* () {
   *   const x = yield new MaybeM(1);
   *   // TODO: how to port h' from m.hs ...
   *   const y = yield new PromiseM(new Promise((resolve, _) => setTimeout(resolve.bind(null, 2), 200)))
   *   return new MaybeM(x + y);
   * }, m => console.log(`mixed': ${m.__proto__.constructor.name} ${m.value}`))
   */
}
