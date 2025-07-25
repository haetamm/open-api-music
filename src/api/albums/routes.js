const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums',
    handler: handler.postAlbumHandler,
    options: {
      auth: 'openmusic_jwt'
    }
  },
  {
    method: 'GET',
    path: '/albums/me',
    handler: handler.getAlbumByCurrentUserHandler,
    options: {
      auth: 'openmusic_jwt'
    }
  },
  {
    method: 'GET',
    path: '/albums',
    handler: handler.getAlbumsHandler
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: handler.getAlbumByIdHandler
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: handler.putAlbumByIdHandler,
    options: {
      auth: 'openmusic_jwt'
    }
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: handler.deleteAlbumByIdHandler,
    options: {
      auth: 'openmusic_jwt'
    }
  },
  {
    method: 'DELETE',
    path: '/albums/{id}/songs',
    handler: handler.removeSongFromAlbumHandler,
    options: {
      auth: 'openmusic_jwt'
    }
  }

]

module.exports = routes
