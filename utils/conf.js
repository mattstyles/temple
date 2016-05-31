
'use strict'

/**
 * Manages the config
 */

const path = require( 'path' )
const Configstore = require( 'configstore' )
const pkg = require( '../package.json' )
const basedir = require( 'xdg-basedir' )

module.exports = function() {
  let store = new Configstore( pkg.shortname, {
    path: {
      data: path.join( basedir.data, pkg.shortname )
    }
  })

  return store
}
