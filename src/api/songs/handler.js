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
    this.putSongByIdHendler = this.putSongByIdHendler.bind(this)
    this.deleteSongByIdHendler = this.deleteSongByIdHendler.bind(this)
  }

  async postSongHandler (request, h) {
    this._validator.validateSongPayload(request.payload)
    const { title, year, performer, genre, duration, albumId } = request.payload

    const { id: credentialId } = request.auth.credentials
    const songId = await this._service.addSong({ title, year, performer, genre, duration, albumId, coverUrl: null, uploader: credentialId })

    const response = h.response({
      status: 'success',
      data: {
        songId
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
    const { page = 1, limit = 10, title } = request.query
    const { page: validatedPage, limit: validatedLimit, offset } = validateAndCalculatePagination(page, limit)

    const total = await this._service.getSongsCount(title)
    const songs = await this._service.getSongs(title, offset, validatedLimit)

    return createPaginationResponse(h, {
      total,
      results: songs,
      resourceName: 'songs'
    }, validatedPage, validatedLimit)
  }

  async getSongByIdHendler (request, h) {
    const { id } = request.params

    // Ambil data terpisah dari service
    const [songData, likes] = await Promise.all([
      this._service.getSongById(id),
      this._service.getSongLikes(id)
    ])

    // Gunakan mapper function
    const song = mapSongDBToModel(songData, likes)

    return h.response({
      status: 'success',
      data: { song }
    }).code(200)
  }

  async putSongByIdHendler (request) {
    this._validator.validateSongPayload(request.payload)
    const { title, year, performer, genre, duration } = request.payload
    const { id } = request.params

    const { id: credentialId } = request.auth.credentials
    await this._service.verifySongUploader(id, credentialId)

    await this._service.editSongById(id, { title, year, performer, genre, duration })

    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui'
    }
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
