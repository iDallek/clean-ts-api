import { MongoHelper as SUT } from './mongo-helper'

describe('Mongo Helper', () => {
  beforeAll(async () => {
    // @ts-expect-error: Unreachable code error
    await SUT.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await SUT.disconnect()
  })

  test('Should reconnect if mongodb is down', async () => {
    let accountCollection = await SUT.getCollection('accounts')
    expect(accountCollection).toBeTruthy()
    await SUT.disconnect()
    accountCollection = await SUT.getCollection('accounts')
    expect(accountCollection).toBeTruthy()
  })
})
