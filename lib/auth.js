
var configuration = require('./configuration')
var client = require('empirical-client')
var readline = require('readline')

exports.login = function () {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  var creds = process.env.EMPIRICAL_AUTH ? new Buffer(process.env.EMPIRICAL_AUTH, 'base64').toString() : ''
  creds = creds.split(':')
  var user = creds.length === 2 ? creds[0] : 'None'
  console.log('Log in with your Empirical credentials. If you don\'t have an account, create one at https://empiricalci.com')
  rl.question(`Username: [${user}]: `, function (newUser) {
    rl.question(`Password: `, function (newPass) {
      if (newUser || newPass) {
        process.env.EMPIRICAL_AUTH = new Buffer(`${newUser}:${newPass}`).toString('base64')
      }
      client.init({host: process.env.EMPIRICAL_API_URI, auth: process.env.EMPIRICAL_AUTH})
      client.getProfile().then(function (profile) {
        configuration.save()
        console.log('Logged in successfully. Stored credentials.')
      }).catch(function (err) {
        if (err.status === 401) {
          console.log('Login failed: Wrong credentials.')
        } else {
          console.log('Something went wrong.')
        }
      })
      rl.close()
    })
  })
}

exports.logout = function () {
  process.env.EMPIRICAL_AUTH = ''
  configuration.save()
  console.log('Logged out successfully. Cleared credentials.')
}
