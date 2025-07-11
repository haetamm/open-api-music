const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { mapDBToModel, mapDBToModelSong } = require('../../utils/songs')
const AuthorizationError = require('../../exceptions/AuthorizationError')

class SongsService {
  constructor () {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL
    })
  }

  async addSong ({ title, year, performer, genre, duration, albumId, uploader }) {
    const i = nanoid(16)
    const id = `song-${i}`

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId, uploader]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getSongsByUploader (uploader) {
    const query = {
      text: 'SELECT * FROM songs WHERE uploader = $1',
      values: [uploader]
    }

    const result = await this._pool.query(query)
    return result.rows.map(mapDBToModel)
  }

  async getSongs (title, performer) {
    if (title && !performer) {
      const result = await this._pool.query(`SELECT * FROM songs WHERE title LIKE '%${title.charAt(0).toUpperCase() + title.slice(1)}%'`)
      console.log(result.rows)
      return result.rows.map(mapDBToModelSong)
    } else if (!title && performer) {
      const result = await this._pool.query(`SELECT * FROM songs WHERE performer LIKE '%${performer.charAt(0).toUpperCase() + performer.slice(1)}%'`)
      return result.rows.map(mapDBToModelSong)
    } else if (title && performer) {
      const result = await this._pool.query(`SELECT * FROM songs WHERE title LIKE '%${title.charAt(0).toUpperCase() + title.slice(1)}%' AND performer LIKE '%${performer.charAt(0).toUpperCase() + performer.slice(1)}%'`)
      return result.rows.map(mapDBToModelSong)
    } else {
      const result = await this._pool.query('SELECT * FROM songs')
      return result.rows.map(mapDBToModelSong)
    }
  }

  async getSongById (id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan')
    }

    return result.rows.map(mapDBToModel)[0]
  }

  async editSongById (id, { title, year, performer, genre, duration }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5 WHERE id = $6 RETURNING id',
      values: [title, year, performer, genre, duration, id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan')
    }
  }

  async deleteSongById (id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan')
    }
  }

  async verifySongUploader (id, userId) {
    const query = {
      text: 'SELECT uploader FROM songs WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Song tidak ditemukan')
    }

    const album = result.rows[0]
    if (album.uploader !== userId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
    }
  }
}

module.exports = SongsService
