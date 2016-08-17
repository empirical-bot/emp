/* eslint-env mocha */

var assert = require('assert')
var fs = require('fs')
var debug = require('debug')('emp')
var path = require('path')

function logHandler (log) {
  debug(log)
}

const ENV_FILE = path.join(process.env.HOME, '/.emp/emp.env')

before(function (done) {
  // Move config file if it exists
  fs.lstat(ENV_FILE, function (err, stats) {
    if (err) return done()
    if (stats.isFile()) {
      fs.rename(ENV_FILE, `${ENV_FILE}.bak`, function (err) {
        if (err) return done(err)
        done()
      })
    } else {
      done()
    }
  })
})

describe('config', function () {
  var config = require('../lib/config')
  it('.load() should create a default config file if there is none', function (done) {
    config.load().then(function () {
      assert(fs.lstatSync(ENV_FILE).isFile())
      assert.equal(process.env.EMPIRICAL_DIR, `${process.env.HOME}/empirical`)
      assert.equal(process.env.DATA_PATH, `${process.env.HOME}/empirical/data`)
      assert.equal(process.env.WORKSPACES_PATH, `${process.env.HOME}/empirical/workspaces`)
      done()
    }).catch(done)
  })
  const newDir = '/tmp/empirical'
  it('.save() should save updated variables', function (done) {
    process.env.EMPIRICAL_DIR = newDir
    config.save()
    fs.readFile(ENV_FILE, 'utf8', function (err, content) {
      assert.ifError(err)
      assert(content.indexOf(`EMPIRICAL_DIR=\"${newDir}\"`) > -1, 'Variable not saved')
      done()
    })
  })
  it('.load() should load the env variables if the file exists', function (done) {
    config.load().then(function () {
      assert.equal(process.env.EMPIRICAL_DIR, newDir)
      assert.equal(process.env.DATA_PATH, `${newDir}/data`)
      assert.equal(process.env.WORKSPACES_PATH, `${newDir}/workspaces`)
      done()
    }).catch(done)
  })
  it('.update() should allow to interactively set EMPIRICAL_DIR')
})

describe('auth', function () {
  it('.login() should save credentials when valid')
  it('.login() should not save credentials when invalid')
  it('.logout() should clear credentials')
})

describe('data', function () {
  it('.get(url) should save and log dataset')
  it('hash file should log the hash of the file')
})

describe('usage', function () {
  it('.main() should describe the main usage')
  it('.data() should describe the data subcommand usage')
  it('.run() should describe the run subcommand usage')
})

describe('run()', function () {
  const run = require('../lib/run')
  it('should run an experiment', function (done) {
    this.timeout(60000)
    run('hello-world', 'node_modules/fixtures/standalone_project')
    .then(done)
    .catch(done)
  })
  it('should fail if no code path is given', function (done) {
    run('hello-world')
    .then(function () {
      done(new Error('Didn\'t throw error without a code path'))
    })
    .catch(function (err) {
      assert.equal(err.message, 'Error: emp run requires a code path')
      done()
    })
  })
  it('should fail if the experiment-name is not found')
})

describe('Library', function () {
  var emp = require('../lib')
  it('should clone a repo into a temp directory', function (done) {
    this.timeout(300000)
    var repo = 'git@github.com:empiricalci/hello-world.git'
    var keys = {
      public_key: fs.readFileSync('./node_modules/fixtures/test_keys/test_key.pub', 'utf8'),
      private_key: fs.readFileSync('./node_modules/fixtures/test_keys/test_key', 'utf8')
    }
    var sha = 'a574f888bdb8f286fd827263794b8aace413dcec'
    emp.getCodeDir(repo, sha, keys).then(function (codeDir) {
      assert(fs.lstatSync(codeDir).isDirectory())
      done()
    }).catch(done)
  })
  describe('readExperimentConfig', function () {
    it('should succed with valid standalone config', function () {
      var experiment = emp.readExperimentConfig('./node_modules/fixtures/standalone_project', {
        _id: '342434234',
        name: 'hello-world',
        type: 'standalone'
      })
      assert.equal(experiment.type, 'standalone')
      assert(experiment.environment.tag)
    })
    it('should fail if a solver experiment config does not contain evaluator')
  })
  it('should get a datset')
  describe('runExperiment', function () {
    it('should run a sandalone experiment', function (done) {
      this.timeout(300000)
      emp.runExperiment({
        _id: 'some_id',
        type: 'standalone',
        environment: {
          tag: 'empiricalci/test_standalone'
        }
      }).then(function () {
        done()
      }).catch(done)
    })
  })
  it('should cleanup code and credentials')
  describe('buildImage', function () {
    it('should reject if there is an error', function (done) {
      this.timeout(60000)
      emp.buildImage({
        build: '.',
        dockerfile: 'bad_dockerfile'
      }, './test', logHandler).then(function () {
        done(new Error('Build error not caught'))
      }).catch(function (err) {
        assert(err)
        done()
      })
    })
  })
})

after(function (done) {
  // Remove newly created ENV_FILE
  fs.unlinkSync(ENV_FILE)
  // Move original config file if back, if it exists
  fs.lstat(`${ENV_FILE}.bak`, function (err, stats) {
    if (err) return done()
    if (stats.isFile()) {
      fs.rename(`${ENV_FILE}.bak`, ENV_FILE, function (err) {
        if (err) return done(err)
        done()
      })
    } else {
      done()
    }
  })
})
