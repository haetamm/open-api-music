const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { mapDBToModel } = require('../../utils/playlists')
const BaseService = require('./BaseService')

class PlaylistsService extends BaseService {
  constructor (playlistSongsService) {
    super()
    this._playlistSongsService = playlistSongsService
  }

  async addPlaylist ({ title, owner }) {
    const id = `playlist-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO playlists VALUES ($1, $2, $3) RETURNING *',
      values: [id, title, owner]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Catatan gagal ditambahkan')
    }

    return mapDBToModel(result.rows[0])
  }

  async getPlaylistsCount (title) {
    let queryText = 'SELECT COUNT(*) FROM playlists'
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

  async getPlaylists (title, offset, limit) {
    let queryText = `
      SELECT 
        p.id,
        p.title,
        u.fullname,
        COUNT(ps.song_id) AS song_count,
        COALESCE(SUM(s.duration), 0) AS total_duration
      FROM playlists p
      JOIN users u ON u.id = p.owner
      LEFT JOIN playlist_songs ps ON ps.playlist_id = p.id
      LEFT JOIN songs s ON s.id = ps.song_id
    `
    const values = []

    if (title) {
      queryText += ' WHERE p.title ILIKE $1'
      values.push(`%${title}%`)
    }

    queryText += `
      GROUP BY p.id, u.fullname
      ORDER BY p.created_at DESC
      OFFSET $${values.length + 1} LIMIT $${values.length + 2}
    `
    values.push(offset, limit)

    const result = await this._pool.query({
      text: queryText,
      values
    })
    return result.rows.map(mapDBToModel)
  }

  async getPlaylistsByUserCount (userId) {
    const query = {
      text: `
      SELECT COUNT(*)
      FROM playlists
      WHERE owner = $1
    `,
      values: [userId]
    }
    const result = await this._pool.query(query)
    return parseInt(result.rows[0].count)
  }

  async getPlaylistsByUser (userId, offset, limit) {
    const query = {
      text: `
      SELECT 
        p.id,
        p.title,
        u.fullname,
        COUNT(ps.song_id) AS song_count,
        COALESCE(SUM(s.duration), 0) AS total_duration
      FROM playlists p
      JOIN users u ON u.id = p.owner
      LEFT JOIN playlist_songs ps ON ps.playlist_id = p.id
      LEFT JOIN songs s ON s.id = ps.song_id
      WHERE p.owner = $1
      GROUP BY p.id, u.fullname
      ORDER BY p.created_at DESC
      OFFSET $2 LIMIT $3
    `,
      values: [userId, offset, limit]
    }
    const result = await this._pool.query(query)
    return result.rows.map(mapDBToModel)
  }

  async getAllMyPlaylistsHandler (userId) {
    const ownPlaylists = await this.getPlaylistsByUser(userId, 0, Number.MAX_SAFE_INTEGER)

    const collabPlaylists = await this.getPlaylistsCollab(userId, 0, Number.MAX_SAFE_INTEGER)

    const allPlaylists = [...ownPlaylists, ...collabPlaylists]

    return allPlaylists
  }

  async getSongsInPlaylist (playlistId) {
    const query = {
      text: `
      SELECT s.id, s.title
      FROM playlist_songs ps
      JOIN songs s ON s.id = ps.song_id
      WHERE ps.playlist_id = $1
    `,
      values: [playlistId]
    }

    const result = await this._pool.query(query)
    return result.rows
  }

  async getPlaylistsLikedCount (userId) {
    const query = {
      text: `
        SELECT COUNT(*) 
        FROM playlists p
        JOIN user_playlist_likes upl ON p.id = upl.playlist_id
        WHERE upl.user_id = $1
      `,
      values: [userId]
    }
    const result = await this._pool.query(query)
    return parseInt(result.rows[0].count)
  }

  async getPlaylistsLiked (userId, offset, limit) {
    const query = {
      text: `
        SELECT 
          p.id,
          p.title,
          u.fullname,
          COUNT(ps.song_id) AS song_count,
          COALESCE(SUM(s.duration), 0) AS total_duration
        FROM playlists p
        JOIN users u ON u.id = p.owner
        LEFT JOIN playlist_songs ps ON ps.playlist_id = p.id
        LEFT JOIN songs s ON s.id = ps.song_id
        JOIN user_playlist_likes upl ON p.id = upl.playlist_id
        WHERE upl.user_id = $1
        GROUP BY p.id, u.fullname
        ORDER BY p.created_at DESC
        OFFSET $2 LIMIT $3
      `,
      values: [userId, offset, limit]
    }
    const result = await this._pool.query(query)
    return result.rows.map(mapDBToModel)
  }

  async getPlaylistCollabCount (userId) {
    const query = {
      text: `
      SELECT COUNT(DISTINCT p.id) AS count
      FROM playlists p
      LEFT JOIN collaborations c ON c.playlist_id = p.id
      WHERE c.user_id = $1
    `,
      values: [userId]
    }
    const result = await this._pool.query(query)
    return parseInt(result.rows[0].count)
  }

  async getPlaylistsCollab (userId, offset, limit) {
    const query = {
      text: `
      SELECT 
        p.id,
        p.title,
        u.fullname,
        COUNT(ps.song_id) AS song_count,
        COALESCE(SUM(s.duration), 0) AS total_duration
      FROM playlists p
      JOIN users u ON u.id = p.owner
      LEFT JOIN playlist_songs ps ON ps.playlist_id = p.id
      LEFT JOIN songs s ON s.id = ps.song_id
      LEFT JOIN collaborations c ON c.playlist_id = p.id
      WHERE c.user_id = $1
      GROUP BY p.id, u.fullname
      ORDER BY p.created_at DESC
      OFFSET $2 LIMIT $3
    `,
      values: [userId, offset, limit]
    }
    const result = await this._pool.query(query)
    return result.rows.map(mapDBToModel)
  }

  async updatePlaylistById (id, title) {
    const query = {
      text: 'UPDATE playlists SET title = $1 WHERE id = $2 RETURNING *',
      values: [title, id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui playlist. Id tidak ditemukan')
    }
  }

  async deletePlaylistById (id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id]
    }
    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan')
    }
  }
}

module.exports = PlaylistsService
