import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import {createClient} from 'redis'
import userRoutes from './routes/user.js'
import { connectRabbitMQ } from "./config/rabbitmq.js";
import cors from "cors"

dotenv.config(); 

// Initialize app first
const app = express();

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Initialize Redis client
export const redisClient = createClient({
  url: process.env.REDIS_URL
});

// Connect to services with proper error handling
const initializeServices = async () => {
  try {
    await connectDb();
    await connectRabbitMQ();
    
    // Redis connection with better error handling
    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
    
    redisClient.on('disconnect', () => {
      console.log('Redis Client Disconnected');
    });
    
    redisClient.on('reconnecting', () => {
      console.log('Redis Client Reconnecting...');
    });
    
    await redisClient.connect();
    console.log("✅ Connected to Redis");
    
  } catch (error) {
    console.error('Failed to initialize services:', error);
    process.exit(1);
  }
};

app.use(express.json());
app.use(cors());

app.use('/api/v1', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;

// Start server after services are initialized
initializeServices().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
  
  // Graceful shutdown
  const gracefulShutdown = (signal: string) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    server.close(async () => {
      console.log('HTTP server closed.');
      
      try {
        if (redisClient) {
          await redisClient.quit();
          console.log('Redis connection closed.');
        }
      } catch (error) {
        console.error('Error during shutdown:', error);
      }
      
      process.exit(0);
    });
  };
  
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
