import { ConfirmChannel, ConsumeMessage } from 'amqplib'
import AmqpConnectionManager from 'amqp-connection-manager'
import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/esm/AmqpConnectionManager'
import { environment } from '@/environment'
import { logger } from '@/loaders/logger'

export enum QUEUES {
  Blocks = 'process_blocks',
  Balances = 'process_balances',
  BlocksMetadata = 'process_metadata',
  Staking = 'process_staking',
}

export type TaskMessage<T> = T extends QUEUES.Blocks ? {
  entity_id: number
  collect_uid: string
} : T extends QUEUES.Balances ? {
  entity_id: number
  collect_uid: string
} : T extends QUEUES.BlocksMetadata ? {
  entity_id: number
  collect_uid: string
} : {
  entity_id: number
  collect_uid: string
}


export type QueueProcessor<T extends QUEUES> = {
  processTaskMessage: (msg: TaskMessage<T>) => Promise<void>
}

export type Rabbit = {
  send: <T extends QUEUES>(queue: T, message: TaskMessage<T>) => Promise<void>
  process: <T extends QUEUES>(queue: T, processor: QueueProcessor<T>) => Promise<void>
}

export const RabbitMQ = async (connectionString: string): Promise<Rabbit> => {

  const connection: IAmqpConnectionManager = await AmqpConnectionManager.connect(connectionString)

  connection.on('connect', () => {
    logger.info({ event: 'RabbitMQ.connection', message: 'Successfully connected' })
  })
  connection.on('close', (error: Error) => {
    logger.error({ event: 'RabbitMQ.connection', message: 'Connection closed', error })
  })
  connection.on('error', (error: Error) => {
    logger.error({ event: 'RabbitMQ.connection', message: 'Connection error', error })
  })
  connection.on('disconnect', (error: Error) => {
    logger.error({ event: 'RabbitMQ.connection', message: 'Connection disconnected', error })
  })
  connection.on('blocked', (reason: string) => {
    logger.warn({ event: 'RabbitMQ.connection', message: `Connection blocked: ${reason}` })
  })
  connection.on('unblocked', () => {
    logger.warn({ event: 'RabbitMQ.connection', message: `Connection unblocked` })
  })

  const channelWrapper = connection.createChannel({
    json: true,
    setup: function (channel: ConfirmChannel) {
      // `channel` here is a regular amqplib `ConfirmChannel`.
      // Note that `this` here is the channelWrapper instance.
      return Promise.all([
        channel.assertQueue(environment.NETWORK + ':' + QUEUES.Staking),
        channel.assertQueue(environment.NETWORK + ':' + QUEUES.Blocks),
        channel.assertQueue(environment.NETWORK + ':' + QUEUES.Balances),
        channel.assertQueue(environment.NETWORK + ':' + QUEUES.BlocksMetadata),
        channel.prefetch(1),
      ])
    },
  })

  return {
    send: async <T extends QUEUES>(queue: T, message: TaskMessage<T>) => {
      logger.debug({ event: 'RabbitMQ.send', message, buffer: Buffer.from(JSON.stringify(message)) })
      await channelWrapper.sendToQueue(environment.NETWORK + ':' + queue, message)
    },
    process: async <T extends QUEUES>(queue: T, processor: QueueProcessor<T>) => {
      const consumer =
        async (msg: ConsumeMessage | null): Promise<void> => {
          if (msg) {
            logger.debug({
              event: 'RabbitMQ.process',
              message: msg.content.toString(),
            })
            const message = JSON.parse(msg.content.toString()) //as TaskMessage<T>
            try {
              await processor.processTaskMessage(message)
              logger.debug({ event: 'memory', message: Math.ceil(process.memoryUsage().heapUsed / (1024 * 1024)) })
              channelWrapper.ack(msg)
            } catch (error: any) {
              logger.error({ event: 'RabbitMQ.process', error: error.message, message })

              //TODO: ?
              channelWrapper.ack(msg);
            }
          }
        }
      await channelWrapper.consume(environment.NETWORK + ':' + queue, consumer)
    },
  }
}
