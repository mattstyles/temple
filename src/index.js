
const fs = require('fs')
const path = require('path')
const pkg = require('../package.json')

const basename = ext => str => path.basename(str, ext)

const modulePath = path.join(__dirname, 'modules')

const findCommand = cmd => fs
  .readdirSync(modulePath)
  .map(basename('.js'))
  .filter(command => command === cmd)
  .map(command => {
    return require(path.join(modulePath, cmd))
  })[0]

const temple = (cmd, args) => {
  let command = findCommand(cmd)

  if (!command) {
    console.log(`${cmd} is not a command`)
    console.log(`See '${pkg.shortname} --help'`)
    return
  }

  command({
    _: args
  })
}

module.exports = temple
