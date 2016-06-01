
'use strict'

/**
 * Holds the data directory contents
 */

const fs = require( 'fs' )
const path = require( 'path' )
const mkdirp = require( 'mkdirp' )
const basedir = require( 'xdg-basedir' )
const pkg = require( '../package.json' )
const conf = require( './conf' )()

/**
 * The default path is stored in the config
 * @type <String>
 */
const DEFAULT_PATH = conf.get( 'path.data' )

/**
 * Returns the store manager object
 * @param dataDir <String> the path to the data directory
 */
module.exports = function store( dataDir ) {
  dataDir = dataDir || DEFAULT_PATH

  // Make sure the directory exists
  mkdirp.sync( dataDir )

  return {
    /**
     * Grabs all files in the data directory and strips the extension
     */
    getAll: function() {
      return fs.readdirSync( dataDir )
        .map( name => name.replace( path.extname( name ), '' ) )
    },

    /**
     * Grabs a single template file from the data directory
     * @param name <String>
     */
    get: function( name ) {
      if ( !name ) {
        throw new Error( 'No template specified' )
      }

      let file = fs.readdirSync( dataDir )
        .find( filename => new RegExp( name ).test( filename ) )

      if ( !file ) {
        // @TODO create specific errors
        throw new Error( 'ENOENT' )
      }

      return {
        contents: fs.readFileSync( path.join( dataDir, file ), {
          encoding: 'utf8'
        }),
        filename: file,
        template: name,
        ext: path.extname( file ).replace( /^\./, '' )
      }
    }
  }
}
