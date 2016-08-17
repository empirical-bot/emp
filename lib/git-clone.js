
const shortid = require('shortid')
const git = require('./git')
var fs = require('fs')
var path = require('path')

module.exports = function (repo, sha, keys) {
  if (!repo) return Promise.reject('Git repository URL not provided')
  // Save keys to disk as a workaround
  // FIXME: Use the from memory. Don't save to disk
  // After: https://github.com/nodegit/nodegit/pull/949
  const dir = '/tmp/'
  const rnd = shortid.generate()
  const key_files = {
    public_key: path.join(dir, `${rnd}-public_key`),
    private_key: path.join(dir, `${rnd}-private_key`)
  }
  fs.writeFileSync(key_files.public_key, keys.public_key + '\n', 'utf8') // TODO: WHYYY??
  fs.writeFileSync(key_files.private_key, keys.private_key, 'utf8')
  const codeDir = path.join(dir, rnd)
  return git.cloneRepository(repo, sha, key_files, codeDir)
  // Validate sha
  .then(function (repo) {
    return repo.getHeadCommit().then(function (commit) {
      if (sha !== commit.sha()) return Promise.reject('Failed getting code')
    }).then(function () {
      return codeDir
    })
  })
  // TODO: Remove the keys
}
