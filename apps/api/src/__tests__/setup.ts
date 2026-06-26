/// <reference types="vitest/globals" />
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongod: MongoMemoryReplSet

beforeAll(async () => {
  mongod = await MongoMemoryReplSet.create({ replSet: { count: 1 } })
  const uri = mongod.getUri()
  await mongoose.connect(uri)
}, 60_000)

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
}, 60_000)

afterEach(async () => {
  const collections = mongoose.connection.collections
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})))
})
