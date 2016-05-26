
'use strict'

const fs = require( 'fs' )
const path = require( 'path' )
const util = require( 'util' )
const root = require( 'app-root-dir' ).get()

function end( code ) {
  return function() {
    process.exit( code || 0 )
  }
}

module.exports = function usage( cmd, code ) {
  if ( util.isNumber( cmd ) || !cmd ) {
    code = cmd || 0
    cmd = 'help'
  }
  let file = path.join( root, 'man', cmd + '.txt' )

  fs.createReadStream( file )
    .once( 'end', end( code ) )
    .on( 'error', function( err ) {
      if ( err.code === 'ENOENT' ) {
        console.log( 'Can not find help for this command' )
        return
      }

      console.log( 'Something went wrong...' )
    })
    .pipe( process.stdout )
}
