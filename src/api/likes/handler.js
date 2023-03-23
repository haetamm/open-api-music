class LikesHandler {
  constructor (service, albumsService) {
    this._service = service
    this._albumsService = albumsService

    this.postLikesHandler = this.postLikesHandler.bind(this)
    this.getLikesHandler = this.getLikesHandler.bind(this)
  }

  async postLikesHandler (request, h) {
    const userId = request.auth.credentials.id
    const { id } = request.params

    await this._albumsService.getAlbumById(id)

    const result = await this._service.likeOrUnlike(id, userId)
    const message = result.length ? 'unlike album berhasil' : 'like album berhasil'

    const response = h.response({
      status: 'success',
      message
    })
    response.code(201)
    return response
  }

  async getLikesHandler (request, h) {
    const { id } = request.params

    const { count, cache } = await this._service.countLike(id)

    const response = h.response({
      status: 'success',
      data: {
        likes: count
      }
    })
    if (cache) response.header('X-Data-Source', 'cache')
    response.code(200)
    return response
  }
}

module.exports = LikesHandler
