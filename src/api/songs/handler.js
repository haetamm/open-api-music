const { mapSongDBToModel } = require('../../utils/songs')
const { createPaginationResponse, validateAndCalculatePagination } = require('../../utils/pagination')

class SongsHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator

    this.postSongHandler = this.postSongHandler.bind(this)
    this.getSongsByCurrentUserHandler = this.getSongsByCurrentUserHandler.bind(this)
    this.getSongsLikedByCurrentUserHandler = this.getSongsLikedByCurrentUserHandler.bind(this)
    this.getSongsHandler = this.getSongsHandler.bind(this)
    this.getSongByIdHendler = this.getSongByIdHendler.bind(this)
    this.getSongDetailByIdHendler = this.getSongDetailByIdHendler.bind(this)
    this.putSongByIdHendler = this.putSongByIdHendler.bind(this)
    this.deleteSongByIdHendler = this.deleteSongByIdHendler.bind(this)
  }

  async postSongHandler (request, h) {
    this._validator.validateSongPayload(request.payload)
    const { title, year, performer, genre, duration, albumId } = request.payload

    const { id: credentialId } = request.auth.credentials
    const song = await this._service.addSong({ title, year, performer, genre, duration, albumId, coverUrl: null, uploader: credentialId })

    const response = h.response({
      status: 'success',
      data: {
        song
      }
    })
    response.code(201)
    return response
  }

  async getSongsByCurrentUserHandler (request, h) {
    const { id: credentialId } = request.auth.credentials
    const { page = 1, limit = 10 } = request.query
    const { page: validatedPage, limit: validatedLimit, offset } = validateAndCalculatePagination(page, limit)

    const total = await this._service.getSongsCountByUser(credentialId)
    const songs = await this._service.getSongsByUser(credentialId, offset, validatedLimit)

    return createPaginationResponse(h, {
      total,
      results: songs,
      resourceName: 'songs'
    }, validatedPage, validatedLimit)
  }

  async getSongsLikedByCurrentUserHandler (request, h) {
    const { id: credentialId } = request.auth.credentials
    const { page = 1, limit = 10 } = request.query
    const { page: validatedPage, limit: validatedLimit, offset } = validateAndCalculatePagination(page, limit)

    const total = await this._service.getSongsCountLikedByUser(credentialId)
    const songs = await this._service.getSongsLikedByCurrentUser(credentialId, offset, validatedLimit)
    return createPaginationResponse(h, {
      total,
      results: songs,
      resourceName: 'songs'
    }, validatedPage, validatedLimit)
  }

  async getSongsHandler (request, h) {
    const { page = 1, limit = 10, title, random = false } = request.query
    const { page: validatedPage, limit: validatedLimit, offset } = validateAndCalculatePagination(page, limit)

    const isRandom = random === 'true' || random === true

    const total = await this._service.getSongsCount(title)
    const songs = await this._service.getSongs(title, offset, validatedLimit, isRandom)

    return createPaginationResponse(h, {
      total,
      results: songs,
      resourceName: 'songs'
    }, validatedPage, validatedLimit)
  }

  async getSongByIdHendler (request, h) {
    const { id } = request.params
    const songData = await this._service.getSongDetailById(id)
    const album = songData.album_id ? await this._service.getAlbumDetailById(songData.album_id) : null

    const song = mapSongDBToModel(songData, [], album)
    return h.response({
      status: 'success',
      data: { song }
    }).code(200)
  }

  async getSongDetailByIdHendler (request, h) {
    const { id } = request.params

    const songData = await this._service.getSongDetailById(id)

    const [likes, album] = await Promise.all([
      this._service.getSongLikes(id),
      songData.album_id ? this._service.getAlbumDetailById(songData.album_id) : Promise.resolve(null)
    ])

    const song = mapSongDBToModel(songData, likes, album)

    return h.response({
      status: 'success',
      data: { song }
    }).code(200)
  }

  async putSongByIdHendler (request, h) {
    const { title, year, performer, genre, duration, albumId } = request.payload
    const { id } = request.params

    const { id: credentialId } = request.auth.credentials
    await this._service.verifySongUploader(id, credentialId)

    const song = await this._service.editSongById(id, { title, year, performer, genre, duration, album_id: albumId })

    const response = h.response({
      status: 'success',
      data: {
        song
      }
    })
    response.code(200)
    return response
  }

  async deleteSongByIdHendler (request) {
    const { id } = request.params

    const { id: credentialId } = request.auth.credentials
    await this._service.verifySongUploader(id, credentialId)

    await this._service.deleteSongById(id)
    return {
      status: 'success',
      message: 'Lagu berhasil dihapus'
    }
  }
}

module.exports = SongsHandler
