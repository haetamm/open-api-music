const { Pool } = require('pg')

class BaseService {
  constructor () {
    this._pool = this._createPool()
  }

  _createPool () {
    if (process.env.NODE_ENV === 'production') {
      return new Pool({
        connectionString: process.env.DATABASE_URL
      })
    } else {
      return new Pool() // pakai env PGUSER, PGHOST, dll
    }
  }
}

module.exports = BaseService
