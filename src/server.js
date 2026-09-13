const mongoose = require('mongoose');
const app = require('./app');
const { connectDatabase } = require('./config/db');
const { mongoUri, port, validateEnv } = require('./config/env');
const { scheduleExpiryJob } = require('./jobs/expiryJob');

async function start() {
  validateEnv();
  await connectDatabase(mongoUri);
  const cronJob = scheduleExpiryJob();
  const server = app.listen(port, () => console.log(`KYC API listening on port ${port}`));

  async function shutdown(signal) {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    if (cronJob && cronJob.stop) cronJob.stop();
    server.close(async () => {
      console.log('HTTP server closed.');
      await mongoose.disconnect();
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((error) => { console.error('Unable to start server:', error.message); process.exit(1); });

