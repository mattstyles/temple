#!/usr/bin/env node

'use strict'

const fs = require( 'fs' )
const meow = require( 'meow' )
const tmpl = require( './' )
const usage = require( './utils/usage' )
const alias = require( './utils/alias' )

const cli = meow({
  help: false
}, {
  alias: {
    h: 'help',
    v: 'verbose',
    rm: 'delete'
  }
})
const cmd = alias( cli.input[ 0 ] )

if ( !cmd || cmd === 'help' ) {
  usage( 0 )
  return
}

if ( cmd === 'version' || cli.flags.version ) {
  process.stdout.write( cli.pkg.version )
  return
}

if ( cli.flags.help ) {
  usage( cmd )
  return
}

// Let's go
tmpl( cli.flags )
  .run( cmd, cli.input.slice( 1 ) )
