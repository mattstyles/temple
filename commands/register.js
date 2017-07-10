
const fs = require('fs')
const pkg = require('../package.json')
const store = require('../lib/store')
const usage = require('../lib/usage')

/**
 * Registers a template with the system
 *
 * @example
 *   temple register readme.hjs < readme.hjs
 *   echo "Template {{ name }}" | temple register readme.hjs
 *   temple register readme.hjs -d readme.hjs
 *   temple register --rm readme.hjs
 */
module.exports = function register (opts) {
  let templates = store(opts.dataDir)

  if (opts.delete) {
    try {
      templates.remove(opts._[ 0 ] || opts.delete)
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.error(`${pkg.shortname}: Can not find specified template file`)
        console.error(`See '${pkg.shortname} register --help'`)
        return
      }

      console.error('Something went wrong...')
      throw new Error(err)
    }
    return
  }

  // Handle no template name
  if (!opts._ || !opts._.length) {
    usage('register')
    return
  }

  if (process.stdin.isTTY && !opts.data) {
    console.error(`${pkg.shortname}: Specify a template file to register`)
    console.error(`See '${pkg.shortname} register --help'`)
    return
  }

  let source = opts.data
    ? fs.createReadStream(opts.data)
    : process.stdin

  templates.set(opts._[ 0 ], source)
}
