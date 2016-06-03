
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
 *   temple engine hogan -d engine.json
 *   temple engine --install hogan
 *   temple engine hogan --install
 *   temple engine --rm hogan
 *   temple engine hogan --rm
 */

const path = require( 'path' )
const usage = require( '../lib/usage' )
const conf = require( '../lib/conf' )()
const pkg = require( '../package.json' )
const engineCore = require( '../lib/engine' )
const stream = require( '../lib/stream' )

const ENGINE_KEY = 'engines'
const core = engineCore( conf.get( ENGINE_KEY ) )

/**
 * Manages behaviours surrounding the templating engines
 */
module.exports = function engine( opts ) {

  if ( opts.delete ) {
    // @TODO prompt for confirmation before delete
    let engines = core.remove( opts._[ 0 ] || opts.delete )
    conf.set( ENGINE_KEY, engines )
    return
  }

  if ( opts.all ) {
    core.showAll({
      json: opts.json
    })
    return
  }

  if ( opts.install ) {
    let key = opts._[ 0 ] || opts.install
    core.install( key )
      .then( () => {
        let engines = core.writeKey( key, 'installed', true )
        conf.set( ENGINE_KEY, engines )
      })
      .catch( err => {
        console.log( `${ pkg.shortname }: ${ err.message }` )
        console.log( `see '${ pkg.shortname } engine --help'` )
      })
    return
  }

  if ( !opts._ || !opts._.length ) {
    usage( 'engine' )
    return
  }

  // Handle getting and setting engine data
  let key = opts._.shift()
  let value = opts._.length > 1
    ? opts._
    : opts._[ 0 ]

  // With no values and no streaming, show an engine
  if ( ( !value || !value.length ) && process.stdin.isTTY ) {
    core.show( key )
    return
  }

  // @TODO handle setting a specific key
  let keypath = key.split( '.' )

  // Set a specific key
  if ( keypath.length > 1 ) {
    let engines = core.writeKey( keypath.shift(), keypath, value )
    conf.set( ENGINE_KEY, engines )
    return
  }

  // Set the whole data by grabbing the data and applying to the
  // specified engine
  stream( opts.data
    ? fs.createReadStream( opts.data )
    : process.stdin
  )
    .then( data => {
      if ( !data.name ) {
        data.name = key
      } else {
        key = data.name
      }

      if ( !data.installed ) {
        data.installed = false
      }

      let engines = core.write( key, data )
      conf.set( ENGINE_KEY, engines )
    })
    .catch( err => {
      if ( err instanceof SyntaxError ) {
        console.log( `${ pkg.shortname }: Can not parse data` )
        console.log( `see '${ pkg.shortname } engine --help'` )
        return
      }
      throw new Error( 'Error streaming data source' )
    })
}
