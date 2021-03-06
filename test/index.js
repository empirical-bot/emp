/* eslint-env mocha */

var waitForIt = require('./wait-for-it')
var assert = require('assert')
var fs = require('fs')
var debug = require('debug')('emp')

// Test data
const test_standalone = {full_name: 'empiricalci/hello-world/hello-world/4JAq0-vCl'}
const standalone_with_data = {full_name: 'empiricalci/hello-world/hello-world/r1Q7q9YM'}
const standalone_with_workspace = {full_name: 'empiricalci/hello-world/hello-world/SywuYx17'}
const test_solver = {full_name: 'empirical-bot/my-solver/my-solver/VJsNP7PCe'}
const test_evaluator = {full_name: 'empirical-bot/my-evaluator/my-evaluator/4JDL-aGgW'}

const admin = {
  key: '56f21e9c444d700624705d16',
  secret: 'e6bbfb2b-f608-48a8-8a60-c78df6c2bb97'
}

const user = {
  key: '56fa1e9c444d666624705d15',
  secret: '9b01c60c-56de-4ff2-8604-802c99f11d72'
}

// Use user credentials
process.env.EMPIRICAL_API_KEY = user.key
process.env.EMPIRICAL_API_SECRET = user.user

function logHandler (log) {
  debug(log)
}

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

describe.skip('Server dependant tests', function () {
  before(function (done) {
    this.timeout(30000)
    waitForIt(process.env.EMPIRICAL_API_URI, done)
  })
  describe('Client', function () {
    var client = require('../lib/client')
    it('should update experiment', function (done) {
      this.timeout(5000)
      client.updateExperiment(test_standalone.full_name, {
        status: 'test'
      }).then(function (res) {
        assert.equal(res.status, 'test')
        done()
      }).catch(done)
    })
    it.skip('should get a build', function (done) {
      this.timeout(5000)
      client.getBuild(test_solver.full_name).then(function (build) {
        assert.equal(test_solver.full_name, build.full_name)
        done()
      }).catch(done)
    })
    it('should get project keys', function (done) {
      this.timeout(5000)
      client.getKeys('empiricalci/hello-world').then(function (res) {
        assert(res.public_key)
        assert(res.private_key)
        done()
      }).catch(done)
    })
  })

  describe('runTask', function () {
    this.timeout(300000)
    var emp = require('../lib')
    // Change credentials
    emp.client.setAuth(
      admin.key,
      admin.secret
    )
    it('should run a standalone experiment', function (done) {
      emp.runTask(test_standalone, logHandler).then(function (experiment) {
        assert.ifError(experiment.error)
        assert.equal(experiment.status, 'success')
        done()
      }).catch(done)
    })
    it('should run a standalone experiment with data', function (done) {
      emp.runTask(standalone_with_data, logHandler).then(function (experiment) {
        assert.ifError(experiment.error)
        assert.equal(experiment.status, 'success')
        done()
      }).catch(done)
    })
    it('should run a standalone experiment with output to workspace', function (done) {
      emp.runTask(standalone_with_workspace, logHandler).then(function (experiment) {
        assert.ifError(experiment.error)
        assert.equal(experiment.status, 'success')
        done()
      }).catch(done)
    })
    it.skip('should run an evaluator', function (done) {
      emp.runTask(test_evaluator).then(function () {
        done()
      }).catch(done)
    })
    it.skip('should run a solver', function (done) {
      emp.runTask(test_solver).then(function () {
        done()
      }).catch(done)
    })
  })
})

