
'use strict'

const createError = require( 'errno' ).create

const NotFoundError = createError( 'NotFoundError' )
NotFoundError.prototype.code = 'ENOENT'
NotFoundError.prototype.errno = 34

const ModuleNotFound = createError( NotFoundError )
ModuleNotFound.prototype.code = 'MODULE_NOT_FOUND'

module.exports = {
  NotFoundError,
  EngineError: createError( 'EngineError' ),
  ModuleNotFound
}
