class UserHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator

    this.postUserHandler = this.postUserHandler.bind(this)
    this.getCurrentUserHandler = this.getCurrentUserHandler.bind(this)
    this.getUsersHandler = this.getUsersHandler.bind(this)
  }

  async postUserHandler (request, h) {
    this._validator.validateUserPayload(request.payload)
    const { email, password, fullname } = request.payload

    const userId = await this._service.addUser({ email, password, fullname })

    const response = h.response({
      status: 'success',
      data: {
        userId
      }
    })
    response.code(201)
    return response
  }

  async getCurrentUserHandler (request, h) {
    const { id: credentialId } = request.auth.credentials

    const user = await this._service.getUser(credentialId)

    const response = h.response({
      status: 'success',
      data: {
        user
      }
    })
    response.code(200)
    return response
  }

  async getUsersHandler (request) {
    const { name } = request.query

    const users = await this._service.getUsers(name)

    return {
      status: 'success',
      data: {
        users
      }
    }
  }
}

module.exports = UserHandler
