const Joi = require('joi')

const PlaylistsPayloadSchema = Joi.object({
  title: Joi.string().required().min(3),
  songId: Joi.string().optional()
})

module.exports = PlaylistsPayloadSchema
