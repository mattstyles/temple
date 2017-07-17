
/**
 * Wraps npm install in a promise
 */

const path = require('path')
const spawn = require('child_process').spawn

const DEFAULT_INSTALL_PATH = path.join(__dirname, '../')

module.exports = function install (modules, installPath) {
  return new Promise((resolve, reject) => {
    spawn('npm', [
      'install', ...modules
    ], {
      stdio: 'inherit',
      cwd: installPath || DEFAULT_INSTALL_PATH
    })
      .on('close', resolve)
      .on('error', reject)
  })
}
