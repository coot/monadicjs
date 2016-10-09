[![Build Status](https://travis-ci.org/coot/monadicjs.svg)](https://travis-ci.org/coot/monadicjs)

# Declarative Monad library for JavaScript

Monads can be very useful for async IO.  They succefully appeared in Haskell.
Haskell provides the `do` notation for executing monnads.  And this library
ports `do` to JavaScript.  Something that looks like this in Haskell

```
  do {
    fileContent <- readFile "README.md"
    putStr fileContent
  }
```

will look like this in JavaScript:
```
  const fs = require("fs")
  do_(function*() {
    const fileContent = yield fs.readFile.bind(null, "README.md")
    console.log(fileContent)
  })
```

Checkout tests how to experiment with it.
