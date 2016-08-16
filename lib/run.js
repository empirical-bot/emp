
var emp = require('.')
var path = require('path')
var logger = require('./logger')
var colors = require('colors')
var initDirs = require('./init-dirs')

module.exports = function (experiment_name, code_dir) {
  // Get code dir
  if (!code_dir) return Promise.reject(new Error('Error: emp run requires a code path'))
  // Make sure it's an absolute path
  code_dir = path.resolve(process.cwd(), code_dir)
  // Get experiment configuration
  logger.section('EXPERIMENT:')
  var experiment = emp.readExperimentConfig(code_dir, {
    name: experiment_name
  })
  logger.json(experiment)
  // Build docker Image
  return initDirs().then(function () {
    logger.section('BUILD:')
    return emp.buildImage(experiment.environment, code_dir, function (data) {
      process.stdout.write(data)
    })
  })
  // Get dataset
  .then(function () {
    logger.section('DATASET:')
    return emp.getDataset(code_dir, experiment.dataset).then(function (data) {
      if (!data) console.log('No dataset provided')
      logger.json(data)
    })
  })
  // Run experiment
  .then(function () {
    logger.section('RUN:')
    return emp.runExperiment(experiment, logger.write)
  })
  // Get Results
  .then(function () {
    logger.section('RESULTS:')
    return emp.getResults(experiment).then(function (overall) {
      logger.json({overall: overall})
      console.log(colors.green.bold('Success'))
    })
  }).catch(function (err) {
    console.log(err)
    console.log(colors.red.bold('Failed'))
    return Promise.reject(new Error(err.message))
  })
}

