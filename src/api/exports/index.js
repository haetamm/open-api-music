const ExportsHandler = require('./handler')
const routes = require('./routes')

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { service, validator, playlistSongsService }) => {
    const exportsHandler = new ExportsHandler(service, validator, playlistSongsService)
    server.route(routes(exportsHandler))
  }
}
