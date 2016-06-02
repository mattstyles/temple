
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
const cons = require( 'consolidate' )
const store = require( '../lib/store' )
const conf = require( '../lib/conf' )()
const usage = require( '../lib/usage' )
const pkg = require( '../package.json' )
const root = require('app-root-dir').get()
const engine = require( './engine' )

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
      console.error( `See '${ pkg.shortname } list'` )
      return
    }

    console.error( 'Something went wrong...' )
    throw new Error( err )
  }

  if ( opts.engine && opts.engine === 'none' ) {
    process.stdout.write( template.contents )
    return
  }

  // Get data source
  let data = ''
  let source = getData( opts.data )
  source.on( 'data', chunk => {
    data += chunk
  })
  source.on( 'end', () => end( template, data ) )
}


function getData( filepath ) {
  if ( filepath ) {
    return fs.createReadStream( filepath )
  }

  if ( process.stdin.isTTY ) {
    // @TODO allow config to specify the root data filename rather than
    // default to just package.json
    return fs.createReadStream( path.join( root, 'package.json' ) )
  }

  return process.stdin
}

function end( template, data ) {
  let parsed = null
  try {
    parsed = JSON.parse( data )
  } catch( err ) {
    console.log( `${ pkg.shortname }: Can not parse data, try supplying valid json` )
    return
  }

  // @TODO either grab the engine from the opts or try to manually detect it
  // via the file extension
  console.log( template )
  let engines = conf.get( 'engines' )
  let eng = engines.find( e => {
    return e.extensions.find( ext => ext === template.ext )
  })
  console.log( eng )

  // If it is not installed then try to install it
  if ( !eng.installed ) {

  }

  cons[ engine.name ].render( template.contents, parsed )
    .then( res => {
      process.stdout.write( res )
    })
    .catch( err => {
      console.log( '-- oops', err.errno, err.code )
      throw new Error( err )
    })
}
