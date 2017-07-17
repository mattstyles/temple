
const {create} = require('errno')

const NotFoundError = create('NotFoundError')
NotFoundError.prototype.code = 'ENOENT'
NotFoundError.prototype.errno = 34

const ModuleNotFound = create(NotFoundError)
ModuleNotFound.prototype.code = 'MODULE_NOT_FOUND'

module.exports = {
  NotFoundError,
  EngineError: create('EngineError'),
  ModuleNotFound
}
