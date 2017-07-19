
/**
 * Holds the data directory contents
 */

const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const conf = require('./conf')()
const {NotFoundError} = require('./errors')

/**
 * The default path is stored in the config
 * @type <String>
 */
const DEFAULT_PATH = conf.get('path.data')

/**
 * Returns the store manager object
 * @param dataDir <String> the path to the data directory
 */
module.exports = function store (dataDir: string = DEFAULT_PATH) {
  // Make sure the directory exists
  mkdirp.sync(dataDir)

  const core = {
    /**
     * Grabs all files in the data directory and strips the extension
     */
    getAll: function () {
      return fs.readdirSync(dataDir)
        .filter(name => !/node_modules/.test(name))
    },

    /**
     * Grabs a single template file from the data directory
     * @param name <String>
     */
    get: function (name: string) {
      if (!name) {
        throw new Error('No template specified')
      }

      const file = fs
        .readdirSync(dataDir)
        .find(filename => new RegExp(name).test(filename))

      if (!file) {
        throw new NotFoundError('Can not find template file')
      }

      return {
        contents: fs.readFileSync(path.join(dataDir, file), {
          encoding: 'utf8'
        }),
        filename: file,
        template: name,
        ext: path.extname(file).replace(/^\./, '')
      }
    },

    /**
     * Streams a new template file
     * @param name <String>
     * @param source <ReadStream>
     */
    set: function (name: string, source: any) {
      const stream = fs.createWriteStream(path.join(dataDir, name))
      source
        .pipe(stream)
    },

    /**
     * Removes a template file
     * @param name <String>
     */
    remove: function (name: string) {
      let template = core.get(name)
      fs.unlinkSync(path.join(dataDir, template.filename))
    },

    /**
     * Renders a template given data using a specified engine
     * @param opts <Object>
     * @param opts.template <String>
     * @param opts.data <Object>
     * @param opts.engine <String> passed to consolidate
     * @param opts.cons <Object> consolidate module to use
     * @returns <Promise> resolved with rendered templated string
     */
    render: function (opts: Object) {
      if (!opts) {
        throw new Error('Options need to be passed to render a template')
      }

      if (!opts.cons) {
        const pathname = path.join(dataDir, 'node_modules', 'consolidate')
        opts.cons = require(pathname)
      }

      return opts.cons[opts.engine].render(opts.template, opts.data)
    },

    /**
     * Checks that a dependency has been installed
     */
    checkInstall (name: string) {
      return new Promise((resolve, reject) => {
        var dir: Array<string> = []
        try {
          dir = fs.readdirSync(path.join(dataDir, 'node_modules'))
        } catch (err) {
          // If no node_modules at all then we need to install stuff
          if (err.code === 'ENOENT') {
            // Needs an install
            resolve(false)
            return
          }
        }

        // Check for module
        resolve(dir.includes(name))
      })
    }
  }

  return core
}
