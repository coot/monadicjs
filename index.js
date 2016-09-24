'use strict'

function do_(doBlock, cb, recieved=null, done) {
  if (done)
    return typeof cb === "function" ? cb(recieved) : null;

  const { value: monad, done: done_ } = doBlock.next(recieved)
  if (!done_) 
    monad.join(doBlock, cb)
  else if (typeof cb === "function")
    cb(monad);
}

class MaybeM {
  /*
   * param value
   */
  constructor(value) {
    this.value = value
  }

  join(doBlock, cb) {
    console.log(`MaybeM.join value=${this.value}`)
    if (this.value !== null)
      do_(doBlock, cb, this.value)
    else {
      const { value: monad } = doBlock.return(new MaybeM(null))
      do_(doBlock, cb, monad, true)
    }
  }
}

class PromiseM {
  /*
   * param {Promise} value
   */
  constructor(value) {
    this.value = value
  }

  join(doBlock) {
    this.value
      .then(doBlock.next.bind(doBlock))
      .catch(doBlock.throw.bind(doBlock))
  }
}

if (require.main === module) {

  function* addM() {
    const x = yield new MaybeM(1)
    console.log(`addM: x=${x}`)
    const y = yield new MaybeM(2)
    console.log(`addM: y=${y}`)
    return new MaybeM(x + y)
  }

  const doVal = do_(addM(), m => console.log(`do value: ${m.value}`))
}
