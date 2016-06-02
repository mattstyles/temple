
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
  let engines = conf.get( ENGINE_KEY )

  console.log( 'engines' )
  console.log( engines )

  if ( opts.all ) {
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

  if ( !opts._ || !opts._.length ) {
    usage( 'engine' )
    return
  }

  let key = opts._[ 0 ]
  let value = opts._[ 1 ]

  // Try getting the engine data
  if ( !value ) {
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
  if ( keypath.length === 1 ) {
    console.log( `${ pkg.shortname }: Invalid keypath` )
    console.log( `${ pkg.shortname }: Keypath should be of the format engine.key` )
    console.log( `See '${ pkg.shortname } engine --help'` )
    return
  }

  // Find engine and set the respective key
  let engine = engines.find( engine => engine.name === keypath[ 0 ] )
  engine[ keypath[ 1 ] ] = value

  conf.set( ENGINE_KEY, engines )
}
