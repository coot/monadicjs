/** @module */
"use strict"


/**
 * @function unwrap
 * @description unwrap an object recieved from a generator
 */
exports.unwrap = function unwrap(obj, idx) {
  while (--idx >= 0)
    obj = obj.value
  return obj
}


/**
 * @function wrap
 * @description wrap an object to sent to a generator
 */
exports.wrap = function wrap(obj, idx) {
  while (--idx >= 0)
    obj = { value: obj, done: false }
  return obj
}
