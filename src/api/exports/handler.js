class ExportsHandler {
  constructor (service, validator, playlistSongsService) {
    this._service = service
    this._validator = validator
    this._playlistSongsService = playlistSongsService

    this.postExportPlaslistsHandler = this.postExportPlaslistsHandler.bind(this)
  }

  async postExportPlaslistsHandler (request, h) {
    this._validator.validateExportPlaylistPayload(request.payload)

    const { playlistId } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._playlistSongsService.verifyPlaylistOwner(playlistId, credentialId)

    const message = {
      userId: request.auth.credentials.id,
      playlistId: request.params.playlistId,
      targetEmail: request.payload.targetEmail
    }

    await this._service.sendMessage('export:playlists', JSON.stringify(message))

    const response = h.response({
      status: 'success',
      message: 'Permintaan anda sedang kami proses'
    })
    response.code(201)
    return response
  }
}

module.exports = ExportsHandler
