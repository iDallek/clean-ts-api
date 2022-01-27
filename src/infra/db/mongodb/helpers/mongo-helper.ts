import { Collection, MongoClient } from 'mongodb'

export const MongoHelper = {
  client: null as unknown as MongoClient,

  async connect (uri: string) {
    this.client = await MongoClient.connect(uri)
  },

  async disconnect (): Promise<void> {
    await this.client.close()
  },

  getCollection (name: string): Collection {
    return this.client.db().collection(name)
  },

  map (collection: any, actionStatus: boolean): any {
    if (actionStatus) {
      const { _id, ...collectionWithoutId } = collection
      return Object.assign({}, collectionWithoutId, { id: _id })
    }
  }
}
