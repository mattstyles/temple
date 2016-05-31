
'use strict'

/**
 * Sets and displays current config options
 *
 * @example
 *   temple config path.data ~/.data
 */

const usage = require( '../utils/usage' )
const conf = require( '../utils/conf' )()
const pkg = require( '../package.json' )

module.exports = function( opts ) {
  // Handle remove or delete flags
  if ( opts.rm ) {
    let target = opts.rm === true
      ? opts._[ 0 ]
      : opts.rm

    if ( !target ) {
      console.log( `{ pkg.shortname }: Specify key to remove` )
      console.log( `See 'temple config --help'` )
      return
    }

    let value = conf.get( target )

    if ( typeof value === 'object' ) {
      // @TODO prompt for confirmation on nested value
    }

    conf.del( target )
    return
  }

  // Handle no options passed to config command
  if ( !opts._ || !opts._.length ) {
    usage( 'config' )
    return
  }

  let key = opts._[ 0 ]
  let value = opts._[ 1 ]

  // Get or set based on number of arguments
  if ( !value ) {
    console.log( conf.get( key ) )
    return
  }

  return conf.set( key, value )
}
