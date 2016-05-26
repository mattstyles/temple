
'use strict'

/**
 * Holds the data directory contents
 */

const fs = require( 'fs' )
const path = require( 'path' )
const mkdirp = require( 'mkdirp' )
const basedir = require( 'xdg-basedir' )
const pkg = require( '../package.json' )

const DEFAULT_PATH = path.join( basedir.data, pkg.shortname )

module.exports = function store( dataDir ) {
  dataDir = dataDir || DEFAULT_PATH
  // Make sure the directory exists
  mkdirp.sync( dataDir )

  return {
    /**
     * Grabs all files in the directory and strips the extension
     */
    getAll: function() {
      return fs.readdirSync( dataDir )
        .map( name => name.replace( path.extname( name ), '' ) )
    }
  }
}
