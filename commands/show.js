
/**
 * Writes out a specific template file to the current path without running it
 * through a template engine
 *
 * @example
 *   temple show package.hbs
 */

const render = require('./render')
const usage = require('../lib/usage')

/**
 * Shows a specific template file
 * @param opts <Object>
 * @param opts._ <Array|String> templates names to show
 */
module.exports = function (opts) {
  // Handle no template name passed to show command
  if (!opts._ || !opts._.length) {
    usage('show')
    return
  }

  return render(Object.assign(opts, {
    engine: 'none'
  }))
}
