import axios from "axios";
import tryCatch from "../config/tryCatch.js";
import { Chat } from "../models/Chat.js";
import { Messages } from "../models/Messages.js";
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
            chatId: existingChat._id,
        });
        return;
    }
    const newChat = await Chat.create({
        users: [userId, otherUserId],
    });
    res.status(200).json({
        message: "new chat created",
        chatId: newChat._id,
    });
});
export const getAllChat = tryCatch(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(400).json({ message: "userId missing" });
    }
    const chats = await Chat.find({ users: userId }).sort({ updatedAt: -1 });
    const chatWithUserData = await Promise.all(chats.map(async (chat) => {
        const otherUserId = chat.users.find((id) => id !== userId);
        const unSeenCount = await Messages.countDocuments({
            chatId: chat._id,
            sender: { $ne: userId },
            seen: false,
        });
        try {
            const { data } = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`);
            return {
                user: data,
                chat: {
                    ...chat.toObject(),
                    latestMessage: chat.latestMessage || null,
                },
                unSeenCount,
            };
        }
        catch (error) {
            console.error("Error fetching user data:", error.message);
            return {
                user: null,
                chat: {
                    ...chat.toObject(),
                    latestMessage: chat.latestMessage || null,
                },
                unSeenCount,
            };
        }
    }));
    res.status(200).json({ chats: chatWithUserData });
});
export const sendMessage = tryCatch(async (req, res) => {
    const senderId = req.user?._id;
    const { chatId, text } = req.body;
    const imageFile = req.file;
    if (!senderId) {
        return res.status(401).json({
            message: "unauthorized",
        });
    }
    if (!chatId) {
        return res.status(400).json({
            message: "chatId required",
        });
    }
    if (!text && !imageFile) {
        return res.status(400).json({
            message: "Either text or image required",
        });
    }
    const chat = await Chat.findById(chatId);
    if (!chat) {
        return res.status(404).json({
            message: "chat not found",
        });
    }
    const isUserInChat = chat.users.some((userId) => userId.toString() === senderId.toString());
    if (!isUserInChat) {
        return res.status(403).json({
            message: "you are not a participant of this chat",
        });
    }
    const otherUserId = chat.users.find((userId) => userId.toString() !== senderId.toString());
    if (!otherUserId) {
        return res.status(401).json({
            message: "no other user",
        });
    }
    //soket setup
    let messageData = {
        chatId: chatId,
        sender: senderId,
        seen: false,
        seenAt: undefined,
    };
    if (imageFile) {
        messageData.image = {
            url: imageFile.path,
            publicId: imageFile.filename,
        };
        messageData.messageType = "image";
        messageData.text = text || "";
    }
    else {
        messageData.text = text;
        messageData.messageType = "text";
    }
    const message = new Messages(messageData);
    const savedMessage = await message.save();
    const latestMessageText = imageFile ? "📷 image" : text;
    await Chat.findByIdAndUpdate(chatId, {
        latestMessage: {
            text: latestMessageText,
            sender: senderId,
        },
        UpdatedAt: new Date(),
    }, { new: true });
    //amit to scoket
    res.status(201).json({
        message: savedMessage,
        sender: senderId,
    });
});
export const getMessageByChat = tryCatch(async (req, res) => {
    const userId = req?.user?._id;
    const { chatId } = req.params;
    if (!userId) {
        return res.status(401).json({
            message: "unauthorized",
        });
    }
    if (!chatId) {
        return res.status(400).json({
            message: "chatId required",
        });
    }
    const chat = await Chat.findById(chatId);
    if (!chat) {
        return res.status(404).json({
            message: "chat not found",
        });
    }
    const isUserInChat = chat.users.some((userId) => userId.toString() === userId.toString());
    if (!isUserInChat) {
        return res.status(403).json({
            message: "you are not a participant of this chat",
        });
    }
    const messagesToMarkSeen = await Messages.find({
        chatId: chatId,
        sender: { $ne: userId },
        seen: false,
    });
    await Messages.updateMany({
        chatId: chatId,
        sender: { $ne: userId },
        seen: false,
    }, {
        seen: true,
        seenAt: new Date(),
    });
    const messages = await Messages.find({ chatId }).sort({ createdAt: 1 });
    const otherUserId = chat.users.find((id) => id !== userId);
    try {
        const { data } = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`);
        if (!otherUserId) {
            return res.status(400).json({
                message: "no other user",
            });
        }
        //soket work
        res.json({
            messages,
            user: data,
        });
    }
    catch (error) {
        console.log(error);
        res.json({
            messages,
            user: { _id: otherUserId, name: "Unknown user" },
        });
    }
});
