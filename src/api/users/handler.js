class UserHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator

    this.postUserHandler = this.postUserHandler.bind(this)
    this.getUserHandler = this.getUserHandler.bind(this)
  }

  async postUserHandler (request, h) {
    this._validator.validateUserPayload(request.payload)
    const { username, password, fullname } = request.payload

    const userId = await this._service.addUser({ username, password, fullname })

    const response = h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId
      }
    })
    response.code(201)
    return response
  }

  async getUserHandler (request, h) {
    const { id: credentialId } = request.auth.credentials

    const user = await this._service.getUser(credentialId)

    const response = h.response({
      status: 'success',
      message: 'selamat datang',
      data: {
        user
      }
    })
    response.code(200)
    return response
  }
}

module.exports = UserHandler
