
var fs = require('fs')
var readline = require('readline')
var path = require('path')

function save () {
  var content = ''
  content = `${content}EMPIRICAL_DIR="${process.env.EMPIRICAL_DIR}"\n`
  content = `${content}EMPIRICAL_AUTH="${process.env.EMPIRICAL_AUTH}"\n`
  fs.writeFileSync('/emp.env', content)
}
exports.save = save

exports.update = function update () {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  rl.question(`Empirical directory [${process.env.EMPIRICAL_DIR}]: `, function (newDir) {
    if (newDir) {
      // TODO: Validate that directory exists?
      if (path.isAbsolute(newDir)) {
        // Save new dir
        process.env.EMPIRICAL_DIR = newDir
        save()
        console.log('Saved new empirical directory:', newDir)
      } else {
        console.log('Error: Please provide an absolute path.')
      }
    } else {
      console.log('Empirical directory not changed')
    }
    rl.close()
  })
}
