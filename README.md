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
  do_(function*() {
    const fileContent = yield fs.readFile("README.md")
    console.log(fileContent)
  })
```

This is the aim.  The work is in progress!  But an initial working version is
there.  Checkout tests how to experiment with it.
