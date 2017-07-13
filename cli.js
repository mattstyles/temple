#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2), {
  alias: {
    h: 'help',
    v: 'verbose',
    rm: 'delete',
    a: 'all',
    f: 'force',
    o: 'output',
    d: 'data',
    i: 'install'
  }
})

const temple = require('./')
const usage = require('./lib/usage')
const alias = require('./lib/alias')

function showHelp (cmd, argv) {
  if (!cmd || cmd === 'help') {
    usage(0)
    return true
  }

  if (cmd === 'version' || argv.version) {
    let pkg = require('./package.json')
    console.log(pkg.shortname, pkg.version)
    return true
  }

  if (argv.help) {
    usage(cmd)
    return true
  }

  return false
}

let cmds = argv._.map(alias)
let cmd = cmds[0]

// Let's go
showHelp(cmd, argv) || temple(cmd, argv)
