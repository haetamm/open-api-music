const Joi = require('joi')

const SongPayloadSchema = Joi.object({
  title: Joi.string().required().min(3).trim(),
  year: Joi.number().required().integer().min(1000).max(9999),
  genre: Joi.string().required().min(3).trim(),
  performer: Joi.string().required().min(3).trim(),
  duration: Joi.number(),
  albumId: Joi.string()
})

module.exports = { SongPayloadSchema }
