
'use strict'

/**
 * Returns the data from a source
 */

module.exports = function( source ) {
  return new Promise( ( resolve, reject ) => {
    let data = ''

    source.on( 'data', ch => d += ch )
    source.on( 'end', () => resolve( data ) )
    source.on( 'error', err => reject( err ) )
  })
}
