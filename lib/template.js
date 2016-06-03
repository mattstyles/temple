
'use strict'

/**
 * Handles operations related to templating
 */

const cons = require( 'consolidate' )

const tmpl = {
  /**
   * Renders a template given data using a specified engine
   * @param opts <Object>
   * @param opts.template <String>
   * @param opts.data <Object>
   * @param opts.engine <String> passed to consolidate
   */
  render: function( opts ) {
    if ( !opts ) {
      throw new Error( 'Options need to be passed to render a template' )
    }

    return cons[ opts.engine ].render( opts.template, opts.data )
  }
}

module.exports = tmpl
