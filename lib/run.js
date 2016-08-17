
var path = require('path')
var colors = require('colors')
var initDirs = require('./init-dirs')
var readProtocol = require('./read-protocol')
var buildImage = require('./build-image')
var cache = require('dataset-cache')
var runExperiment = require('./run-experiment')
var results = require('./results')

module.exports = function (experiment_name, code_dir, logger) {
  // Get code dir
  if (!code_dir) return Promise.reject(new Error('Error: emp run requires a code path'))
  // Make sure it's an absolute path
  code_dir = path.resolve(process.cwd(), code_dir)
  // Get experiment configuration
  logger.section('EXPERIMENT:')
  var experiment = readProtocol(code_dir, experiment_name)
  if (!experiment) return Promise.reject(new Error(`Experiment "${experiment_name}" not found`))
  logger.json(experiment)
  // Build docker Image
  return initDirs().then(function () {
    logger.section('BUILD:')
    return buildImage(experiment.environment, code_dir, logger.write)
  })
  // Get dataset
  .then(function () {
    logger.section('DATASET:')
    if (!experiment.dataset) {
      logger.log('No dataset provided')
      return Promise.resolve()
    }
    const data = require(path.join(code_dir, experiment.dataset))
    return cache.install(data, process.env.DATA_PATH)
    .then(function (data) {
      logger.json(data)
    })
  })
  // Run experiment
  .then(function () {
    logger.section('RUN:')
    return runExperiment(experiment, logger.write)
  })
  // Get Results
  .then(function () {
    logger.section('RESULTS:')
    return results.overall(experiment).then(function (overall) {
      logger.json({overall: overall})
      logger.log(colors.green.bold('Success'))
    })
  }).catch(function (err) {
    logger.log(err)
    logger.log(colors.red.bold('Failed'))
    return Promise.reject(new Error(err.message))
  })
}

