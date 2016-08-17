
var data = require('./lib/data')
var usage = require('./lib/usage')
var configure = require('./lib/config').update
var auth = require('./lib/auth')
var run = require('./lib/run')

function version () {
  const emp_version = require('./package.json').version
  console.log(`emp version: ${emp_version}`)
}

function execute (args) {
  switch (args[2]) {
    case 'run':
      return run(args[3], args[4])
    case 'configure':
      return configure()
    case 'login':
      return auth.login()
    case 'logout':
      return auth.logout()
    case 'data':
      return data(args[3])
    case 'version':
      return version()
    default:
      return usage.main()
  }
}

execute(process.argv).then(function () {
  // Exit normally
  process.exit(0)
}).catch(function () {
  // Exit with an error
  process.exit(1)
})
