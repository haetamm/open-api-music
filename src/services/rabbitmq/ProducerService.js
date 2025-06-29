const amqp = require('amqplib')

const ProducerService = {
  sendMessage: async (queue, message) => {
    let connection
    try {
      // Connect to CloudAMQP using RABBITMQ_SERVER from .env
      connection = await amqp.connect(process.env.RABBITMQ_SERVER)
      const channel = await connection.createChannel()

      // Assert queue
      await channel.assertQueue(queue, {
        durable: true
      })

      // Send message to queue
      await channel.sendToQueue(queue, Buffer.from(message))
      console.log(`Message sent to queue ${queue}: ${message}`)

      // Close connection after a short delay
      setTimeout(() => {
        connection.close().catch((err) => console.error('Error closing connection:', err))
      }, 1000)
    } catch (error) {
      console.error('Error in ProducerService.sendMessage:', error)
      throw error
    }
  }
}

module.exports = ProducerService
