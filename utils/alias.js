
'use strict'

const defined = require( 'defined' )

/**
 * Map of aliases
 * from -> to
 */
const DEFAULT_ALIASES = {
  ls: 'list'
}

/**
 * Returns aliased commands
 */
module.exports = function alias( aliases ) {
  aliases = defined( aliases, DEFAULT_ALIASES )
  return function( cmd ) {
    if ( aliases[ cmd ] ) {
      return aliases[ cmd ]
    }

    return cmd
  }
}
