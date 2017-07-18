
const fs = require('fs')
const path = require('path')

/**
 * Returns a function that exits the process with the specified exit code
 */
function end () {
  process.exit(0)
}

/**
 * Displays the documentation for a specific ccommand
 * @param cmd <String> refers to the command, keyed by filename
 */
module.exports = function usage (cmd: string) {
  if (!cmd) {
    cmd = 'help'
  }

  const file = path.join(__dirname, '../../man', cmd + '.txt')

  fs.createReadStream(file)
    .once('end', end)
    .on('error', function (err) {
      if (err.code === 'ENOENT') {
        console.log('Can not find help for this command')
        return
      }

      console.log('Something went wrong...')
      throw new Error(err)
    })
    .pipe(process.stdout)
}
