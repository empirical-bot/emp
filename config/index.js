
const env = require('node-env-file')

var config = {}

config.config_filename = 'empirical.yml'
config.env_file = `${process.env.HOME}/.emp/emp.env`

// Load env config vars: EMPIRICAL_DIR & EMPIRICAL_AUTH
env(config.env_file)

// Define dirs
config.data_dir = `${process.env.EMPIRICAL_DIR}/data`
config.workspaces = `${process.env.EMPIRICAL_DIR}/workspaces`

module.exports = config
