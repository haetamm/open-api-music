class PlaylistSongsHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator

    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this)
    this.getPlaylistSongsHandler = this.getPlaylistSongsHandler.bind(this)
    this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this)
    this.getPlaylistSongActivitiesHandler = this.getPlaylistSongActivitiesHandler.bind(this)
  }

  async postPlaylistSongHandler (request, h) {
    this._validator.validatePlaylistSongsPayload(request.payload)

    const { songId } = request.payload
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials
    const userId = credentialId

    await this._service.verifySonglist(songId)
    await this._service.verifyPlaylistAccess(id, credentialId)
    await this._service.addPlaylistSong({
      songId, id, userId
    })
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlists'
    })
    response.code(201)
    return response
  }

  async getPlaylistSongsHandler (request) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._service.verifyPlaylistAccess(id, credentialId)

    const playlist = await this._service.getPlaylistSongs(id)
    const songs = await this._service.getSongsInPlaylist(id)

    playlist.songs = songs
    return {
      status: 'success',
      data: {
        playlist
      }
    }
  }

  async deletePlaylistSongHandler (request, h) {
    this._validator.validatePlaylistSongsPayload(request.payload)
    const { id } = request.params
    const { songId } = request.payload

    const { id: credentialId } = request.auth.credentials
    const userId = credentialId

    await this._service.verifyPlaylistAccess(id, credentialId)

    await this._service.deletePlaylistSong({
      songId, id, userId
    })

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlists'
    })
    response.code(200)
    return response
  }

  async getPlaylistSongActivitiesHandler (request, h) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._service.verifyPlaylistAccess(id, credentialId)

    const activiti = await this._service.getPlaylistSongActivities(id)

    const response = h.response({
      status: 'success',
      data: {
        playlistId: id,
        activities: activiti
      }
    })
    response.code(200)
    return response
  }
}

module.exports = PlaylistSongsHandler
