
'use strict'

/**
 * Manages the currently configured templating engines
 *
 * @example
 *   temple engine --all
 *   temple engine --all --json
 *   temple engine hogan
 *   temple engine hogan.extensions "hbs hogan hulk"
 *   temple engine --install hogan
 *   temple engine --rm hogan
 */

const usage = require( '../lib/usage' )
const conf = require( '../lib/conf' )()
const pkg = require( '../package.json' )

const ENGINE_KEY = 'engines'

/**
 * Manages behaviours surrounding the templating engines
 */
module.exports = function( opts ) {
  /**
   * Show all engine data
   */
  if ( opts.all ) {
    showAll( opts )
    return
  }

  /**
   * Install specific engine if it exists
   */
  if ( opts.install ) {
    install( opts )
    return
  }

  let engines = conf.get( ENGINE_KEY )

  console.log( 'engines' )
  console.log( engines )

  /**
   * Show help on 'temple engine'
   */
  if ( !opts._ || !opts._.length ) {
    usage( 'engine' )
    return
  }

  let key = opts._[ 0 ]
  let value = opts._[ 1 ]

  // Try getting the engine data
  if ( !value && process.stdin.isTTY ) {
    let engine = engines.find( engine => engine.name === key )

    if ( !engine ) {
      console.log( `${ pkg.shortname }: Can not find specified engine` )
      console.log( `See '${ pkg.shortname } engine --help'` )
      return
    }

    // @TODO make tabular
    process.stdout.write( JSON.stringify( engine ) )
    return
  }

  // Otherwise try setting the specific key for the engine
  let keypath = key.split( '.' )
  let engine = engines.find( engine => engine.name === keypath[ 0 ] )

  // Handle setting the whole meta for an engine
  if ( keypath.length === 1 ) {
    // @TODO should be able to pipe a json rep for this engine name
    let meta = ''

    // We should never hit this as we'd treat this as a get request
    if ( process.stdin.isTTY ) {
      console.log( `${ pkg.shortname }: Stream json to describe engine data` )
      console.log( `See '${ pkg.shortname } engine --help'` )
      return
    }

    process.stdin.on( 'data', data => meta += data )
    process.stdin.on( 'end', () => {
      let parsed = null
      try {
        console.log( meta )
        parsed = JSON.parse( meta )
      } catch( err ) {
        console.log( `${ pkg.shortname }: Can not parse engine metadata` )
        console.log( `See '${ pkg.shortname } engine --help'` )
        return
      }

      // If this is a new engine then just push it on
      if ( !engine ) {
        engines.push( parsed )
        conf.set( ENGINE_KEY, engines )
        return
      }

      // Otherwise remove the old copy and replace with this one
      let index = engines.indexOf( engine )
      engines.splice( index, 1, parsed )
    })
    return
  }

  // Set the specific key in the engine
  engine[ keypath[ 1 ] ] = value

  conf.set( ENGINE_KEY, engines )
}

/**
 * Installs a specific template engine
 */
function install( opts ) {

  let key = opts._[ 0 ] || opts.install

  // Check that we have meta data for the supplied engine
}

/**
 * Renders all engine data
 */
function showAll( opts ) {
  let engines = conf.get( ENGINE_KEY )

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
  return
}
