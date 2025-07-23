const Joi = require('joi')

const PlaylistsPayloadSchema = Joi.object({
  title: Joi.string().required().min(3)
})

module.exports = PlaylistsPayloadSchema
