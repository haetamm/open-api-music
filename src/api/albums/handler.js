class AlbumsHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator

    this.postAlbumHandler = this.postAlbumHandler.bind(this)
    this.getAlbumByCurrentUserHandler = this.getAlbumByCurrentUserHandler.bind(this)
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this)
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this)
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this)
  }

  async postAlbumHandler (request, h) {
    this._validator.validateAlbumPayload(request.payload)
    const { title, artist, year } = request.payload

    const { id: credentialId } = request.auth.credentials
    const albumId = await this._service.addAlbum({ title, artist, year, coverUrl: null, uploader: credentialId })

    const response = h.response({
      status: 'success',
      data: {
        albumId
      }
    })
    response.code(201)
    return response
  }

  async getAlbumByCurrentUserHandler (request) {
    const { id: credentialId } = request.auth.credentials
    const albums = await this._service.getAlbumsByUploader(credentialId)

    return {
      status: 'success',
      data: {
        albums
      }
    }
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
