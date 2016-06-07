
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
const install = require( '../lib/install' )
const NotFoundError = require( '../lib/errors' ).NotFoundError
const EngineError = require( '../lib/errors' ).EngineError
const ModuleNotFound = require( '../lib/errors' ).ModuleNotFound

const ENGINE_KEY = 'engines'
const engineCore = require( '../lib/engine' )( conf.get( ENGINE_KEY ) )

const DEFAULT_PATH = conf.get( 'path.data' )

/**
 * Returns a thunk that queues promises, passing opts to each promise function
 */
function queue( opts ) {
  return function run( tasks ) {
    let state = []
    return new Promise( ( resolve, reject ) => {
      function next( res ) {
        state.push( res )
        if ( tasks.length ) {
          let task = tasks.shift()
          // console.log( task.name )
          return task( opts )
            .then( next )
        }

        // The first state is invalid
        state.shift()
        resolve( state )
      }

      Promise.resolve()
        .then( next )
        .catch( reject )
    })
  }
}


/**
 * Generic error handler for render stuff
 */
function errorHandler( err ) {
  if ( err instanceof NotFoundError ) {
    console.error( `${ pkg.shortname }: ${ err.message }` )
    console.error( `See '${ pkg.shortname } render --help'` )
    return
  }

  if ( err instanceof EngineError ) {
    console.log( `${ pkg.shortname }: ${ err.message }` )
    console.log( `See '${ pkg.shortname } engine --all' for available engines` )
  }

  if ( err ) {
    console.error( err )
  }
}


/**
 * Grabs some data and a template file and runs the template engine
 * @param opts <Object>
 * @param opts.dataDir <String> specific data directory to use
 */
module.exports = function render( opts ) {
  // Handle no template name passed to write command
  if ( !opts._ || !opts._.length ) {
    usage( 'render' )
    return
  }

  if ( opts.engine && opts.engine === 'none' ) {
    // @TODO just grab the template and render
    getTemplate( opts )
      .then( template => {
        process.stdout.write( template.contents )
      })
      .catch( errorHandler )

    return
  }

  // Get data and render template
  // stream( getSource( opts ) )
  //   .then( prepRender( template, opts ) )
  //   .catch( err => {
  //     if ( err instanceof SyntaxError ) {
  //       console.log( `${ pkg.shortname }: Can not parse data` )
  //       console.log( `See '${ pkg.shortname } render --help'` )
  //       return
  //     }
  //     console.error( 'Error streaming data source' )
  //     throw new Error( err )
  //   })


  queue( opts )([
    getTemplate,
    checkInstall,
    getEngine,
    getStream
  ])
    .then( res => {
      console.log( res )
    })
    .catch( errorHandler )
}

/**
 * Returns a data source to stream from
 * @returns <Stream>
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
 * Wraps the data source in a stream
 * @returns <Promise>
 */
function getStream( opts ) {
  return stream( getSource( opts ) )
}

/**
 * Gets the template to render
 * @returns <Promise>
 */
function getTemplate( opts ) {
  return new Promise( ( resolve, reject ) => {
    // Grab the store and specified template file
    let templates = store( opts.dataDir || null )
    let template = null

    try {
      template = templates.get( opts._[ 0 ] )
    } catch( err ) {
      reject( err )
    }

    resolve( template )
  })
}

/**
 * Returns the desired template engine
 */
function getEngine( opts ) {
  return new Promise( ( resolve, reject ) => {
    getTemplate( opts )
      .then( template => {
        let engines = conf.get( ENGINE_KEY )
        let engine = engines.find( engine => {
          return engine.extensions.find( ext => ext === template.ext )
        })

        // Grab an engine if specified
        if ( opts.engine ) {
          engine = engines.find( engine => engine.name === opts.engine )
        }

        if ( !engine ) {
          reject( new EngineError( 'Can not find engine to use' ) )
        }

        resolve( engine )
      })
  })
}

/**
 * Checks that both consolidate and the required engine are installed
 */
function checkInstall( opts ) {
  return new Promise( ( resolve, reject ) => {
    getTemplate( opts )
      .then( template => {
        // Grab the engine first
        let engines = conf.get( ENGINE_KEY )
        let engine = engines.find( engine => {
          return engine.extensions.find( ext => ext === template.ext )
        })

        // Grab an engine if specified
        if ( opts.engine ) {
          engine = engines.find( engine => engine.name === opts.engine )
        }

        if ( !engine ) {
          reject( new EngineError( 'Can not find engine to use' ) )
        }

        let templates = store( opts.dataDir || null )

        Promise.all([
          templates.checkInstall( engine.module ),
          templates.checkInstall( 'consolidate' )
        ])
          .then( res => {
            Promise.resolve()
              .then( () => {
                console.log( '1st job running' )
                return res[ 1 ] ? Promise.resolve() : installConsolidate( opts )
              })
              .then( () => {
                console.log( '2nd job running' )
                return res[ 0 ] ? Promise.resolve() : installModule( opts, engine )
              })
              .then( res => resolve( true ) )
              .catch( reject )
          })
          .catch( err => {
            reject( err )
            return
          })
    })
  })
}

/**
 * Installs specific template engine
 */
function installModule( opts, engine ) {
  return new Promise( ( resolve, reject ) => {
    console.log( 'installing module', engine.name )
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
          return engineCore.install( engine.name, opts.dataDir || DEFAULT_PATH )
        }

        throw new Error( 'cancel' )
      })
      .then( engines => {
        conf.set( ENGINE_KEY, engines )
        resolve( engine )
      })
      .catch( err => {
        if ( err.message === 'cancel' ) {
          console.log( `${ pkg.shortname }: Can not render template without an engine` )
          console.log( `See '${ pkg.shortname } render --help'` )
          reject()
        }

        reject( err )
      })
  })
}

/**
 * Installs consolidate
 */
function installConsolidate( opts ) {
  return new Promise( ( resolve, reject ) => {

    console.log( 'installing consolidate' )
    var name = 'consolidate'

    prompt([
      {
        type: 'confirm',
        name: 'install',
        message: `'${ pkg.shortname }' needs to install a temple engine runner, would you like to install it now?`,
        default: true
      }
    ])
      .then( answers => {
        if ( answers.install ) {
          console.log( `${ pkg.shortname }: Installing ${ name } from npm` )
          return install([ name ], opts.dataDir || DEFAULT_PATH )
        }

        throw new Error( 'cancel' )
      })
      .then( () => {
        resolve()
      })
      .catch( err => {
        if ( err.message === 'cancel' ) {
          console.log( `${ pkg.shortname }: Can not render template without an engine runner` )
          console.log( `See '${ pkg.shortname } render --help'` )
          reject()
        }

        reject( err )
      })
  })
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
      console.log( `See '${ pkg.shortname } render --help'` )
      return
    })
}
