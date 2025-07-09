const AuthenticationsHandler = require('./handler')
const routes = require('./routes')

module.exports = {
  name: 'authentications',
  version: '1.0.0',
  register: async (server, {
    authenticationsService,
    usersService,
    tokenManager,
    validator,
    admin
  }) => {
    const authenticationsHandler = new AuthenticationsHandler(
      authenticationsService,
      usersService,
      tokenManager,
      validator,
      admin
    )
    server.route(routes(authenticationsHandler))
  }
}
