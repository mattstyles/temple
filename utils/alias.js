
'use strict'

const alias = require( '@mattstyles/alias' )

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
const aliases = alias( DEFAULT_ALIASES )
module.exports = function getAlias( cmd ) {
  return aliases( cmd )
}
