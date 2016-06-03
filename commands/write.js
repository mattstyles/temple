
'use strict'

/**
 * Writes out a specific template file to the current path
 *
 * @example
 *   temple write .gitignore.mustache
 *   cat data.json | temple write package.hbs > package.json
 *   template write package < data.json > package.json
 *   temple write package -d data.json > package.json
 *   temple write package -d data.json -o package.json
 *   temple write package.tmpl -d data.json -o package.json --engine hogan
 */

const fs = require( 'fs' )
const path = require( 'path' )
const store = require( '../lib/store' )
const conf = require( '../lib/conf' )()
const usage = require( '../lib/usage' )
const pkg = require( '../package.json' )
const root = require('app-root-dir').get()
const stream = require( '../lib/stream' )
const core = require( '../lib/template' )

/**
 * Grabs some data and a template file and runs the template engine
 * @param opts <Object>
 * @param opts.dataDir <String> specific data directory to use
 */
module.exports = function write( opts ) {
  // Handle no template name passed to write command
  if ( !opts._ || !opts._.length ) {
    usage( 'write' )
    return
  }

  // Grab the store and specified template file
  let templates = store( opts.dataDir || null )
  let template = null

  try {
    template = templates.get( opts._[ 0 ] )
  } catch( err ) {
    if ( err.code === 'ENOENT' ) {
      console.error( `${ pkg.shortname }: Can not find specified template file` )
      console.error( `See '${ pkg.shortname } write --help'` )
      return
    }

    console.error( 'Something went wrong...' )
    throw new Error( err )
  }

  if ( opts.engine && opts.engine === 'none' ) {
    process.stdout.write( template.contents )
    return
  }

  // Get data and render template
  stream( getSource( opts ) )
    .then( render( template ) )
    .catch( err => {
      if ( err instanceof SyntaxError ) {
        console.log( `${ pkg.shortname }: Can not parse data` )
        console.log( `See '${ pkg.shortname } write --help'` )
        return
      }
      console.error( 'Error streaming data source' )
      throw new Error( err )
    })

}

/**
 * Returns a data source to stream from
 */
function getSource( opts ) {
  if ( opts.data ) {
    return fs.createReadStream( opts.data )
  }

  if ( process.stdin.isTTY ) {
    let pkgPath = path.join( root, 'package.json' )
    try {
      fs.accessSync( pkgPath, fs.F_OK )
    } catch( err ) {
      return process.stdin
    }

    return fs.createReadStream( pkgPath )
  }

  // Catch all
  return process.stdin
}

/**
 * Returns a function ready to render a template
 */
function render( template ) {
  return function( data ) {
    // @TODO find engine to use from extension
    // @TODO check that the engine is installed

    core.render({
      template: template.contents,
      data: data,
      engine: 'hogan'
    })
      .then( tmpl => {
        process.stdout.write( tmpl )
      })
      .catch( err => {
        console.log( `${ pkg.shortname }: Error rendering template` )
        console.log( `see '${ pkg.shortname } write --help'` )
        return
      })
  }
}
