const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { mapDBToModelSong, mapDBToModelSongSearch } = require('../../utils/songs')
const AuthorizationError = require('../../exceptions/AuthorizationError')

class SongsService {
  constructor () {
    // supabase
    // this._pool = new Pool({
    //   connectionString: process.env.DATABASE_URL
    // })

    // db
    this._pool = new Pool()
  }

  async addSong ({ title, year, performer, genre, duration, albumId, coverUrl, uploader }) {
    const i = nanoid(16)
    const id = `song-${i}`

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      values: [id, title, year, performer, genre, duration, albumId, coverUrl, uploader]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan')
    }

    return mapDBToModelSong(result.rows[0])
  }

  async editSongById (id, { title, year, performer, genre, duration, album_id }) {
    try {
      const query = {
        text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING *',
        values: [title, year, performer, genre, duration, album_id, id]
      }

      const result = await this._pool.query(query)

      if (!result.rows.length) {
        throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan')
      }

      return mapDBToModelSong(result.rows[0])
    } catch (err) {
      console.log(err)
    }
  }

  async getSongsCountByUser (userId) {
    const query = {
      text: 'SELECT COUNT(*) FROM songs WHERE uploader = $1',
      values: [userId]
    }
    const result = await this._pool.query(query)
    return parseInt(result.rows[0].count)
  }

  async getSongsByUser (userId, offset, limit) {
    const query = {
      text: `SELECT 
                s.*,
                COUNT(usl.song_id) AS likes_count
              FROM songs s
              LEFT JOIN user_song_likes usl ON s.id = usl.song_id
              WHERE uploader = $1
              GROUP BY s.id
              ORDER BY created_at DESC
              OFFSET $2 LIMIT $3
            `,
      values: [userId, offset, limit]
    }

    const result = await this._pool.query(query)
    return result.rows.map(mapDBToModelSongSearch)
  }

  async getSongsCountLikedByUser (userId) {
    const query = {
      text: `
        SELECT COUNT(*) 
        FROM songs 
        JOIN user_song_likes ON songs.id = user_song_likes.song_id 
        WHERE user_song_likes.user_id = $1
      `,
      values: [userId]
    }
    const result = await this._pool.query(query)
    return parseInt(result.rows[0].count)
  }

  async getSongsLikedByCurrentUser (userId, offset, limit) {
    try {
      const query = {
        text: `
          SELECT
            s.*,
            COUNT(usl.song_id) AS likes_count
          FROM songs s
          LEFT JOIN user_song_likes usl ON s.id = usl.song_id
          WHERE usl.user_id = $1
          GROUP BY s.id
          ORDER BY s.created_at DESC 
          OFFSET $2 LIMIT $3
        `,
        values: [userId, offset, limit]
      }
      const result = await this._pool.query(query)
      return result.rows.map(mapDBToModelSongSearch)
    } catch (err) {
      console.log(err)
    }
  }

  async getSongsCount (title) {
    let queryText = 'SELECT COUNT(*) FROM songs'
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

  async getSongs (title, offset, limit, random = false) {
    let queryText = `
    SELECT
      s.*,
      COUNT(usl.song_id) AS likes_count
    FROM songs s
    LEFT JOIN user_song_likes usl ON s.id = usl.song_id
  `

    const values = []

    if (title) {
      queryText += ' WHERE s.title ILIKE $1'
      values.push(`%${title}%`)
    }

    // Tentukan posisi OFFSET dan LIMIT di query
    const offsetParam = `$${values.length + 1}`
    const limitParam = `$${values.length + 2}`

    queryText += `
    GROUP BY s.id
    ORDER BY ${random ? 'RANDOM()' : 's.created_at DESC'}
    OFFSET ${offsetParam}
    LIMIT ${limitParam}
  `

    values.push(offset, limit)

    const result = await this._pool.query({
      text: queryText,
      values
    })

    return result.rows.map(mapDBToModelSongSearch)
  }

  async getSongDetailById (id) {
    const query = {
      text: `
      SELECT 
        s.*,
        u.fullname AS uploader_name
      FROM songs s
      LEFT JOIN users u ON s.uploader = u.id
      WHERE s.id = $1
    `,
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan')
    }

    return result.rows[0]
  }

  async getAlbumDetailById (albumId) {
    const query = {
      text: `
      SELECT 
        a.id AS album_id,
        a.title AS album_title,
        a.year AS album_year,
        a.cover_url AS album_cover,
        u.fullname AS album_uploader_name
      FROM albums a
      LEFT JOIN users u ON a.uploader = u.id
      WHERE a.id = $1
    `,
      values: [albumId]
    }

    const result = await this._pool.query(query)
    return result.rowCount ? result.rows[0] : null
  }

  async getSongLikes (id) {
    const query = {
      text: `
      SELECT u.id AS user_id, u.fullname 
      FROM user_song_likes usl
      JOIN users u ON usl.user_id = u.id
      WHERE usl.song_id = $1
    `,
      values: [id]
    }

    const result = await this._pool.query(query)
    return result.rows.map(({ user_id, fullname }) => ({
      userId: user_id,
      fullname
    }))
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
