const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');

// Transactions need a replica set, so the tests run against an in-memory single-node one.
// Set MONGOMS_SYSTEM_BINARY=/path/to/mongod to use a local mongod instead of downloading one.
let replSet;

module.exports.connect = async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  process.env.NODE_ENV = 'test';
  process.env.MONGO_URI = replSet.getUri();
  process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-123456';
  process.env.CORS_ORIGINS = 'http://allowed.test';
  await mongoose.connect(replSet.getUri());
  const { User, Account, Transaction } = require('../src/models');
  await Promise.all([User.init(), Account.init(), Transaction.init()]);
};

module.exports.clear = async () => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
};

module.exports.disconnect = async () => {
  await mongoose.disconnect();
  await replSet.stop();
};
