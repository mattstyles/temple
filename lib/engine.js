
'use strict'

/**
 * Handles core operations related to the templating engines
 */

const path = require( 'path' )
const util = require( 'util' )
const spawn = require( 'child_process' ).spawn
const install = require( './install' )
const NotFoundError = require( './errors' ).NotFoundError
const EngineError = require( './errors' ).EngineError

const ENGINE_KEY = 'engines'


const engineCore = function( engines ) {

  let core = {
    /**
     * Writes the spec to the engine, replacing if necessary
     */
    write: function( name, spec ) {
      let engine = core.get( name )

      if ( engine ) {
        core.remove( name )
        return core.write( name, spec )
      }

      engines.push( spec )

      return engines
    },

    /**
     * Sets a specific key for an engine
     */
    writeKey: function( name, key, value ) {
      // If the key is a keypath described as an array
      // then only consider the first key
      if ( util.isArray( key ) ) {
        key = key[ 0 ]
      }

      if ( key === 'extensions' && util.isString( value ) ) {
        value = [ value ]
      }

      let engine = core.get( name )
      engine[ key ] = value
      return engines
    },

    /**
     * Removes an engine
     */
    remove: function( name ) {
      let engine = core.get( name )
      if ( engine ) {
        engines.splice( engines.indexOf( engine ), 1 )
      }

      return engines
    },

    /**
     * Gets via the name of the engine
     */
    get: function( name ) {
      return engines.find( engine => engine.name === name )
    },

    /**
     * Searches for a matching extension
     * Returns the first match it finds
     */
    find: function( ext ) {
      return engines.find( engine => {
        return engine.extensions.find( e => e === ext )
      })
    },

    /**
     * @TODO show tabular without json flag
     */
    show: function( name, opts ) {
      opts = opts || {
        json: false
      }

      let engine = core.get( name )
      process.stdout.write( opts.json ? JSON.stringify( engine ) : engine.name )
    },

    /**
     * Renders all engine data
     */
    showAll: function( opts ) {
      opts = opts || {
        json: false
      }

      if ( opts.json ) {
        process.stdout.write( JSON.stringify( engines ) )
        return
      }

      // @TODO make tabular
      engines
        .map( engine => engine.name + '\n' )
        .forEach( engine => {
          process.stdout.write( engine )
        })
    },

    /**
     * Installs a specific template engine
     */
    install: function( name, installPath ) {
      return new Promise( ( resolve, reject ) => {
        let engine = core.get( name )

        if ( !engine ) {
          throw new NotFoundError( 'Engine not found' )
        }

        if ( !engine.module ) {
          throw new EngineError( 'Can not find module name to install' )
        }

        install( [ engine.module ], installPath )
          .then( () => {
            // No need to write installed key, no longer necessary
            // as temple checks the install directory of the data location
            // resolve( core.writeKey( name, 'installed', true ) )
            resolve( engines )
          })
          .catch( reject )
      })
    }
  }

  return core
}


module.exports = engineCore
