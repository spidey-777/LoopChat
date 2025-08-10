import axios from "axios";
import tryCatch from "../config/tryCatch.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { Chat } from "../models/Chat.js";
import { Messages } from "../models/Messages.js";
import { getRecieverSocketId, io } from "../config/socket.js";

export const createNewChat = tryCatch(
  async (req: AuthenticatedRequest, res) => {
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
  }
);

export const getAllChat = tryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(400).json({ message: "userId missing" });
  }

  const chats = await Chat.find({ users: userId }).sort({ updatedAt: -1 });

  const chatWithUserData = await Promise.all(
    chats.map(async (chat) => {
      const otherUserId = chat.users.find((id) => id.toString() !== userId.toString());

      const unSeenCount = await Messages.countDocuments({
        chatId: chat._id,
        sender: { $ne: userId },
        seen: false,
      });

      try {

        const userServiceUrl = new URL(process.env.USER_SERVICE!);
        userServiceUrl.pathname = `/api/v1/user/${otherUserId}`;

        const { data } = await axios.get(userServiceUrl.toString());

        return {
          user: data,
          chat: {
            ...chat.toObject(),
            latestMessage: chat.latestMessage || null,
          },
          unseenCount: unSeenCount,
        };
      } catch (error: any) {
        console.error("Error fetching user data:", error.message);
        console.error("Failed URL:", `${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`);
        return {
          user: null,
          chat: {
            ...chat.toObject(),
            latestMessage: chat.latestMessage || null,
          },
          unseenCount: unSeenCount,
        };
      }
    })
  );

  res.status(200).json({ chats: chatWithUserData });
});
export const sendMessage = tryCatch(async (req: AuthenticatedRequest, res) => {
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
  const isUserInChat = chat.users.some(
    (userId) => userId.toString() === senderId.toString()
  );
  if (!isUserInChat) {
    return res.status(403).json({
      message: "you are not a participant of this chat",
    });
  }
  const otherUserId = chat.users.find(
    (userId) => userId.toString() !== senderId.toString()
  );
  if (!otherUserId) {
    return res.status(401).json({
      message: "no other user",
    });
  }
  //soket setup
  const receiverSocketId = getRecieverSocketId(otherUserId.toString());
  let isReceiverInChatRoom = false;

if(receiverSocketId){
  const receiverSocket = io.sockets.sockets.get(receiverSocketId);
  if(receiverSocket && receiverSocket.rooms.has(chatId)){
    isReceiverInChatRoom= true;
  }
}

  let messageData: any = {
    chatId: chatId,
    sender: senderId,
    seen: isReceiverInChatRoom,
    seenAt: isReceiverInChatRoom ? new Date():undefined,
  };

  if (imageFile) {
    messageData.image = {
      url: imageFile.path,
      publicId: imageFile.filename,
    };
    messageData.messageType = "image";
    messageData.text = text || "";
  } else {
    messageData.text = text;
    messageData.messageType = "text";
  }

  const message = new Messages(messageData);

  const savedMessage = await message.save();

  const latestMessageText = imageFile ? "📷 image" : text;
await Chat.findByIdAndUpdate(
  chatId,
  {
    latestMessage: {
      text: latestMessageText,
      sender: senderId,
    },
    updatedAt: new Date(), 
  },
  { new: true }
);

  //amit to scoket

  io.to(chatId).emit("newMessage",savedMessage);

  if(receiverSocketId){
    io.to(receiverSocketId).emit("newMessage",savedMessage)
  }

  const senderSocketId = getRecieverSocketId(senderId.toString());

  if(senderSocketId){
    io.to(senderSocketId).emit("newMessage",savedMessage)
  }

  if(isReceiverInChatRoom && senderSocketId){
    io.to(senderSocketId).emit("messagesSeen",{
      chatId:chatId,
      seenBy:otherUserId,
      messageIds:[savedMessage._id],

    })
  }

  res.status(201).json({
    message: savedMessage,
    sender: senderId,
  });
});

export const getMessageByChat = tryCatch(
  async (req: AuthenticatedRequest, res) => {
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
    const isUserInChat = chat.users.some(
      (userId) => userId.toString() === userId.toString()
    );
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
    await Messages.updateMany(
      {
        chatId: chatId,
        sender: { $ne: userId },
        seen: false,
      },
      {
        seen: true,
        seenAt: new Date(),
      }
    );

    const messages = await Messages.find({ chatId }).sort({ createdAt: 1 });

    const otherUserId = chat.users.find((id) => id !== userId);

    try {
      const { data } = await axios.get(
        `${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`
      );
      if (!otherUserId) {
        return res.status(400).json({
          message: "no other user",
        });
      }
      //soket work
      if(messagesToMarkSeen.length>0){
        const otherUserSocketId = getRecieverSocketId(otherUserId.toString());
        if(otherUserSocketId){
          io.to(otherUserSocketId).emit("messagesSeen",{
            chatId:chatId,
            seenBy:userId,
            messageIds:messagesToMarkSeen.map((msg)=>msg._id)
          })
        }
      }

      res.json({
        messages,
        user: data,
      });
    } catch (error) {
      console.log(error);
      res.json({
        messages,
        user: { _id: otherUserId, name: "Unknown user" },
      });
    }
  }
);
