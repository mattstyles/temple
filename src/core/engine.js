
/**
 * Handles core operations related to the templating engines
 */

const install = require('./install')
const {
  NotFoundError,
  EngineError
} = require('./errors')

const engineCore = function (engines: Array<Object>) {
  let core = {
    /**
     * Writes the spec to the engine, replacing if necessary
     */
    write: function (name: string, spec: Object) {
      let engine = core.get(name)

      if (engine) {
        core.remove(name)
        return core.write(name, spec)
      }

      engines.push(spec)

      return engines
    },

    /**
     * Sets a specific key for an engine
     */
    writeKey: function (name: string, key: string|Array<string>, value: any) {
      // If the key is a keypath described as an array
      // then only consider the first key
      if (Array.isArray(key)) {
        key = key[0]
      }

      if (key === 'extensions' && typeof value === 'string') {
        value = [value]
      }

      let engine: Object = core.get(name)
      engine[key] = value
      return engines
    },

    /**
     * Removes an engine
     */
    remove: function (name: string) {
      let engine: Object = core.get(name)
      if (engine) {
        engines.splice(engines.indexOf(engine), 1)
      }

      return engines
    },

    /**
     * Gets via the name of the engine
     */
    get: function (name: string): Object|null {
      return engines.find(engine => engine.name === name) || null
    },

    /**
     * Searches for a matching extension
     * Returns the first match it finds
     */
    find: function (ext: string) {
      return engines.find(engine => {
        return engine.extensions.find(e => e === ext)
      })
    },

    /**
     * @TODO show tabular without json flag
     */
    show: function (name: string, opts: Object) {
      opts = opts || {
        json: false
      }

      let engine = core.get(name)
      process.stdout.write(opts.json
        ? JSON.stringify(engine)
        : engine.name
      )
    },

    /**
     * Renders all engine data
     */
    showAll: function (opts: Object) {
      opts = opts || {
        json: false
      }

      if (opts.json) {
        process.stdout.write(JSON.stringify(engines))
        return
      }

      // @TODO make tabular
      engines
        .map(engine => engine.name + '\n')
        .forEach(engine => {
          process.stdout.write(engine)
        })
    },

    /**
     * Installs a specific template engine
     */
    install: function (name: string, installPath: string) {
      return new Promise((resolve, reject) => {
        const engine: Object = core.get(name)

        if (!engine) {
          throw new NotFoundError('Engine not found')
        }

        if (!engine.module) {
          throw new EngineError('Can not find module name to install')
        }

        install([engine.module], installPath)
          .then(() => {
            resolve(engines)
          })
          .catch(reject)
      })
    }
  }

  return core
}

module.exports = engineCore
