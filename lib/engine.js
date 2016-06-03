
'use strict'

/**
 * Handles core operations related to the templating engines
 */

const path = require( 'path' )
const util = require( 'util' )
const spawn = require( 'child_process' ).spawn
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

    get: function( name ) {
      return engines.find( engine => engine.name === name )
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
    install: function( name ) {
      return new Promise( ( resolve, reject ) => {
        let engine = core.get( name )

        if ( !engine ) {
          throw new NotFoundError( 'Engine not found' )
        }

        if ( !engine.module ) {
          throw new EngineError( 'Can not find module name to install' )
        }

        spawn( 'npm', [
          'install', engine.module
        ], {
          stdio: 'inherit',
          cwd: path.join( __dirname, '../' )
        })
          .on( 'close', resolve )
          .on( 'error', reject )
      })
    }
  }

  return core
}


module.exports = engineCore
