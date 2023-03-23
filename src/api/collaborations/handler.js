class CollaborationsHandler {
  constructor (collaborationsService, validator, playlistSongsService) {
    this._collaborationsService = collaborationsService
    this._validator = validator
    this._playlistSongsService = playlistSongsService

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this)
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this)
  }

  async postCollaborationHandler (request, h) {
    this._validator.validateCollaborationPayload(request.payload)
    const { id: owner } = request.auth.credentials
    const { playlistId, userId } = request.payload

    await this._collaborationsService.verifyUsername(userId)

    await this._playlistSongsService.verifyPlaylistOwner(playlistId, owner)

    const collaborationId = await this._collaborationsService.addCollaboration(playlistId, userId)

    const response = h.response({
      status: 'success',
      data: {
        collaborationId
      }
    })
    response.code(201)
    return response
  }

  async deleteCollaborationHandler (request, h) {
    this._validator.validateCollaborationPayload(request.payload)
    const { id: owner } = request.auth.credentials
    const { playlistId, userId } = request.payload

    await this._playlistSongsService.verifyPlaylistOwner(playlistId, owner)

    await this._collaborationsService.deleteCollaboration(playlistId, userId)

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil dihapus'
    })
    response.code(200)
    return response
  }
}

module.exports = CollaborationsHandler
