const Joi = require('joi')

const AlbumPayloadSchema = Joi.object({
  title: Joi.string().required().trim(),
  artist: Joi.string().required().trim(),
  year: Joi.number().required()
})

module.exports = { AlbumPayloadSchema }
