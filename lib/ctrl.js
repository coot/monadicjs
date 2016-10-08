/** @module */
"use strict";

/**
 * @generator controller generator which controlls another generator
 *  you can call `controller.next({done: true, value: 1})` to finish yielding
 *  from the wrapped genarator with value `1` or `controller.next({done:
 *  false, value: 1})` to pass the value `1` to the inner `gen`.  Controller
 *  will not check if `gen` has finished, but it will yield `{done: true,
 *  value: ...}`.  The wrapped generator yields the result of calling
 *  `gen.next` method.
 * @param {generator} gen
 */
function* controller(gen, stack, id) {
  let ret,
    genRet = gen.next()
  while (true) {
    if (genRet.done) {
      /*
       * When returning unwrap the value.  This breaks symmetry between
       * `yield` and `return`, but is necessary to get correct value when
       * using `yield*`.
       */
      return genRet.value
    } else
      ret = yield genRet
    if (ret.done) {
      // leave one step, the yielded null value is ignored
      yield null
      // the same `return` note applies to this return statement 
      return ret.value
    } else {
      genRet = gen.next(ret.value)
    }
  }
}

module.exports = controller
