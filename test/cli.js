/* eslint-env mocha */

const spawn = require('child_process').spawn
const exec = require('child_process').exec
const assert = require('assert')
const setup = require('./setup')
const path = require('path')
// const debug = require('debug')('emp')

const ENV_FILE = path.join(process.env.HOME, '/.emp/emp.env')

before(function (done) {
  process.env.EMPIRICAL_HOST = 'http://localhost:1337'
  setup.backupConfig(ENV_FILE, done)
})

describe('emp configure', function () {
  const emp = spawn('node', ['index.js', 'configure'])
  emp.stderr.on('data', function (err) {
    console.log(err.toString())
  })
  it('prompts to change the default empirical directory', function (done) {
    this.timeout(30000)
    function handler (data) {
      assert.equal(data.toString(), `Empirical directory [${process.env.HOME}/empirical]: `)
      emp.stdout.removeListener('data', handler)
      done()
    }
    emp.stdout.once('data', handler)
  })
  it('receives the new empirical directory from stdin', function (done) {
    this.timeout(30000)
    emp.stdin.write('/tmp/emp\n')
    function handler (data) {
      assert.equal(data.toString(), 'Saved new empirical directory: /tmp/emp\n')
      done()
    }
    emp.stdout.once('data', handler)
  })
  it('Fails if passed a non-absolute directory')
})

describe('emp run', function () {
  it('runs the experiment', function (done) {
    this.timeout(60000)
    exec('node index.js run hello-world node_modules/fixtures/standalone_project', function (err, stdout, stderr) {
      if (err) return done(err)
      console.log(stdout)
      done()
    })
  })
})

describe('emp data', function () {
  it('get url should save and log dataset')
  it('hash file should log the hash of the file')
})

describe('emp login', function () {
  it('prompts to input user')
  it('promprs to input password')
})

describe('emp logout', function () {
  it('clears credentials and logs confirmation')
})

after(function (done) {
  setup.resetConfig(ENV_FILE, done)
})
