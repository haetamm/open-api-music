const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { mapDBToModel, mapDbActivitiesToModel } = require('../../utils/playlists')
const { mapDBToModelSong } = require('../../utils/songs')
const AuthorizationError = require('../../exceptions/AuthorizationError')
const BaseService = require('./BaseService')

class PlaylistSongsService extends BaseService {
  constructor (collaborationService) {
    super()
    this._collaborationService = collaborationService
  }

  async addPlaylistSong ({ songId, id, userId }) {
    await this.verifyNewSongInPlaylists(songId, id)
    await this.verifyPlaylistAccess(id, userId)
    const idPlaylistSong = `playlistSong-${nanoid(16)}`
    const query = {
      text: 'INSERT INTO playlist_songs VALUES ($1, $2, $3) RETURNING id',
      values: [idPlaylistSong, id, songId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist')
    } else {
      await this.addPlaylistActivities({ id, songId, userId, action: 'add' })
    }
  }

  async verifyNewSongInPlaylists (songId, id) {
    const query = {
      text: 'SELECT song_id FROM playlist_songs WHERE song_id = $1 AND playlist_id = $2',
      values: [songId, id]
    }

    const result = await this._pool.query(query)

    if (result.rowCount) {
      throw new InvariantError('Lagu sudah ada di playlists')
    }
  }

  async getPlaylistDetail (id) {
    const query = {
      text: `
        SELECT 
          playlists.id,
          playlists.title,
          users.fullname,
          users.id AS user_id,
          COUNT(ps.song_id)::INTEGER AS song_count,
          COALESCE(SUM(s.duration), 0) AS total_duration
        FROM playlists
        JOIN users ON users.id = playlists.owner
        LEFT JOIN playlist_songs ps ON ps.playlist_id = playlists.id
        LEFT JOIN songs s ON s.id = ps.song_id
        WHERE playlists.id = $1
        GROUP BY playlists.id, playlists.title, users.fullname, users.id`,
      values: [id]
    }

    const result = await this._pool.query(query)
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    return result.rows.map(mapDBToModel)[0]
  }

  async getSongsInPlaylist (id) {
    const query = {
      text: `
      SELECT songs.id, songs.title, songs.performer, songs.duration, songs.cover_url, songs.uploader
      FROM playlist_songs
      JOIN songs ON songs.id = playlist_songs.song_id
      WHERE playlist_songs.playlist_id = $1`,
      values: [id]
    }

    const result = await this._pool.query(query)
    return result.rows.map(mapDBToModelSong)
  }

  async getPlaylistLikes (id) {
    const query = {
      text: `
      SELECT users.id AS user_id, users.fullname
      FROM user_playlist_likes
      JOIN users ON users.id = user_playlist_likes.user_id
      WHERE user_playlist_likes.playlist_id = $1`,
      values: [id]
    }

    const result = await this._pool.query(query)

    return result.rows.map(({ user_id, fullname }) => ({
      userId: user_id,
      fullname
    }))
  }

  async getPlaylistCollaborations (id) {
    const query = {
      text: `
      SELECT users.id AS user_id, users.fullname
      FROM collaborations
      JOIN users ON users.id = collaborations.user_id
      WHERE collaborations.playlist_id = $1`,
      values: [id]
    }

    const result = await this._pool.query(query)
    return result.rows.map(({ user_id, fullname }) => ({
      userId: user_id,
      fullname
    }))
  }

  async deletePlaylistSong ({ songId, id, userId }) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE song_id = $1 RETURNING id',
      values: [songId]
    }
    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus dari playlist')
    } else {
      await this.addPlaylistActivities({ id, songId, userId, action: 'delete' })
    }
  }

  async verifySonglist (songId) {
    const query = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [songId]
    }

    const result = await this._pool.query(query)
    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan')
    }
  }

  async verifyPlaylistOwner (id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }
    const playlist = result.rows[0]
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
    }
  }

  async verifyPlaylistAccess (playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId)
      } catch {
        throw error
      }
    }
  }

  async addPlaylistActivities ({ id, songId, userId, action }) {
    const idActivities = `activities-${nanoid(16)}`
    const time = new Date().toISOString()

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [idActivities, id, songId, userId, action, time]
    }
    await this._pool.query(query)
  }

  async getPlaylistSongActivities (id) {
    const query = {
      text: `SELECT playlist_song_activities.playlist_id, playlist_song_activities.action, playlist_song_activities.time, users.fullname, songs.title
        FROM playlist_song_activities 
        JOIN users ON users.id = playlist_song_activities.user_id
        JOIN songs ON songs.id = playlist_song_activities.song_id 
        WHERE playlist_song_activities.playlist_id = $1`,
      values: [id]
    }

    const result = await this._pool.query(query)

    return result.rows.map(mapDbActivitiesToModel)
  }

  async getPlaylistById (id) {
    const result = await this._pool.query({
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id]
    })

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    return result.rows[0]
  }
}

module.exports = PlaylistSongsService
