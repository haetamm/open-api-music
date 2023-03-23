const routes = (handler) => [
  {
    method: 'POST',
    path: '/songs',
    handler: handler.postSongHandler
  },
  {
    method: 'GET',
    path: '/songs',
    handler: handler.getSongsHandler
  },
  {
    method: 'GET',
    path: '/songs/{id}',
    handler: handler.getSongByIdHendler
  },
  {
    method: 'PUT',
    path: '/songs/{id}',
    handler: handler.putSongByIdHendler
  },
  {
    method: 'DELETE',
    path: '/songs/{id}',
    handler: handler.deleteSongByIdHendler
  }
]

module.exports = routes
