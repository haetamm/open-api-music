const Joi = require('joi')

const PlaylistsPayloadSchema = Joi.object({
  name: Joi.string().required().min(3)
})

module.exports = PlaylistsPayloadSchema
