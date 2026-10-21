const mongoose = require('mongoose');
const env = require('./config/env');
const app = require('./app');

async function main() {
  await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('MongoDB connected');
  // Build indexes (unique email, idempotency key) before accepting traffic.
  await mongoose.connection.syncIndexes();

  const server = app.listen(env.PORT, () => console.log(`API listening on :${env.PORT} (${env.NODE_ENV})`));

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// A rejected promise anywhere must not silently leave a half-dead process behind.
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection', err);
  process.exit(1);
});

main().catch((err) => {
  console.error('Failed to start', err);
  process.exit(1);
});
