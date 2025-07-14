const routes = (handler) => [
  {
    method: 'POST',
    path: '/songs',
    handler: handler.postSongHandler,
    options: {
      auth: 'openmusic_jwt'
    }
  },
  {
    method: 'GET',
    path: '/songs/me',
    handler: handler.getSongsByCurrentUserHandler,
    options: {
      auth: 'openmusic_jwt'
    }
  },
  {
    method: 'GET',
    path: '/songs/likes',
    handler: handler.getSongsLikedByCurrentUserHandler,
    options: {
      auth: 'openmusic_jwt'
    }
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
    handler: handler.putSongByIdHendler,
    options: {
      auth: 'openmusic_jwt'
    }
  },
  {
    method: 'DELETE',
    path: '/songs/{id}',
    handler: handler.deleteSongByIdHendler,
    options: {
      auth: 'openmusic_jwt'
    }
  }
]

module.exports = routes
