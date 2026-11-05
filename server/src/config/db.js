const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://mongodb:27017/skillbridge';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (err) {
    console.error(`[MongoDB Connection Error]: ${err.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB };
