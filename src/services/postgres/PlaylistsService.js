const { nanoid } = require('nanoid')
const { Pool } = require('pg')
// const AuthorizationError = require('../../exceptions/AuthorizationError')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { mapDBToModel } = require('../../utils/playlists')

class PlaylistsService {
  constructor () {
    // supabase
    // this._pool = new Pool({
    //   connectionString: process.env.DATABASE_URL
    // })

    // db
    this._pool = new Pool()
  }

  async addPlaylist ({ name, owner }) {
    const id = `playlist-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO playlists VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, owner]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Catatan gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getPlaylistId (credentialId) {
    const query = {
      text: 'SELECT playlist_id FROM collaborations WHERE user_id = $1',
      values: [credentialId]
    }
    const result = await this._pool.query(query)
    return result.rows[0]
  }

  async getPlaylists (owner) {
    const query = {
      text: `SELECT 
              p.*,
              u.fullname,
              COUNT(ps.song_id) AS song_count,
              COALESCE(SUM(s.duration), 0) AS total_duration
            FROM playlists p
            JOIN users u ON u.id = p.owner
            LEFT JOIN playlist_songs ps ON ps.playlist_id = p.id
            LEFT JOIN songs s ON s.id = ps.song_id
            WHERE p.owner = $1
            GROUP BY p.id, u.fullname`,
      values: [owner]
    }

    const result = await this._pool.query(query)
    return result.rows.map(mapDBToModel)
  }

  async getPlaylistLiked (userId) {
    const query = {
      text: `SELECT 
                p.*,
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
            `,
      values: [userId]
    }

    const result = await this._pool.query(query)
    return result.rows.map(mapDBToModel)
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
