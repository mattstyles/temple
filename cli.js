#!/usr/bin/env node

const meow = require('meow')
const temple = require('./')
const usage = require('./lib/usage')
const alias = require('./lib/alias')

const cli = meow({
  help: false
}, {
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

function showHelp (cmd, cli) {
  if (!cmd || cmd === 'help') {
    usage(0)
    return true
  }

  if (cmd === 'version' || cli.flags.version) {
    process.stdout.write(cli.pkg.version)
    return true
  }

  if (cli.flags.help) {
    usage(cmd)
    return true
  }

  return false
}

const cmd = alias(cli.input[0])

// Let's go
showHelp(cmd, cli) || temple(cli.flags)
  .run(cmd, cli.input.slice(1))
