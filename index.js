
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

  return {
    run: function( cmd, args ) {

      if ( commands[ cmd ] ) {
        return commands[ cmd ]( Object.assign( opts, {
          _: args
        }))
      }

      console.log( `'${ cmd }' is not a command` )
      console.log( `See 'tmpl --help'` )
    }
  }
}

module.exports = tmpl
