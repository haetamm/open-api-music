class SongsHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator

    this.postSongHandler = this.postSongHandler.bind(this)
    this.getSongsHandler = this.getSongsHandler.bind(this)
    this.getSongByIdHendler = this.getSongByIdHendler.bind(this)
    this.putSongByIdHendler = this.putSongByIdHendler.bind(this)
    this.deleteSongByIdHendler = this.deleteSongByIdHendler.bind(this)
  }

  async postSongHandler (request, h) {
    this._validator.validateSongPayload(request.payload)
    const { title, year, performer, genre, duration, albumId } = request.payload

    const songId = await this._service.addSong({ title, year, performer, genre, duration, albumId })

    const response = h.response({
      status: 'success',
      data: {
        songId
      }
    })
    response.code(201)
    return response
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

  async getSongByIdHendler (request) {
    const { id } = request.params

    const song = await this._service.getSongById(id)
    return {
      status: 'success',
      data: {
        song
      }
    }
  }

  async putSongByIdHendler (request) {
    this._validator.validateSongPayload(request.payload)
    const { title, year, performer, genre, duration } = request.payload
    const { id } = request.params

    await this._service.editSongById(id, { title, year, performer, genre, duration })

    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui'
    }
  }

  async deleteSongByIdHendler (request) {
    const { id } = request.params

    await this._service.deleteSongById(id)
    return {
      status: 'success',
      message: 'Lagu berhasil dihapus'
    }
  }
}

module.exports = SongsHandler
