/** @module */
"use strict"


function unwrap(obj, idx) {
  while (--idx >= 0)
    obj = obj.value
  return obj
}


function wrap(obj, idx) {
  while (--idx >= 0)
    obj = { value: obj, done: false }
  return obj
}


exports.unwrap = unwrap
exports.wrap = wrap
