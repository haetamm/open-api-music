const Joi = require('joi')

const PostCollaborationPayloadSchema = Joi.object({
  playlistId: Joi.string().required(),
  userIds: Joi.array().items(Joi.string().required()).min(1).required()
})

const DeleteCollaborationPayloadSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required()
})

module.exports = { DeleteCollaborationPayloadSchema, PostCollaborationPayloadSchema }
