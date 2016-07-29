
var Git = require('nodegit')

exports.cloneRepository = function (git_repo, sha, keys, code_dir) {
  var opts = {
    fetchOpts: {
      callbacks: {
        certificateCheck: function () {
          return 1
        }
      }
    }
  }
  if (keys) {
    opts.fetchOpts.callbacks.credentials = function (url, user) {
      return Git.Cred.sshKeyNew(
        user,
        keys.public_key,
        keys.private_key,
        ''
      )
    }
  }
  return Git.Clone(git_repo, code_dir, opts).then(function (repo) {
    if (sha) {
      return repo.getCommit(Git.Oid.fromString(sha)).then(function (commit) {
        return Git.Reset.reset(repo, commit, Git.Reset.TYPE.HARD).then(function () {
          return repo
        })
      })
    }
    return repo
  })
}
