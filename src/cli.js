#!/usr/bin/env node

// @flow

const temple = require('./')
const usage = require('./core/usage')
const alias = require('./core/alias')
const pkg = require('../package.json')
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

function showHelp (cmd: string, argv): boolean {
  console.log('~~', cmd)
  if (!cmd || cmd === 'help') {
    console.log('no command')
    usage(0)
    return true
  }

  if (cmd === 'version' || argv.version) {
    console.log(pkg.shortname, pkg.version)
    return true
  }

  if (argv.help) {
    usage(cmd)
    return true
  }

  return false
}

const cmds: Array<string> = argv._.map(alias)
const cmd: string = cmds[0]

// Let's go
showHelp(cmd, argv) || temple(cmd, argv)
