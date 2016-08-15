
var prettyjson = require('prettyjson')
var colors = require('colors/safe')

exports.section = function (title) {
  console.log(colors.white.bold(title))
}

exports.write = function (text) {
  process.stdout.write(text)
}

exports.json = function (json) {
  console.log(prettyjson.render(json))
}
