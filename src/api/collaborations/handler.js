class CollaborationsHandler {
  constructor (collaborationsService, validator, playlistSongsService) {
    this._collaborationsService = collaborationsService
    this._validator = validator
    this._playlistSongsService = playlistSongsService

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this)
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this)
  }

  async postCollaborationHandler (request, h) {
    this._validator.postValidateCollaborationPayload(request.payload)

    const { id: owner } = request.auth.credentials
    const { playlistId, userIds } = request.payload

    await this._playlistSongsService.verifyPlaylistOwner(playlistId, owner)

    const addedCollaborations = []

    for (const userId of userIds) {
      await this._collaborationsService.verifyUserById(userId)

      const collaborationId = await this._collaborationsService.addCollaboration(playlistId, userId)
      addedCollaborations.push({ collaborationId })
    }

    const response = h.response({
      status: 'success',
      data: {
        collaborations: addedCollaborations
      }
    })

    response.code(201)
    return response
  }

  async deleteCollaborationHandler (request, h) {
    this._validator.deleteValidateCollaborationPayload(request.payload)
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
