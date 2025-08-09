import express from 'express';
import dotenv from "dotenv";
import connectDb from './config/db.js';
import ChatRoutes from "./routes/chat.js";
import cors from 'cors';
import { app, server } from './config/socket.js';
dotenv.config();
connectDb();
app.use(express.json());
app.use(cors());
app.use('/api/v1', ChatRoutes);
const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});
