#!/usr/bin/env node

'use strict'

const fs = require( 'fs' )
const meow = require( 'meow' )
const tmpl = require( './' )
const usage = require( './utils/usage' )

const cli = meow({
  help: false
}, {
  alias: {
    h: 'help'
  }
})
const cmd = cli.input[ 0 ]

if ( !cmd || cmd === 'help' ) {
  usage( 0 )
  return
}

// console.log( cli )

if ( cli.flags.help ) {
  usage( cmd )
  return
}

tmpl( cmd, {
  cmd: cli.input.slice( 1 ),
  flags: cli.flags,
  pkg: cli.pkg
})
