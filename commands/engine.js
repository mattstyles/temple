
'use strict'

/**
 * Manages the currently configured templating engines
 *
 * @example
 *   temple engine --all
 *   temple engine --all --json
 *   temple engine hogan
 *   temple engine hogan.extensions hbs hogan hulk
 *   echo '{"module":"hogan.js"}' | temple engine hogan
 *   temple engine hogan < engine.json
 *   temple engine --install hogan
 *   temple engine hogan --install
 *   temple engine --rm hogan
 *   temple engine hogan --rm
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

  /**
   * Remove an engine
   */
  if ( opts.delete ) {
    remove( opts._[ 0 ] || opts.delete )
    return
  }

  /**
   * Show help on 'temple engine'
   */
  if ( !opts._ || !opts._.length ) {
    usage( 'engine' )
    return
  }

  let engines = conf.get( ENGINE_KEY )
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

  // Try setting the specific key for the engine
  let keypath = key.split( '.' )

  // Handle setting the whole meta for an engine
  if ( keypath.length === 1 ) {
    write( keypath[ 0 ] )
    return
  }

  // Handle variadic
  if ( opts._.length > 2 ) {
    value = opts._.slice( 1, opts._.length )
  }

  // Handle setting a specific key
  let engine = engines.find( engine => engine.name === keypath[ 0 ] )
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
 * Writes the engine meta to the conf, grabbing it from stdin
 */
function write( name ) {
  let data = ''
  let engines = conf.get( ENGINE_KEY )

  process.stdin.on( 'data', chunk => data += chunk )
  process.stdin.on( 'end', () => {
    let spec = null
    try {
      console.log( data )
      spec = JSON.parse( data )
    } catch( err ) {
      console.log( `${ pkg.shortname }: Can not parse engine metadata` )
      console.log( `See '${ pkg.shortname } engine --help'` )
      return
    }

    // If the spec contains a name then use that as the key
    if ( spec.name ) {
      name = spec.name
    } else {
      spec.name = name
    }

    let engine = engines.find( engine => engine.name === name )

    // If this is a new engine then just push it on
    if ( !engine ) {
      engines.push( spec )
      conf.set( ENGINE_KEY, engines )
      return
    }

    // Otherwise remove the old copy and replace with this one
    remove( engine.name, spec )
  })
  return
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

/**
 * Removes a specified engine from the meta
 */
function remove( name, spec ) {
  let engines = conf.get( ENGINE_KEY )
  let engine = engines.find( engine => engine.name === name )

  if ( !engine ) {
    console.log( `${ pkg.shortname }: Can not find specified engine` )
    console.log( `See '${ pkg.shortname } engine --help'` )
    return
  }

  let index = engines.indexOf( engine )
  if ( spec ) {
    engines.splice( index, 1, spec )
  } else {
    engines.splice( index, 1 )
  }
  conf.set( ENGINE_KEY, engines )
}
