const InvariantError = require('../../exceptions/InvariantError')
const { AlbumPayloadSchema, DeleteSongFromAlbumPayloadSchema } = require('./schema')

const AlbumsValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
  validateDeleteSongFromAlbumPayload: (payload) => {
    const validationResult = DeleteSongFromAlbumPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

module.exports = AlbumsValidator
