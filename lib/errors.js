
'use strict'

const createError = require( 'errno' ).create

const NotFoundError = createError( 'NotFoundError' )
NotFoundError.prototype.code = 'ENOENT'
NotFoundError.prototype.errno = 34

module.exports = {
  NotFoundError
}
