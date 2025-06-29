const { nanoid } = require('nanoid')
const { Pool } = require('pg')

class LikesService {
  constructor (cacheService) {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL
    })

    this._cacheService = cacheService
  }

  async addLike (albumId, userId) {
    const id = `likes-${nanoid(16)}`
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, albumId, userId]
    }

    await this._pool.query(query)
  }

  async deleteLike (albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId]
    }

    await this._pool.query(query)
  }

  async likeOrUnlike (albumId, userId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId]
    }
    const result = await this._pool.query(query)

    if (!result.rowCount) {
      this.addLike(albumId, userId)
    } else {
      this.deleteLike(albumId, userId)
    }

    await this._cacheService.delete(`likes:${albumId}`)
    return result.rows
  }

  async countLike (id) {
    try {
      const result = await this._cacheService.get(`likes:${id}`)
      const count = JSON.parse(result)
      const cache = true
      return ({ count, cache })
    } catch (error) {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [id]
      }
      const result = await this._pool.query(query)

      await this._cacheService.set(`likes:${id}`, JSON.stringify(result.rows.length))

      const count = result.rows.length
      const cache = false
      return ({ count, cache })
    }
  }
}

module.exports = LikesService
