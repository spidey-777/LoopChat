import mongoose from "mongoose";

const connectDb = async () => {
  const url = process.env.MONGO_URI;

  if (!url) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  try {
    await mongoose.connect(url, {
      dbName: "LoopChat"
    });
    
    // Handle MongoDB connection events
    mongoose.connection.on('connected', () => {
      console.log('✅ Connected to MongoDB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    // Handle app termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB", error);
    throw error; // Let the caller handle the error
  }
};

export default connectDb;
