import { KafkaJS } from '@confluentinc/kafka-javascript'
import {
  BUY_SELL_ADVICE_TOPIC,
  LOCAL_KAFKA_BROKER_LIST,
  SORTED_RAW_TRADE_DATA_TOPIC,
  TRADE_DATA_TOPIC,
} from './constants'

export const main = async () => {
  console.log('Provisioning kafka')

  const kafka = new KafkaJS.Kafka({
    kafkaJS: {
      brokers: LOCAL_KAFKA_BROKER_LIST,
    },
  })

  const admin = kafka.admin()

  await admin.connect()

  try {
    const existingTopics = await admin.listTopics()
    console.log(`existing topics ${existingTopics}`)

    const existingTopicsSet = new Set([...existingTopics])

    // For now sorted_raw_trade_data_topic is set up with a simple
    // 1 partition and 1 replication factor to mimick a "dumb"
    // data source stream.
    // In order to fine-tune our application, and avoid losing data
    // in re-provisioning we do not recreate sorted_raw_trade_data_topic
    if (!existingTopicsSet.has(SORTED_RAW_TRADE_DATA_TOPIC)) {
      console.log('Raw data topic does not exist yet, creating')
      await admin.createTopics({
        topics: [
          {
            topic: SORTED_RAW_TRADE_DATA_TOPIC,
            numPartitions: 1,
            replicationFactor: 1,
          },
        ],
      })
    }

    if (existingTopicsSet.has(TRADE_DATA_TOPIC)) {
      console.log('Deleting Trade data topic')
      await admin.deleteTopics({ topics: [TRADE_DATA_TOPIC] })
    }

    if (existingTopicsSet.has(BUY_SELL_ADVICE_TOPIC)) {
      console.log('Deleting Buy Sell advice topic')
      await admin.deleteTopics({ topics: [BUY_SELL_ADVICE_TOPIC] })
    }

    console.log(
      `Creating topics ${TRADE_DATA_TOPIC} and ${BUY_SELL_ADVICE_TOPIC}`,
    )
    await admin.createTopics({
      topics: [
        {
          topic: TRADE_DATA_TOPIC,
          // TODO: Decide a suitable number of partitions based off
          // the approx number of symbols in the data source
          // as well as how many TaskManager slots of our
          // pyflink application we are planning on running
          numPartitions: 3,
          // For development, use only replication factor of 1 due to saving on storage
          replicationFactor: 1,
        },
        {
          topic: BUY_SELL_ADVICE_TOPIC,
          // Number of paritions in BUY_SELL_ADVICE_TOPIC should not be as critical as in TRADE_DATA_TOPIC
          // due to us expecting less number of messages being produced to the topic
          // and no additional calculations/processing being done on this topic's data
          numPartitions: 3,
          // For development, use only replication factor of 1 due to saving on storage
          replicationFactor: 1,
        },
      ],
    })

    console.log('Provisioning completed successfully')
  } catch (e) {
    console.log('Error happened in provisioning')
    console.log(e)
  } finally {
    await admin.disconnect()
  }

  process.exit()
}

void main()
