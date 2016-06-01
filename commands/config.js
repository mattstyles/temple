
'use strict'

/**
 * Sets and displays current config options
 *
 * @example
 *   temple config path.data ~/.data
 *   temple config path.data
 *   temple config --rm path.data
 */

const prompt = require( 'inquirer' ).prompt
const usage = require( '../utils/usage' )
const conf = require( '../utils/conf' )()
const pkg = require( '../package.json' )


module.exports = function( opts ) {
  // Handle showing everything from config
  if ( opts.all ) {
    console.log( JSON.stringify( conf.all ) )
    return
  }

  // Handle remove or delete flags
  if ( opts.rm ) {
    let key = opts.rm === true
      ? opts._[ 0 ]
      : opts.rm

    if ( !key ) {
      console.log( `${ pkg.shortname }: Specify key to remove` )
      console.log( `See '${ pkg.shortname } config --help'` )
      return
    }

    let value = conf.get( key )

    if ( typeof value === 'object' ) {

      if ( opts.force ) {
        conf.del( key )
        return
      }

      // Prompt for confirmation
      prompt([
        {
          type: 'confirm',
          name: 'remove',
          message: `'${ key }' is a nested value, are you sure you want to delete?`,
          default: false
        }
      ]).then( answers => {
        if ( answers.remove ) {
          conf.del( key )
          return
        }
      })

      return
    }

    conf.del( key )
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
    console.log( JSON.stringify( conf.get( key ) ) )
    return
  }

  conf.set( key, value )
}
