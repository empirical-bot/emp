
const env = require('node-env-file')
const mkdirMabe = require('./mkdir-maybe')
const fs = require('fs')
const path = require('path')
const assert = require('assert')

function loadOrCreateConfig (envFile) {
  return new Promise(function (resolve, reject) {
    fs.lstat(envFile, function (err, stats) {
      if (err && !err.code === 'ENOENT') return reject(err)
      if (err || !stats.File()) {
        return mkdirMaybe(path.dirname(envFile))
        .then(function (dir) {
          fs.writeFileSync(
            envFile,
            `EMPIRICAL_DIR=${process.env.HOME}/empirical`
          )
          resolve()
        })
      } else {
        return resolve()
      }
    })
  }).then(function () {
    env(envFile)
  })
}

module.exports = function () {
  // Check if the file exist
  const envFile = `${process.env.HOME}/.env/emp.env`
  return loadOrCreateConfig(envFile)
  // Setup paths
  .then(function () {
    assert(process.env.EMPIRICAL_DIR, 'There\'s no EMPIRICAL_DIR defined')
    // Define dirs
    var config = {}
    config.data_dir = `${process.env.EMPIRICAL_DIR}/data`
    config.workspaces = `${process.env.EMPIRICAL_DIR}/workspaces`
    config.config_filename = 'empirical.yml'
  })
}
