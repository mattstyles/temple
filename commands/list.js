
'use strict'

/**
 * Lists available template files
 *
 * @example
 *   tmpl ls
 */

const baseDir = require( 'xdg-basedir' )


exports.command = 'list'
exports.description = 'Lists available template files'
exports.builder = {}

exports.handler = function( argv ) {
  console.log( 'list' )


}
