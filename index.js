
var data = require('./lib/data')
var usage = require('./lib/usage')
var configuration = require('./lib/configuration')
var auth = require('./lib/auth')
var run = require('./lib/run')

var args = process.argv

function version () {
  const emp_version = require('./package.json').version
  console.log(`emp version: ${emp_version}`)
}

switch (args[2]) {
  case 'run':
    run(args[3], args[4])
    break
  case 'configure':
    configuration.update()
    break
  case 'login':
    auth.login()
    break
  case 'logout':
    auth.logout()
    break
  case 'data':
    data(args[3])
    break
  case 'version':
    version()
    break
  default:
    usage.main()
}

