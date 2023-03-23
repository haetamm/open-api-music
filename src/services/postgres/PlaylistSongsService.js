const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { mapDBToModel, mapDbActivitiesToModel } = require('../../utils/playlists')
const { mapDBToModelSong } = require('../../utils/songs')
const AuthorizationError = require('../../exceptions/AuthorizationError')

class PlaylistSongsService {
  constructor (collaborationService) {
    this._pool = new Pool()

    this._collaborationService = collaborationService
  }

  async addPlaylistSong ({ songId, id, userId }) {
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

  async getPlaylistSongs (playlistId) {
    const query = {
      text: `SELECT playlists.*, users.username 
        FROM playlists 
        JOIN users ON users.id = playlists.owner
        WHERE playlists.id = $1`,
      values: [playlistId]
    }
    const result = await this._pool.query(query)
    return result.rows.map(mapDBToModel)[0]
  }

  async getSongsInPlaylist (id) {
    const query = {
      text: `SELECT playlist_songs.*, songs.*
        FROM playlist_songs
        JOIN songs ON songs.id = playlist_songs.song_id
        WHERE playlist_id = $1`,
      values: [id]
    }
    const result = await this._pool.query(query)
    return result.rows.map(mapDBToModelSong)
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
      text: `SELECT playlist_song_activities.playlist_id, playlist_song_activities.action, playlist_song_activities.time, users.username, songs.title
      FROM playlist_song_activities 
      JOIN users ON users.id = playlist_song_activities.user_id
      JOIN songs ON songs.id = playlist_song_activities.song_id 
      WHERE playlist_song_activities.playlist_id = $1`,
      values: [id]
    }

    const result = await this._pool.query(query)
    return result.rows.map(mapDbActivitiesToModel)
  }
}

module.exports = PlaylistSongsService
