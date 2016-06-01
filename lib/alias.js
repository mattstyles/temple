
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
 * Pass the dictionary to the alias function
 * @type <Function>
 */
const aliases = alias( DEFAULT_ALIASES )

/**
 * Returns aliased commands
 * @param cmd <String>
 * @returns <String>
 */
module.exports = function getAlias( cmd ) {
  return aliases( cmd )
}
