
const readline = require('readline')
const env = require('node-env-file')
const mkdirMaybe = require('./mkdir-maybe')
const fs = require('fs')
const path = require('path')
const assert = require('assert')

const envConfigFile = `${process.env.HOME}/.emp/emp.env`

function loadOrCreateConfig (envFile) {
  return new Promise(function (resolve, reject) {
    fs.lstat(envFile, function (err, stats) {
      if (err && err.code !== 'ENOENT') return reject(err)
      if (err || !stats.isFile()) {
        return mkdirMaybe(path.dirname(envFile))
        .then(function (dir) {
          fs.writeFileSync(
            envFile,
            `EMPIRICAL_DIR=${process.env.HOME}/empirical`
          )
          return resolve()
        })
      } else {
        return resolve()
      }
    })
  }).then(function () {
    env(envFile)
  })
}

exports.load = function () {
  // Check if the file exist
  return loadOrCreateConfig(envConfigFile)
  // Setup paths
  .then(function () {
    assert(process.env.EMPIRICAL_DIR, 'There\'s no EMPIRICAL_DIR defined')
    // Define dirs
    process.env.DATA_PATH = `${process.env.EMPIRICAL_DIR}/data`
    process.env.WORKSPACES_PATH = `${process.env.EMPIRICAL_DIR}/workspaces`
  })
}

function save () {
  var content = ''
  content = `${content}EMPIRICAL_DIR="${process.env.EMPIRICAL_DIR}"\n`
  content = `${content}EMPIRICAL_AUTH="${process.env.EMPIRICAL_AUTH}"\n`
  fs.writeFileSync(envConfigFile, content)
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
