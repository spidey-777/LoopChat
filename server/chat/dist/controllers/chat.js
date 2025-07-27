import tryCatch from "../config/tryCatch.js";
import { Chat } from "../models/Chat.js";
export const createNewChat = tryCatch(async (req, res) => {
    const userId = req.user?._id;
    const { otherUserId } = req.body;
    if (!otherUserId) {
        return res.status(400).json({
            message: "other user id is required",
        });
    }
    const existingChat = await Chat.findOne({
        users: { $all: [userId, otherUserId], $size: 2 },
    });
    if (existingChat) {
        res.json({
            message: "chat already exist",
            chatId: existingChat._id
        });
        return;
    }
    const newChat = await Chat.create({
        users: [userId, otherUserId],
    });
    res.status(200).json({
        message: "new chat created",
        chatId: newChat._id
    });
});
