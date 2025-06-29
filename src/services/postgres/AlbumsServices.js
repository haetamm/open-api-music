const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { mapDBToModel, mapSongToModel } = require('../../utils/albums')

class AlbumsService {
  constructor () {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL
    })
  }

  async addAlbum ({ name, year, coverUrl }) {
    const i = nanoid(16)
    const id = `album-${i}`

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, name, year, coverUrl]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getAlbumById (id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan')
    }

    const album = result.rows.map(mapDBToModel)[0]
    return album
  }

  async getSongByAlbumId (id) {
    const query = {
      text: 'SELECT * FROM songs WHERE album_id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)

    const songs = result.rows.map(mapSongToModel)
    return songs
  }

  async editAlbumById (id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan')
    }
  }

  async deletAlbumById (id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan')
    }
  }

  async addCoverAlbum (id, link) {
    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2',
      values: [link, id]
    }

    await this._pool.query(query)
  }
}

module.exports = AlbumsService
