const mongoose = require('mongoose');

async function connectDatabase(uri, options = {}) {
  mongoose.set('strictQuery', true);

  const defaultOptions = {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
    socketTimeoutMS: 45000,
    ...options,
  };

  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB connection disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB connection reestablished');
  });

  await mongoose.connect(uri, defaultOptions);
  return mongoose.connection;
}

module.exports = { connectDatabase };

