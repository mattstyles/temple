
'use strict'

const fs = require( 'fs' )
const path = require( 'path' )
const util = require( 'util' )

/**
 * Returns a function that exits the process with the specified exit code
 * @param code <Integer> _0_ exit code
 * @returns <Function>
 */
function end( code ) {
  return function() {
    process.exit( code || 0 )
  }
}

/**
 * Displays the documentation for a specific ccommand
 * @param cmd <String> refers to the command, keyed by filename
 * @param code <Integer> _0_ the exit code to display
 */
module.exports = function usage( cmd, code ) {
  if ( util.isNumber( cmd ) || !cmd ) {
    code = cmd || 0
    cmd = 'help'
  }
  let file = path.join( __dirname, '../man', cmd + '.txt' )

  fs.createReadStream( file )
    .once( 'end', end( code ) )
    .on( 'error', function( err ) {
      if ( err.code === 'ENOENT' ) {
        console.log( 'Can not find help for this command' )
        return
      }

      console.log( 'Something went wrong...' )
      throw new Error( err )
    })
    .pipe( process.stdout )
}
