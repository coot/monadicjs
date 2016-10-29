[![Build Status](https://travis-ci.org/coot/monadicjs.svg)](https://travis-ci.org/coot/monadicjs)

# Monad library for JavaScript

Monads can be very useful for async IO.  They succefully appeared in Haskell.
Haskell provides the `do` notation for executing monads.  And this library
ports `do` to JavaScript.  Something that looks like this in Haskell

```Haskell
  do {
    fileContent <- readFile "README.md"
    putStr fileContent
  }
```

will look like this in JavaScript:
```JavaScript
  const fs = require("fs")
  do_(function*() {
    const fileContent = yield fs.readFile.bind(null, "README.md")
    console.log(fileContent)
  })
```

Checkout tests how to experiment with it.

You will not be able to code every monad that one can programm in Haskell (like
the list monad), but a lot is possible with this approach.  Here is what you
can do in Haskell but not with this library:
```Haskell
  do {
    x <- [1,2,3]
    return (2*x)
  } {- [2,4,6] -}
```

# Available monads

* [Maybe](https://github.com/coot/monadicjs/blob/master/lib/maybe.js) [Haskell Maybe](https://wiki.haskell.org/Maybe)
* [Either](https://github.com/coot/monadicjs/blob/master/lib/either.js)
* [Promise](https://github.com/coot/monadicjs/blob/master/lib/promise.js)
* [NodeContinuation](https://github.com/coot/monadicjs/blob/master/lib/node-continuation.js) or node callbacks

# Ideas

* the State monad ([Haskell State monad](https://wiki.haskell.org/State_Monad))
* use a (kind of) state monad for [react-redux](https://github.com/reactjs/react-redux) store
* monad transformers
* [react-redux](https://github.com/reactjs/react-redux) store middleware

