
const fs = require('fs')
const path = require('path')
const pkg = require('../package.json')
const {basename, id, req, unbox} = require('./core/utils')

const modulePath: string = path.join(__dirname, 'modules')

const findCommand = (cmd: string) => unbox(fs
  .readdirSync(modulePath)
  .map(basename('.js'))
  .filter(id(cmd))
  .map(req(path.join(modulePath, cmd + '.js')))
)

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
