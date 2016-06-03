
'use strict'

/**
 * Renders a specific template file
 *
 * @example
 *   temple render .gitignore.mustache
 *   cat data.json | temple render package.hbs > package.json
 *   template render package < data.json > package.json
 *   temple render package -d data.json > package.json
 *   temple render package -d data.json -o package.json
 *   temple render package.tmpl -d data.json -o package.json --engine hogan
 */

const fs = require( 'fs' )
const path = require( 'path' )
const prompt = require( 'inquirer' ).prompt
const root = require('app-root-dir').get()
const pkg = require( '../package.json' )
const store = require( '../lib/store' )
const conf = require( '../lib/conf' )()
const usage = require( '../lib/usage' )
const stream = require( '../lib/stream' )

const ENGINE_KEY = 'engines'
const engineCore = require( '../lib/engine' )( conf.get( ENGINE_KEY ) )

/**
 * Grabs some data and a template file and runs the template engine
 * @param opts <Object>
 * @param opts.dataDir <String> specific data directory to use
 */
module.exports = function write( opts ) {
  // Handle no template name passed to write command
  if ( !opts._ || !opts._.length ) {
    usage( 'render' )
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
    .then( prepRender( template, opts ) )
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
function prepRender( template, opts ) {
  return function( data ) {
    let outputStream = opts.output
      ? fs.createWriteStream( opts.output )
      : process.stdout

    // Attempt to match the template extension to an engine
    let engines = conf.get( ENGINE_KEY )
    let engine = engines.find( engine => {
      return engine.extensions.find( ext => ext === template.ext )
    })

    // Grab an engine if specified
    if ( opts.engine ) {
      engine = engines.find( engine => engine.name === opts.engine )
    }

    if ( !engine ) {
      console.log( `${ pkg.shortname }: Can not find engine to use` )
      console.log( `See '${ pkg.shortname } engine --all' for available engines` )
      return
    }

    // Prompt to install the engine if necessary
    if ( !engine.installed ) {
      prompt([
        {
          type: 'confirm',
          name: 'install',
          message: `'${ engine.name }' is not installed, would you like to install it now?`,
          default: true
        }
      ])
        .then( answers => {
          if ( answers.install ) {
            console.log( `${ pkg.shortname }: Installing ${ engine.module } from npm` )
            return engineCore.install( engine.name )
          }

          throw new Error( 'cancel' )
        })
        .then( engines => {
          conf.set( ENGINE_KEY, engines )
          render( template.contents, data, engine.name, outputStream )
        })
        .catch( err => {
          if ( err.message === 'cancel' ) {
            console.log( `${ pkg.shortname }: Can not render template without an engine` )
            console.log( `See '${ pkg.shortname } write --help'` )
            return
          }

          console.error( 'Something went wrong installing engine' )
          throw new Error( err )
        })

      return
    }

    render( template.contents, data, engine.name, outputStream )
  }
}

/**
 * Does the actual rendering of the template and output
 */
function render( template, data, engine, output ) {
  store().render({
    template,
    data,
    engine
  })
    .then( tmpl => {
      // @TODO handle -d flag
      output.write( tmpl )
    })
    .catch( err => {
      console.log( `${ pkg.shortname }: Error rendering template` )
      console.log( `See '${ pkg.shortname } write --help'` )
      return
    })
}
