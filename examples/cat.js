const fs = require("fs")
const { doP, NodeContinuation } = require("../index")
const argv = require("argv")
const args = argv.run()

doP(function* (stack) {
  const fileContent = yield fs.readFile.bind(null, args.targets[0])

  // the same as `[null, fileContent.toString()]`
  return NodeContinuation.return(fileContent.toString())
})
  .then((ret) => {
    const [err, fileContent] = ret
    if (err)
      return console.error(err.message)
    else
      console.log(fileContent)
  })
