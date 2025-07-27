import express from 'express';
import dotenv from "dotenv";
import connectDb from './config/db.js';
import ChatRoutes from "./routes/chat.js";
dotenv.config();
connectDb();
const app = express();
app.use(express.json());
app.use('/api/v1', ChatRoutes);
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});
