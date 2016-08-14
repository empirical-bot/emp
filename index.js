
var emp = require('./lib')
var prettyjson = require('prettyjson')
var colors = require('colors/safe')
var data = require('./lib/data')
var readline = require('readline')
var fs = require('fs')
var path = require('path')
var client = require('empirical-client')
var usage = require('./lib/usage')

var args = process.argv

function logSection (section) {
  console.log(colors.white.bold(section))
}

function logHandler (line) {
  process.stdout.write(line)
}

function saveConfiguration () {
  var content = ''
  content = `${content}EMPIRICAL_DIR="${process.env.EMPIRICAL_DIR}"\n`
  content = `${content}EMPIRICAL_AUTH="${process.env.EMPIRICAL_AUTH}"\n`
  fs.writeFileSync('/emp.env', content)
}

function configure () {
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
        saveConfiguration()
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

function login () {
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
        saveConfiguration()
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

function logout () {
  process.env.EMPIRICAL_AUTH = ''
  saveConfiguration()
  console.log('Logged out successfully. Cleared credentials.')
}

function pull (experiment) {
  logSection('PULL:')
  return client.getBuild(experiment).then(function (build) {
    return client.getKeys(build.repo.full_name).then(function (keys) {
      console.log('Cloning from', build.repo.ssh_url)
      if (build.push.head_sha) console.log(`Checking out ${build.push.head_sha}`)
      return emp.getCodeDir(build.repo.ssh_url, build.push.head_sha, keys)
    }).then(function (dir) {
      return {
        code_dir: dir,
        name: build.name
      }
    })
  })
}

function run (experiment_name, dir) {
  Promise.resolve(dir).then(function (code_dir) {
    // Get code dir
    if (code_dir) {
      return Promise.resolve({
        code_dir: process.env.CODE_DIR,
        name: experiment_name
      })
    } else {
      return pull(experiment_name)
    }
  }).then(function (params) {
    const code_dir = params.code_dir
    // Get experiment configuration
    logSection('EXPERIMENT:')
    var experiment = emp.readExperimentConfig(code_dir, {
      name: params.name
    })
    console.log(prettyjson.render(experiment))
    // Build docker Image
    logSection('BUILD:')
    emp.buildImage(experiment.environment, code_dir, function (data) {
      process.stdout.write(data)
    })
    // Get dataset
    .then(function () {
      logSection('DATASET:')
      return emp.getDataset(code_dir, experiment.dataset).then(function (data) {
        if (!data) console.log('No dataset provided')
        console.log(prettyjson.render(data))
      })
    })
    // Run experiment
    .then(function () {
      logSection('RUN:')
      return emp.runExperiment(experiment, logHandler)
    })
    // Get Results
    .then(function () {
      logSection('RESULTS:')
      return emp.getResults(experiment).then(function (overall) {
        console.log(prettyjson.render({overall: overall}))
        console.log(colors.green.bold('Success'))
      })
    })
  }).catch(function (err) {
    console.log(err)
    console.log(colors.red.bold('Failed'))
  })
}

function version () {
  const emp_version = require('./package.json').version
  console.log(`emp version: ${emp_version}`)
}

switch (args[2]) {
  case 'run':
    run(args[3], args[4])
    break
  case 'configure':
    configure()
    break
  case 'login':
    login()
    break
  case 'logout':
    logout()
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

