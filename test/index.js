/* eslint-env mocha */

var assert = require('assert')
var fs = require('fs')
var debug = require('debug')('emp')

function logHandler (log) {
  debug(log)
}

describe('run()', function () {
  const run = require('../lib/run')
  it('should run an experiment', function (done) {
    this.timeout(60000)
    run('hello-world', 'node_modules/fixtures/standalone_project')
    .then(function (stuff) {
      console.log(stuff)
      done()
    })
    .catch(done)
  })
  it('should fail if no code path is given')
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

