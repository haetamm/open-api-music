const { createPaginationResponse, validateAndCalculatePagination } = require('../../utils/pagination')

class AlbumsHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator

    this.postAlbumHandler = this.postAlbumHandler.bind(this)
    this.getAlbumByCurrentUserHandler = this.getAlbumByCurrentUserHandler.bind(this)
    this.getAlbumsHandler = this.getAlbumsHandler.bind(this)
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this)
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this)
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this)
  }

  async postAlbumHandler (request, h) {
    this._validator.validateAlbumPayload(request.payload)
    const { title, artist, year } = request.payload

    const { id: credentialId } = request.auth.credentials
    const newAlbum = await this._service.addAlbum({ title, artist, year, coverUrl: null, uploader: credentialId })

    const response = h.response({
      status: 'success',
      data: {
        newAlbum
      }
    })
    response.code(201)
    return response
  }

  async getAlbumByCurrentUserHandler (request, h) {
    const { id: credentialId } = request.auth.credentials
    const { page = 1, limit = 10 } = request.query
    const { page: validatedPage, limit: validatedLimit, offset } = validateAndCalculatePagination(page, limit)

    const total = await this._service.getAlbumsCountByUser(credentialId)
    const albums = await this._service.getAlbumsByUser(credentialId, offset, validatedLimit)

    return createPaginationResponse(h, {
      total,
      results: albums,
      resourceName: 'albums'
    }, validatedPage, validatedLimit)
  }

  async getAlbumsHandler (request, h) {
    const { page = 1, limit = 10, title } = request.query
    const { page: validatedPage, limit: validatedLimit, offset } = validateAndCalculatePagination(page, limit)

    const total = await this._service.getAlbumsCount(title)
    const albums = await this._service.getAlbums(title, offset, validatedLimit)

    return createPaginationResponse(h, {
      total,
      results: albums,
      resourceName: 'albums'
    }, validatedPage, validatedLimit)
  }

  async getAlbumByIdHandler (request) {
    const { id } = request.params

    const album = await this._service.getAlbumById(id)
    const songs = await this._service.getSongByAlbumId(id)
    album.songs = songs
    return {
      status: 'success',
      data: {
        album
      }
    }
  }

  async putAlbumByIdHandler (request) {
    this._validator.validateAlbumPayload(request.payload)
    const { title, artist, year } = request.payload
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._service.verifyAlbumUploader(id, credentialId)

    await this._service.editAlbumById(id, { title, artist, year })

    return {
      status: 'success',
      message: 'Album berhasil diperbarui'
    }
  }

  async deleteAlbumByIdHandler (request) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._service.verifyAlbumUploader(id, credentialId)

    await this._service.deletAlbumById(id)
    return {
      status: 'success',
      message: 'Album berhasil dihapus'
    }
  }
}

module.exports = AlbumsHandler
