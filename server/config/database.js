// Handles the connection to the MongoDB database using Mongoose

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Attempt to connect to the MongoDB cluster
    // The connection string is retrieved from environment variables for security
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected successfully');
  } catch (error) {
    // Log any errors that occur during connection
    console.error(`Error connecting to MongoDB: ${error.message}`);
    
    // Exit the process with a failure code if connection fails
    process.exit(1);
  }
};

module.exports = connectDB;
