const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not configured.');
    }

    if (
      process.env.MONGO_URI.includes('cluster0.8kanshu.mongodb.net') &&
      !process.env.MONGO_URI.startsWith('mongodb+srv://')
    ) {
      throw new Error(
        'Atlas connection string must start with mongodb+srv:// for cluster0.8kanshu.mongodb.net.'
      );
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);

    if (/IP.*whitelist|Could not connect to any servers/i.test(error.message)) {
      console.error(
        'MongoDB Atlas connection failed. Confirm Atlas Network Access allows your IP and your network allows outbound MongoDB traffic on port 27017. If mongodb+srv:// fails with querySrv, use the non-SRV seedlist connection string.'
      );
    }
  }
};

module.exports = connectDB;
