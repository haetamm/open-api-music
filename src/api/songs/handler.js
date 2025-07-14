const { mapSongDBToModel } = require('../../utils/songs')

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

  async getSongsByCurrentUserHandler (request) {
    const { id: credentialId } = request.auth.credentials
    const songs = await this._service.getSongsByUploader(credentialId)

    return {
      status: 'success',
      data: {
        songs
      }
    }
  }

  async getSongsLikedByCurrentUserHandler (request) {
    const { id: credentialId } = request.auth.credentials
    const songs = await this._service.getSongsLikedByCurrentUser(credentialId)

    return {
      status: 'success',
      data: {
        songs
      }
    }
  }

  async getSongsHandler (request) {
    const { title, performer } = request.query
    console.log(title)
    const songs = await this._service.getSongs(title, performer)
    return {
      status: 'success',
      data: {
        songs
      }
    }
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
