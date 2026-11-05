const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://mongodb:27017/skillbridge';
    const conn = await mongoose.connect(mongoUri, {
      bufferCommands: false,
    });
    isConnected = !!conn.connections[0].readyState;
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (err) {
    console.error(`[MongoDB Connection Error]: ${err.message}`);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw err;
  }
};

module.exports = { connectDB };
