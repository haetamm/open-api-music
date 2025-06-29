const { nanoid } = require('nanoid')
const { Pool } = require('pg')
// const AuthorizationError = require('../../exceptions/AuthorizationError')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { mapDBToModel } = require('../../utils/playlists')

class PlaylistsService {
  constructor () {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL
    })
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

  async getPlaylists ({ id, credentialId }) {
    const playlistId = typeof (id) === 'string' ? id : id.playlist_id
    const query = {
      text: `SELECT playlists.*, users.username
      FROM playlists
      JOIN users ON users.id = playlists.owner
      WHERE playlists.id = $1 OR playlists.owner = $2`,
      values: [playlistId, credentialId]
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
