const Joi = require('joi')

const UserPayloadSchema = Joi.object({
  username: Joi.string().min(3).required().alphanum().trim(),
  password: Joi.string().required().min(5).alphanum().trim(),
  fullname: Joi.string().regex(/^[a-zA-Z\s]*$/).min(3).required().trim()
})

module.exports = { UserPayloadSchema }
