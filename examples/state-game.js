/** @module */
"use strict"

const { do: do_, get, put } = require("../index.js")

/**
 * @description simple state game what in Haskell can be written as:
 *    ```Haskell
 *    playGame [] = get
 *    playGame (x:xs) = do
 *      (on, score) <- get
 *      case x of
 *        'a' | on -> put (on, score + 1)
 *        'b' | on -> put (on, score - 1)
 *        'c'      -> put (not on, score)
 *        _        -> put (on, score)
 *      playGame xs
 *    ```
 */
function stateGame(actions) {
  return function*(stack) {
    if (actions.length === 0)
      return yield get

    const [on, score] = yield get
    switch (actions[0]) {
        case 'a':
          if (on)
            yield put([on, score + 1])
          break
        case 'b':
          if (on)
            yield put([on, score - 1])
          break
        case 'c':
          yield put([!on, score])
          break
        default:
          yield put([on, score])
    }
    return yield* do_(stateGame(actions.slice(1)), null, stack)
  }
}

module.exports = stateGame
