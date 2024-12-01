import {
  BUY_SELL_ADVICE_TOPIC,
  DISCARDED_DATA_TOPIC,
  EMA_RESULTS_TOPIC,
  FLINK_PARALELLISM,
  LATE_TRADE_EVENTS_TOPIC,
  RECREATE_RAW_TRADE_DATA_TOPIC_ON_PROVISION,
  SORTED_RAW_TRADE_DATA_TOPIC,
  TRADE_DATA_TOPIC,
} from './constants'
import { admin } from './lib/kafka'

export const main = async () => {
  console.log('Provisioning kafka')

  await admin.connect()

  try {
    const existingTopics = await admin.listTopics()
    console.log(`existing topics ${existingTopics}`)

    const existingTopicsSet = new Set([...existingTopics])

    const rawTradeEventTopicExists = existingTopicsSet.has(
      SORTED_RAW_TRADE_DATA_TOPIC,
    )

    // For local testing to save space and local machine io, we only have replication factor of 1
    const replicationFactor = 1

    if (
      !rawTradeEventTopicExists ||
      RECREATE_RAW_TRADE_DATA_TOPIC_ON_PROVISION
    ) {
      if (rawTradeEventTopicExists) {
        console.log(
          `Recreating ${SORTED_RAW_TRADE_DATA_TOPIC} because of env RECREATE_RAW_TRADE_DATA_TOPIC_ON_PROVISION`,
        )
        await admin.deleteTopics({ topics: [SORTED_RAW_TRADE_DATA_TOPIC] })
      }

      console.log('Creating topic', SORTED_RAW_TRADE_DATA_TOPIC)
      await admin.createTopics({
        topics: [
          {
            topic: SORTED_RAW_TRADE_DATA_TOPIC,
            numPartitions: FLINK_PARALELLISM,
            replicationFactor,
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

    if (existingTopicsSet.has(DISCARDED_DATA_TOPIC)) {
      console.log('Deleting Discarded Data topic')
      await admin.deleteTopics({ topics: [DISCARDED_DATA_TOPIC] })
    }

    if (existingTopicsSet.has(EMA_RESULTS_TOPIC)) {
      console.log('Deleting Ema results topic')
      await admin.deleteTopics({ topics: [EMA_RESULTS_TOPIC] })
    }

    if (existingTopicsSet.has(LATE_TRADE_EVENTS_TOPIC)) {
      console.log('Deleting late trade data topic')
      await admin.deleteTopics({ topics: [LATE_TRADE_EVENTS_TOPIC] })
    }

    console.log(
      `Creating topics ${TRADE_DATA_TOPIC}, ${BUY_SELL_ADVICE_TOPIC}, ${EMA_RESULTS_TOPIC}, ${LATE_TRADE_EVENTS_TOPIC} and ${DISCARDED_DATA_TOPIC}`,
    )

    await admin.createTopics({
      topics: [
        {
          topic: TRADE_DATA_TOPIC,
          numPartitions: FLINK_PARALELLISM,
          replicationFactor,
        },
        {
          topic: BUY_SELL_ADVICE_TOPIC,
          numPartitions: FLINK_PARALELLISM,
          replicationFactor,
        },
        {
          topic: EMA_RESULTS_TOPIC,
          numPartitions: FLINK_PARALELLISM,
          replicationFactor,
        },
        {
          topic: DISCARDED_DATA_TOPIC,
          numPartitions: FLINK_PARALELLISM,
          replicationFactor,
        },
        {
          topic: LATE_TRADE_EVENTS_TOPIC,
          numPartitions: FLINK_PARALELLISM,
          replicationFactor,
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
