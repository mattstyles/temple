
'use strict'

/**
 * Handles core operations related to the templating engines
 */

const pkg = require( '../package.json' )
const conf = require( './conf' )()

const ENGINE_KEY = 'engines'


const engine = function( engines ) {

  let core = {
    /**
     * Writes the engine meta to the conf, grabbing it from stdin
     */
    // write: function( name ) {
    //   return new Promise( ( resolve, reject ) => {
    //     let data = ''
    //     let engines = conf.get( ENGINE_KEY )
    //
    //     process.stdin.on( 'data', chunk => data += chunk )
    //     process.stdin.on( 'end', () => {
    //       let spec = null
    //       try {
    //         spec = JSON.parse( data )
    //       } catch( err ) {
    //         // console.log( `${ pkg.shortname }: Can not parse engine metadata` )
    //         // console.log( `See '${ pkg.shortname } engine --help'` )
    //         reject( err )
    //         return
    //       }
    //
    //       // If the spec contains a name then use that as the key
    //       if ( spec.name ) {
    //         name = spec.name
    //       } else {
    //         spec.name = name
    //       }
    //
    //       let e = engines.find( engine => engine.name === name )
    //
    //       // If this is a new engine then just push it on
    //       if ( !e ) {
    //         engines.push( spec )
    //         conf.set( ENGINE_KEY, engines )
    //         resolve()
    //         return
    //       }
    //
    //       // Otherwise remove the old copy and replace with this one
    //       engine.remove( e.name, spec )
    //       resolve()
    //     })
    //   })
    // },

    write: function( name, spec ) {
      let exists = engines.find( e => e.name === name )

      if ( exists ) {
        core.remove( name )
        return core.write( name, spec )
      }

      engines.push( spec )

      return engines
    },

    writeKey: function( name, key, value ) {
      let exists = engines.find( e => e.name === name )
      exists[ key ] = value
      return engines
    },

    remove: function( name ) {
      let exists = engines.find( e => e.name === name )
      if ( exists ) {
        engines.splice( engines.indexOf( exists ), 1 )
      }

      return engines
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

      return engines
    },

    /**
     * Installs a specific template engine
     */
    // install: function( name, done ) {
    //   if ( !done ) {
    //     done = function() {}
    //   }
    //
    //   let engines = conf.get( ENGINE_KEY )
    //
    //   // Check that we have meta data for the supplied engine
    //   let e = engines.find( engine => engine.name === name )
    //   if ( !e ) {
    //     console.log( `${ pkg.shortname }: Can not find specified engine` )
    //     console.log( `See '${ pkg.shortname } engine --help'` )
    //     return
    //   }
    //
    //   // Try to install the specified module
    //   // Spawn a child rather include all of npm here
    //   let pr = spawn( 'npm', [
    //     'install',
    //     engine.module
    //   ], {
    //     cwd: path.join( __dirname, '../' )
    //   })
    //
    //   pr.stdout.on( 'data', data => {
    //     console.log( `${ data }` )
    //   })
    //   pr.stderr.on( 'data', data => {
    //     console.error( `${ data }` )
    //   })
    //   pr.on( 'close', code => {
    //     done()
    //   })
    // },

    /**
     * Removes a specified engine from the meta
     */
    // remove: function( name, spec, done ) {
    //   if ( typeof spec === 'function' ) {
    //     return engine.remove( name, null, spec )
    //   }
    //
    //   if ( !done ) {
    //     done = function() {}
    //   }
    //
    //   let engines = conf.get( ENGINE_KEY )
    //   let e = engines.find( engine => engine.name === name )
    //
    //   if ( !e ) {
    //     console.log( `${ pkg.shortname }: Can not find specified engine` )
    //     console.log( `See '${ pkg.shortname } engine --help'` )
    //     return
    //   }
    //
    //   let index = engines.indexOf( e )
    //   if ( spec ) {
    //     engines.splice( index, 1, spec )
    //   } else {
    //     engines.splice( index, 1 )
    //   }
    //   conf.set( ENGINE_KEY, engines )
    //
    //   done()
    // }
  }

  return core
}


module.exports = engine
