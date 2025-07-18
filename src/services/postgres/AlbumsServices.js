const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { mapDBToModel, mapAlbumToModel } = require('../../utils/albums')
const AuthorizationError = require('../../exceptions/AuthorizationError')

class AlbumsService {
  constructor () {
    // supabase
    // this._pool = new Pool({
    //   connectionString: process.env.DATABASE_URL
    // })

    // db
    this._pool = new Pool()
  }

  async addAlbum ({ title, artist, year, coverUrl, uploader }) {
    const i = nanoid(16)
    const id = `album-${i}`

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, title, artist, year, coverUrl, uploader]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getAlbumsCountByUser (userId) {
    const query = {
      text: 'SELECT COUNT(*) FROM albums WHERE uploader = $1',
      values: [userId]
    }
    const result = await this._pool.query(query)
    return parseInt(result.rows[0].count)
  }

  async getAlbumsByUser (userId, offset, limit) {
    const query = {
      text: `
        SELECT
          a.id,
          a.title,
          a.artist,
          a.year,
          a.cover_url,
          COUNT(s.id) AS song_count,
          COALESCE(SUM(s.duration), 0) AS total_duration
        FROM albums a
        LEFT JOIN songs s ON s.album_id = a.id
        WHERE a.uploader = $1
        GROUP BY a.id
        ORDER BY a.created_at DESC
        OFFSET $2 LIMIT $3
      `,
      values: [userId, offset, limit]
    }
    const result = await this._pool.query(query)
    return result.rows.map(mapDBToModel)
  }

  async getAlbumsCount (title) {
    let queryText = 'SELECT COUNT(*) FROM albums'
    const values = []

    if (title) {
      queryText += ' WHERE title ILIKE $1'
      values.push(`%${title}%`)
    }

    const result = await this._pool.query({
      text: queryText,
      values
    })
    return parseInt(result.rows[0].count)
  }

  async getAlbums (title, offset, limit) {
    let queryText = `
      SELECT
        a.id,
        a.title,
        a.artist,
        a.year,
        a.cover_url,
        COUNT(s.id) AS song_count,
        COALESCE(SUM(s.duration), 0) AS total_duration
      FROM albums a
      LEFT JOIN songs s ON s.album_id = a.id
    `
    const values = []

    if (title) {
      queryText += ' WHERE a.title ILIKE $1'
      values.push(`%${title}%`)
    }

    queryText += `
      GROUP BY a.id
      ORDER BY a.created_at DESC
      OFFSET $${values.length + 1} LIMIT $${values.length + 2}
    `
    values.push(offset, limit)

    const result = await this._pool.query({
      text: queryText,
      values
    })
    return result.rows.map(mapDBToModel)
  }

  async getAlbumById (id) {
    const query = {
      text: `
          SELECT
            a.id,
            a.title,
            a.artist,
            a.year,
            a.cover_url,
            COUNT(s.id) AS song_count,
            COALESCE(SUM(s.duration), 0) AS total_duration
          FROM albums a
          LEFT JOIN songs s ON s.album_id = a.id
          WHERE a.id = $1
          GROUP BY a.id
        `,
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

    const songs = result.rows.map(mapAlbumToModel)
    return songs
  }

  async editAlbumById (id, { title, artist, year }) {
    const query = {
      text: 'UPDATE albums SET title = $1, artist = $2, year = $3 WHERE id = $3 RETURNING id',
      values: [title, artist, year, id]
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
