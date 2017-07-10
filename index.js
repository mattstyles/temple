
const fs = require('fs')
const path = require('path')
const pkg = require('./package.json')

const temple = function (opts) {
  let commands = fs.readdirSync(path.join(__dirname, 'commands'))
    .map(filename => filename.replace(/\.js$/, ''))
    .reduce((cmds, cmd) => {
      if (!cmds[ cmd ]) {
        try {
          cmds[ cmd ] = require(path.join(__dirname, 'commands', cmd))
        } catch (err) {
          throw new Error(err)
        }

        return cmds
      }
    }, {})

  return Object.assign(commands, {
    run: function (cmd, args) {
      if (!commands[ cmd ]) {
        console.log(`${pkg.shortname}: '${cmd}' is not a command`)
        console.log(`See '${pkg.shortname} --help'`)
        return
      }

      // Run command
      commands[ cmd ](Object.assign(opts, {
        _: args
      }))
    }
  })
}

module.exports = temple
