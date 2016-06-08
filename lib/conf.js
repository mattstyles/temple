
'use strict'

/**
 * Manages the config
 */

const path = require( 'path' )
const Configstore = require( 'configstore' )
const pkg = require( '../package.json' )
const basedir = require( 'xdg-basedir' )

/**
 * Returns a new instance of the config store object
 * These are keyed by name and each instance will always point to the same data
 * @param name <String> name of the store
 */
module.exports = function conf( name ) {
  let store = new Configstore( name || pkg.shortname, {
    path: {
      data: path.join( basedir.data, pkg.shortname )
    },
    engines: [
      {
        name: 'hogan',
        module: 'hogan.js',
        extensions: [
          'hjs'
        ]
      }
    ]
  })

  return store
}
