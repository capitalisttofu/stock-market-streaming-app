import { KafkaJS } from '@confluentinc/kafka-javascript'
import { LOCAL_KAFKA_BROKER_LIST } from '../constants'

const kafka = new KafkaJS.Kafka({
  kafkaJS: {
    brokers: LOCAL_KAFKA_BROKER_LIST,
  },
})

export const admin = kafka.admin()

export const producer = kafka.producer({
  kafkaJS: {},
})

export const getConsumer = (consumerGroupId: string) => {
  return kafka.consumer({
    kafkaJS: {
      groupId: consumerGroupId,
      fromBeginning: true,
    },
  })
}
