const Joi = require('joi')

const UserPayloadSchema = Joi.object({
  email: Joi.string().email().required().trim(),
  password: Joi.string().required().min(5).alphanum().trim(),
  fullname: Joi.string().regex(/^[a-zA-Z\s]*$/).min(3).required().trim()
})

module.exports = { UserPayloadSchema }
