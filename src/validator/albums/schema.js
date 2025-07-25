const Joi = require('joi')

const AlbumPayloadSchema = Joi.object({
  title: Joi.string().required().trim(),
  artist: Joi.string().required().trim(),
  year: Joi.number().required()
})

const DeleteSongFromAlbumPayloadSchema = Joi.object({
  songId: Joi.string().required().trim()
})

module.exports = { AlbumPayloadSchema, DeleteSongFromAlbumPayloadSchema }
