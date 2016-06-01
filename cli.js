#!/usr/bin/env node

'use strict'

const fs = require( 'fs' )
const meow = require( 'meow' )
const temple = require( './' )
const usage = require( './lib/usage' )
const alias = require( './lib/alias' )

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
    d: 'data'
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
temple( cli.flags )
  .run( cmd, cli.input.slice( 1 ) )
