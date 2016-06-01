
'use strict'

/**
 * Writes out a specific template file to the current path
 *
 * @example
 *   temple write .gitignore.mustache
 *   cat data.json | temple write package.hbs > package.json
 *   temple write package -d data.json > package.json
 *   temple write package -d data.json -o package.json
 *   temple write package.tmpl -d data.json -o package.json --engine hogan
 */

const store = require( '../lib/store' )
const usage = require( '../lib/usage' )

/**
 * Grabs some data and a template file and runs the template engine
 * @param opts <Object>
 * @param opts.dataDir <String> specific data directory to use
 */
module.exports = function( opts ) {
  console.log( 'write' )

  // Handle no template name passed to write command
  if ( !opts._ || !opts._.length ) {
    usage( 'write' )
    return
  }

  // Grab the store and specified template file
  let templates = store( opts.dataDir || null )
  let template = templates.get( opts._[ 0 ] )

  process.stdin.setEncoding( 'utf8' )

  // process.stdin.on( 'end', function() {
  //   console.log( 'stream ended' )
  // })
  //
  // process.stdin.on( 'data', function( data ) {
  //   console.log( '-- chunk' )
  //   console.log( data.toString() )
  // })

  // process.stdin.on( 'readable', () => {
  //   let chunk = process.stdin.read()
  //   if ( chunk !== null ) {
  //     console.log( '--chunk' )
  //     console.log( chunk )
  //   }
  // })


  if ( opts.engine && opts.engine === 'none' ) {
    process.stdout.write( template.contents )
    return
  }

  console.log( '--template' )
  console.log( template )
}
