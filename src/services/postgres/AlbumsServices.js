const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { mapDBToModel, mapSongToModel } = require('../../utils/albums')
const AuthorizationError = require('../../exceptions/AuthorizationError')

class AlbumsService {
  constructor () {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL
    })
  }

  async addAlbum ({ name, year, coverUrl, uploader }) {
    const i = nanoid(16)
    const id = `album-${i}`

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, coverUrl, uploader]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getAlbumsByUploader (uploader) {
    const query = {
      text: 'SELECT * FROM albums WHERE uploader = $1',
      values: [uploader]
    }

    const result = await this._pool.query(query)
    return result.rows.map(mapDBToModel)
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

  async verifyAlbumUploader (id, userId) {
    const query = {
      text: 'SELECT uploader FROM albums WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan')
    }

    const album = result.rows[0]
    if (album.uploader !== userId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
    }
  }
}

module.exports = AlbumsService
