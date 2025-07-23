const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists',
    handler: handler.postPlaylistHandler,
    options: {
      auth: 'openmusic_jwt'
    }
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: handler.getPlaylistsHandler
  },
  {
    method: 'GET',
    path: '/playlists/me',
    handler: handler.getPlaylistsByCurrentUserHandler,
    options: {
      auth: 'openmusic_jwt'
    }
  },
  {
    method: 'GET',
    path: '/playlists/likes',
    handler: handler.getPlaylistsLikedHandler,
    options: {
      auth: 'openmusic_jwt'
    }
  },
  {
    method: 'GET',
    path: '/playlists/collab',
    handler: handler.getPlaylistsCollabHandler,
    options: {
      auth: 'openmusic_jwt'
    }
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}',
    handler: handler.deletePlaylistByIdHandler,
    options: {
      auth: 'openmusic_jwt'
    }
  }
]

module.exports = routes
