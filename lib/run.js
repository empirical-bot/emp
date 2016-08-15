
var emp = require('.')
var logger = require('./logger')
var colors = require('colors')

module.exports = function (experiment_name, dir) {
  Promise.resolve(dir).then(function (code_dir) {
    // Get code dir
    if (code_dir) {
      return Promise.resolve({
        code_dir: process.env.CODE_DIR,
        name: experiment_name
      })
    } else {
      return Promise.reject(new Error('Error: emp run requires a code path'))
    }
  }).then(function (params) {
    const code_dir = params.code_dir
    // Get experiment configuration
    logger.section('EXPERIMENT:')
    var experiment = emp.readExperimentConfig(code_dir, {
      name: params.name
    })
    logger.json(experiment)
    // Build docker Image
    logger.section('BUILD:')
    emp.buildImage(experiment.environment, code_dir, function (data) {
      process.stdout.write(data)
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
    })
  }).catch(function (err) {
    console.log(err)
    console.log(colors.red.bold('Failed'))
  })
}

