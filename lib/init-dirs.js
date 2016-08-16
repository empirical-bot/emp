
const mkdirMaybe = require('./mkdir-maybe')
const config = require('../config')

module.exports = function () {
  return mkdirMaybe(config.data_dir).then(function () {
    return mkdirMaybe(config.workspaces)
  })
}
