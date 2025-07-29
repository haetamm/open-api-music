const { createPaginationResponse, validateAndCalculatePagination } = require('../../utils/pagination')

class PlaylistsHandler {
  constructor (service, validator, playlistSongsService) {
    this._service = service
    this._validator = validator
    this._playlistSongsService = playlistSongsService

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this)
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this)
    this.getMyPlaylistsHandler = this.getMyPlaylistsHandler.bind(this)
    this.getAllMyPlaylistsHandler = this.getAllMyPlaylistsHandler.bind(this)
    this.getPlaylistsLikedHandler = this.getPlaylistsLikedHandler.bind(this)
    this.getPlaylistsCollabHandler = this.getPlaylistsCollabHandler.bind(this)
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this)
  }

  async postPlaylistHandler (request, h) {
    this._validator.validatePlaylistsPayload(request.payload)

    const { title, songId } = request.payload

    const { id: credentialId } = request.auth.credentials
    const playlist = await this._service.addPlaylist({
      title, owner: credentialId
    })

    if (songId) {
      await this._playlistSongsService.addPlaylistSong({
        songId, id: playlist.id, userId: credentialId
      })
    }

    playlist.songs = await this._service.getSongsInPlaylist(playlist.id)

    const response = h.response({
      status: 'success',
      data: {
        playlist
      }
    })
    response.code(201)
    return response
  }

  async getPlaylistsHandler (request, h) {
    const { page = 1, limit = 10, title } = request.query
    const { page: validatedPage, limit: validatedLimit, offset } = validateAndCalculatePagination(page, limit)

    const total = await this._service.getPlaylistsCount(title)
    const playlists = await this._service.getPlaylists(title, offset, validatedLimit)

    return createPaginationResponse(h, {
      total,
      results: playlists,
      resourceName: 'playlists'
    }, validatedPage, validatedLimit)
  }

  async getMyPlaylistsHandler (request, h) {
    const { id: credentialId } = request.auth.credentials
    const { page = 1, limit = 10 } = request.query
    const { page: validatedPage, limit: validatedLimit, offset } = validateAndCalculatePagination(page, limit)

    const total = await this._service.getPlaylistsByUserCount(credentialId)
    const playlists = await this._service.getPlaylistsByUser(credentialId, offset, validatedLimit)

    return createPaginationResponse(h, {
      total,
      results: playlists,
      resourceName: 'playlists'
    }, validatedPage, validatedLimit)
  }

  async getAllMyPlaylistsHandler (request, h) {
    const { id: credentialId } = request.auth.credentials

    const playlists = await this._service.getAllMyPlaylistsHandler(credentialId)

    for (const playlist of playlists) {
      playlist.songs = await this._service.getSongsInPlaylist(playlist.id)
    }

    return h.response({
      status: 'success',
      data: { playlists }
    })
  }

  async getPlaylistsLikedHandler (request, h) {
    const { id: credentialId } = request.auth.credentials
    const { page = 1, limit = 10 } = request.query
    const { page: validatedPage, limit: validatedLimit, offset } = validateAndCalculatePagination(page, limit)

    const total = await this._service.getPlaylistsLikedCount(credentialId)
    const playlists = await this._service.getPlaylistsLiked(credentialId, offset, validatedLimit)

    return createPaginationResponse(h, {
      total,
      results: playlists,
      resourceName: 'playlists'
    }, validatedPage, validatedLimit)
  }

  async getPlaylistsCollabHandler (request, h) {
    const { id: credentialId } = request.auth.credentials
    const { page = 1, limit = 10 } = request.query
    const { page: validatedPage, limit: validatedLimit, offset } = validateAndCalculatePagination(page, limit)

    const total = await this._service.getPlaylistCollabCount(credentialId)
    const playlists = await this._service.getPlaylistsCollab(credentialId, offset, validatedLimit)

    return createPaginationResponse(h, {
      total,
      results: playlists,
      resourceName: 'playlists'
    }, validatedPage, validatedLimit)
  }

  async deletePlaylistByIdHandler (request) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._playlistSongsService.verifyPlaylistOwner(id, credentialId)

    await this._service.deletePlaylistById(id)
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus'
    }
  }
}

module.exports = PlaylistsHandler
