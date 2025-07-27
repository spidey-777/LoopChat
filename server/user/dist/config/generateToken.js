import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECERT = process.env.JWT_SECERT;
export const generateToken = (user) => {
    return jwt.sign({ user }, JWT_SECERT, { expiresIn: "15d" });
};
