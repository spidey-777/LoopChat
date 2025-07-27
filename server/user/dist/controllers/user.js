import { publishTOQueue } from "../config/rabbitmq.js";
import tryCatch from "../config/tryCatch.js";
import { redisClient } from "../index.js";
export const loginUser = tryCatch(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    const rateLimitKey = `otp:ratelimit:${email}`;
    const rateLimit = await redisClient.get(rateLimitKey);
    if (rateLimit) {
        return res.status(429).json({
            message: "Too many requests. Please wait a minute before trying again.",
        });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `otp:${email}`;
    await redisClient.set(otpKey, otp, { EX: 300 });
    await redisClient.set(rateLimitKey, "true", { EX: 60 });
    const message = {
        to: email,
        subject: "Your One Time Code",
        body: `Your one-time code is ${otp}. It is valid for 5 minutes.`,
    };
    await publishTOQueue("send-otp", message);
    return res.status(200).json({
        message: "OTP sent to your email",
    });
});
