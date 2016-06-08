
'use strict'

/**
 * Lists available template files
 *
 * @example
 *   temple list
 *   temple list --dataDir /usr/local/share/templates
 */

const fs = require( 'fs' )
const path = require( 'path' )
const store = require( '../lib/store' )
const conf = require( '../lib/conf' )()
const Table = require( 'cli-table' )

const ENGINE_KEY = 'engines'
const engineCore = require( '../lib/engine' )( conf.get( ENGINE_KEY ) )

/**
 * Lists all templates currently held by the store
 * @param opts <Object>
 *   @param dataDir <String> specific data directory to use
 */
module.exports = function list( opts ) {
  opts = opts || {}
  let templates = store( opts.dataDir || null )

  // @TODO make tabular on --json option supplied
  let tmpl = templates.getAll()
    .map( filename => {
      let name = filename.replace( path.extname( filename ), '' )
      let engine = engineCore.find( path.extname( filename ).replace( /^\./, '' ) )
      return {
        name: name,
        filename: filename,
        engine: engine ? engine.name : 'unspecified'
      }
    })

  if ( opts.json ) {
    process.stdout.write( JSON.stringify( tmpl ) )
    return
  }

  let table = new Table({
    chars: { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': ''
           , 'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': ''
           , 'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': ''
           , 'right': '' , 'right-mid': '' , 'middle': ' ' },
    style: { 'padding-left': 0, 'padding-right': 0 }
  })

  table.push([ 'NAME', 'FILENAME', 'ENGINE' ])
  table.push( ...tmpl.map( t => [ t.name, t.filename, t.engine ] ) )

  console.log( table.toString() )
}
