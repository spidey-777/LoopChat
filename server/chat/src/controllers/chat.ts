import axios from "axios";
import tryCatch from "../config/tryCatch.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { Chat } from "../models/Chat.js";
import { Messages } from "../models/Messages.js";

export const createNewChat = tryCatch(async (req:AuthenticatedRequest,res)=>{
    const userId = req.user?._id;
    const {otherUserId} = req.body;

    if(!otherUserId){
        return res.status(400).json({
            message:"other user id is required",
        })
    }
    const existingChat = await Chat.findOne({
        users:{$all :[userId,otherUserId],$size:2},
    })
    if(existingChat){
        res.json({
            message:"chat already exist",
            chatId: existingChat._id
        })
        return;
    }
    const newChat = await Chat.create({
        users:[userId,otherUserId],

    })

    res.status(200).json({
        message:"new chat created",
        chatId: newChat._id 
    })


})

export const getAllChat = tryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(400).json({ message: "userId missing" });
  }

  // ✅ Use correct field name: "users"
  const chats = await Chat.find({ users: userId }).sort({ updatedAt: -1 });

  const chatWithUserData = await Promise.all(
    chats.map(async (chat) => {
      const otherUserId = chat.users.find((id) => id !== userId);

      const unSeenCount = await Messages.countDocuments({
        chatId: chat._id,
        sender: { $ne: userId },
        seen: false,
      });

      try {
        const { data } = await axios.get(
          `${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`
        );

        return {
          user: data,
          chat: {
            ...chat.toObject(),
            latestMessage: chat.latestMessage || null,
          },
          unSeenCount,
        };
      } catch (error) {
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
    })
  );

  res.status(200).json({ chats: chatWithUserData });
});


export const sendMessage = tryCatch(async(req:AuthenticatedRequest,res)=>{
    const senderId = req.user?._id;
    const {chatId,text} = req.body;
    // const imageFile = req.file

})