
'use strict'

/**
 * Writes out a specific template file to the current path
 *
 * @example
 *   tmpl write .gitignore
 */

exports.command = 'write'

exports.description = 'Writes specific template files to a location'

exports.builder = {}

exports.handler = function( argv ) {

  console.log( 'writing files' )
  console.log( argv )
}
