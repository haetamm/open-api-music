const { nanoid } = require('nanoid')
const bcrypt = require('bcrypt')
const InvariantError = require('../../exceptions/InvariantError')
const AuthenticationError = require('../../exceptions/AuthenticationError')
const BaseService = require('./BaseService')

class UsersService extends BaseService {
  async addUser ({ email, password, fullname }) {
    await this.verifyNewEmail(email)

    const id = `user-${nanoid(16)}`
    const hashedPassword = await bcrypt.hash(password, 10)
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, email, hashedPassword, fullname]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('User gagal ditambahkan')
    }
    return result.rows[0].id
  }

  async verifyNewEmail (email) {
    const query = {
      text: 'SELECT email FROM users WHERE email = $1',
      values: [email]
    }

    const result = await this._pool.query(query)

    if (result.rowCount) {
      throw new InvariantError('Email sudah digunakan')
    }
  }

  async verifyUserCredential (email, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE email = $1',
      values: [email]
    }
    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new AuthenticationError('Kredensial yang anda berikan salah')
    }

    const { id, password: hashedPassword } = result.rows[0]

    const match = await bcrypt.compare(password, hashedPassword)

    if (!match) {
      throw new AuthenticationError('Kredensial yang anda berikan salah')
    }

    return id
  }

  async getUser (id) {
    const query = {
      text: 'SELECT id, fullname, email FROM users WHERE id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)

    return result.rows[0]
  }

  async getUserIdByEmail (email) {
    const query = {
      text: 'SELECT id FROM users WHERE email = $1',
      values: [email]
    }
    const result = await this._pool.query(query)
    return result.rows[0]?.id
  }
}

module.exports = UsersService
