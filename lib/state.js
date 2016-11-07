/** @module */
"use strict"

const Monad = require("./monad")
const { wrap } = require("./utils")

/**
 * @member
 * @description State monad base prototype
 * @example 
 *  do_(
 *    function* {
 *      yield put(1) // put 1 in the state
 *      const state = yield get // get the state
 *      yield modify(s => s++) // modify state
 *      return yield get // get the state and return it
 *    },
 *    retVal => console.log(retVal),
 *    [],
 *    { state: 0 } // pass the initial value of the state
 *  )
 *
 */
class State extends Monad {
  join(stack, cb) {
    const fst = stack[0]
    const { state } = fst.data || { state: null }
    const [newValue, newState ] = this.state(state)
    fst.data = Object.assign(fst.data || {}, { state: newState })
    cb(stack[0].doBlock.next(wrap(newValue, stack.length)))
  }
}


/**
 * @member
 * @type State
 * @description get state the yield expression will evaluate to the current
 * state value
 */
const get = {
  __proto__: State.prototype,
  state: s => [s,s],
}

/**
 * @member
 * @function put
 * @description put new value in the state
 * @parm {any} s
 * @return {State}
 */
function put(s) {
  return {
    __proto__: put.prototype,
    state: _ => [null, s],
  }
}
put.prototype = {
  __proto__: State.prototype,
}

/**
 * @member 
 * @function modify
 * @description modify the state in-place
 * @param {Function} !modify the function is passed the state and it should
 * return a new state
 * @return {State}
 */
function modify(f) {
  return {
    __proto__: modify.prototype,
    state: s => [null, f(s)],
  }
}
modify.prototype = {
  __proto__: State.prototype,
}

module.exports = {
  State,
  get,
  put,
  modify,
}
