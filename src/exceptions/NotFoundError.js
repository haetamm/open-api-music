const InvariantError = require('./InvariantError')

class NotFoundError extends InvariantError {
  constructor (message, statusCode) {
    super(message)
    this.statusCode = 404
    this.name = 'NotFoundError'
  }
}

module.exports = NotFoundError
