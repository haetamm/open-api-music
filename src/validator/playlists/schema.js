const Joi = require('joi')

const PlaylistsPayloadSchema = Joi.object({
  title: Joi.string().required().min(3),
  songId: Joi.string().optional()
})

const UpdatePlaylistsPayloadSchema = Joi.object({
  title: Joi.string().required().min(3)
})

module.exports = { PlaylistsPayloadSchema, UpdatePlaylistsPayloadSchema }
