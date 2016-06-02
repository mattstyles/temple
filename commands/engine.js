
'use strict'

/**
 * Manages the currently configured templating engines
 *
 * @example
 *   temple engine --all
 *   temple engine hogan
 *   temple engine hogan.extensions "hbs hogan hulk"
 *   temple engine --install hogan
 *   temple engine --rm hogan
 */

const usage = require( '../lib/usage' )
const conf = require( '../lib/conf' )()
const pkg = require( '../package.json' )

/**
 * Manages behaviours surrounding the templating engines
 */
module.exports = function( opts ) {
  let engines = conf.get( 'engines' )

  console.log( 'engines' )
  console.log( engines )
  if ( opts.all ) {
    if ( opts.json ) {
      process.stdout.write( JSON.stringify( ))
    }
    // @TODO make tabular
    engines.forEach( )
    return
  }
}
