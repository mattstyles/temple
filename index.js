
'use strict'

const fs = require( 'fs' )
const path = require( 'path' )
const root = require( 'app-root-dir' ).get()

const tmpl = function( opts ) {

  let commands = fs.readdirSync( path.join( root, 'commands' ) )
    .map( filename => filename.replace( /\.js$/, '' ) )
    .reduce( ( cmds, cmd ) => {
        if ( !cmds[ cmd ] ) {
          try {
            cmds[ cmd ] = require( path.join( root, 'commands', cmd ) )
          } catch( err ) {
            throw new Error( err )
          }

          return cmds
        }
      }, {} )

  return Object.assign( commands, {
    run: function( cmd, args ) {
      if ( !commands[ cmd ] ) {
        console.log( `'${ cmd }' is not a command` )
        console.log( `See 'tmpl --help'` )
      }

      // Run command
      commands[ cmd ]( Object.assign( opts, {
        _: args
      }))
    }
  })
}

module.exports = tmpl
