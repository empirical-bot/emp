
const cache = require('dataset-cache')
const prettyjson = require('prettyjson')

function get (url) {
  return cache.get({url: url}, process.env.DATA_PATH).then(function (data) {
    // Show source url
    data.url = url
    // Modify to host path
    // Don't display unecessary variables
    delete data.valid
    delete data.cached
    console.log(prettyjson.render(data))
  })
}

function hash (path) {
  return cache.hash(path).then(function (hash) {
    console.log(`${path}\t${hash}`)
  })
}

module.exports = function (subcommand) {
  switch (subcommand) {
    case 'get':
      return get(process.argv[4]).catch(function (err) {
        console.log('ERROR:', err)
      })
    case 'hash':
      return hash(process.env.DATA_FILE).catch(function (err) {
        console.log('ERROR:', err)
      })
    default:
      console.log('Usage: emp data subcommand [args]')
  }
}

