const redis = require('redis')

class CacheService {
  constructor () {
    this._client = redis.createClient({
      url: process.env.REDIS_URL // Gunakan REDIS_URL dari .env
    })

    this._client.on('error', (error) => {
      console.error('Redis error:', error)
    })

    this._client.on('connect', () => {
      console.log('Connected to Upstash Redis')
    })

    this._client.on('ready', () => {
      console.log('Redis client ready')
    })

    // Connect to Redis
    this._client.connect().catch((err) => {
      console.error('Failed to connect to Upstash Redis:', err)
    })
  }

  async set (key, value, expirationInSecond = 1800) {
    try {
      await this._client.set(key, value, {
        EX: expirationInSecond
      })
    } catch (error) {
      console.error(`Failed to set key ${key}:`, error)
      throw error
    }
  }

  async get (key) {
    try {
      const result = await this._client.get(key)
      if (result === null) {
        throw new Error('Cache tidak ditemukan')
      }
      return result
    } catch (error) {
      console.error(`Failed to get key ${key}:`, error)
      throw error
    }
  }

  async delete (key) {
    try {
      return await this._client.del(key)
    } catch (error) {
      console.error(`Failed to delete key ${key}:`, error)
      throw error
    }
  }
}

module.exports = CacheService
