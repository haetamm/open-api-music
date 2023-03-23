// mengimpor dotenv dan menjalankan konfigurasinya
require('dotenv').config()

const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')
const Inert = require('@hapi/inert')
const path = require('path')

// albums plugin
const albums = require('./api/albums')
const AlbumsService = require('./services/postgres/AlbumsServices')
const AlbumsValidator = require('./validator/albums')

// songs plugin
const songs = require('./api/songs')
const SongsService = require('./services/postgres/SongsServices')
const SongsValidator = require('./validator/songs')

// users plugin
const users = require('./api/users')
const UsersService = require('./services/postgres/UsersService')
const UsersValidator = require('./validator/users')

// authentications plugin
const authentications = require('./api/authentications')
const AuthenticationsService = require('./services/postgres/AuthenticationsService')
const TokenManager = require('./tokenize/TokenManager')
const AuthenticationsValidator = require('./validator/authentications')

// plugin playlists
const playlists = require('./api/playlists')
const PlaylistsService = require('./services/postgres/PlaylistsService')
const PlaylistsValidator = require('./validator/playlists')

// plugin playlist_song
const playlistSongs = require('./api/playlist_songs')
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService')
const PlaylistSongsValidator = require('./validator/playlist_songs')

// plugin collaborations
const collaborations = require('./api/collaborations')
const CollaborationsService = require('./services/postgres/CollaborationsService')
const CollaborationsValidator = require('./validator/collaborations')

// exports
const _exports = require('./api/exports')
const ProducerService = require('./services/rabbitmq/ProducerService')
const ExportsValidator = require('./validator/exports')

// uploads
const uploads = require('./api/uploads')
const StorageService = require('./services/storage/StorageService')
const UploadValidator = require('./validator/uploads')

// likes
const likes = require('./api/likes')
const LikesService = require('./services/postgres/LikesService')

// redis
const CacheService = require('./services/redis/CacheService')

const ClientError = require('./exceptions/ClientError')

const init = async () => {
  const cacheService = new CacheService()
  const collaborationsService = new CollaborationsService()
  const albumsService = new AlbumsService()
  const songsService = new SongsService()
  const usersService = new UsersService()
  const authenticationsService = new AuthenticationsService()
  const playlistsService = new PlaylistsService()
  const playlistSongsService = new PlaylistSongsService(collaborationsService)
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'))
  const likesService = new LikesService(cacheService)

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  })

  // register plugin eksternal
  await server.register([
    {
      plugin: Jwt
    },
    {
      plugin: Inert
    }
  ])

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id
      }
    })
  })

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator
      }
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator
      }
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator
      }
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator
      }
    },
    {
      plugin: playlistSongs,
      options: {
        service: playlistSongsService,
        validator: PlaylistSongsValidator
      }
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
        playlistSongsService
      }
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        validator: CollaborationsValidator,
        playlistSongsService
      }
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
        playlistSongsService
      }
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadValidator,
        albumsService
      }
    },
    {
      plugin: likes,
      options: {
        service: likesService,
        albumsService
      }
    }
  ])

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request
    if (response instanceof Error) {
      // penanganan client error secara internal.
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message
        })
        newResponse.code(response.statusCode)
        return newResponse
      }
      // mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc.
      if (!response.isServer) {
        return h.continue
      }
      // penanganan server error sesuai kebutuhan
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami'
      })
      newResponse.code(500)
      return newResponse
    }
    // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue
  })

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}

init()
