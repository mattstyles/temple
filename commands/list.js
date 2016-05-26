
'use strict'

/**
 * Lists available template files
 *
 * @example
 *   tmpl list
 */

const fs = require( 'fs' )
const path = require( 'path' )
const store = require( '../utils/store' )

/**
 * Lists all templates currently held by the store
 */
module.exports = function list( opts ) {
  opts = opts || {}
  let templates = store( opts.dataDir || null )

  templates.getAll()
    .map( name => name + '\n' )
    .forEach( process.stdout.write, process.stdout )
}
