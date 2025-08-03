const InvariantError = require('../../exceptions/InvariantError')
const { DeleteCollaborationPayloadSchema, PostCollaborationPayloadSchema } = require('./schema')

const CollaborationsValidator = {
  postValidateCollaborationPayload: (payload) => {
    const validationResult = PostCollaborationPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },

  deleteValidateCollaborationPayload: (payload) => {
    const validationResult = DeleteCollaborationPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

module.exports = CollaborationsValidator
