"use client";
import ChatSideBar from "@/components/chatSidebar";
import Loading from "@/components/Loading";
import { chat_service, useAppData, User } from "@/context/appContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";
import ChatHeader from "@/components/chatHeader";
import ChatMessages from "@/components/chatMessages";
import MessageInput from "@/components/messageInput";
import { SocketData } from "@/context/socketConnection";
export interface Message {
  _id: string;
  chatId: string;
  sender: string;
  text?: string;
  image?: {
    url: string;
    publicId: string;
  };
  messageType: "text" | "image";
  seen: boolean;
  seenAt?: string;
  createdAt: string;
}

const ChatApp = () => {
  const {
    isAuth,
    loading,
    logoutUser,
    chats,
    user: loginUser,
    users,
    fetchChats,
    setChats,
  } = useAppData();

  const {onlineUsers,socket} = SocketData()

  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<string | null>("");
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAllUsers, setShowAllUsers] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );



  useEffect(() => {
    if (!isAuth && !loading) {
      router.push("/login");
    }
  }, [isAuth, loading, router]);

  const handleLogout = () => logoutUser();

  const fetchChat = async () => {
    const token = Cookies.get("token");
    if (!token) {
      toast.error("Please login to start chat");
      return;
    }
    try {
      const { data } = await axios.get(
        `${chat_service}/api/v1/message/${selectedUser}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessages(data.messages);
      setUser(data.user);
      await fetchChats();
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch chat");
    }
  };

 const moveChatToTOp = (chatId: string, newMessage: any, updatedUnseenCount = true) => {
  setChats((prev) => {
    if (!prev) return null;
    const updatedChats = [...prev];
    const chatIndex = updatedChats.findIndex((chat) => chat.chat._id === chatId);

    if (chatIndex !== -1) {
      const [moveChat] = updatedChats.splice(chatIndex, 1);

      const updatedChat = {
        ...moveChat,
        chat: {
          ...moveChat.chat,
          latestMessage: {
            text: newMessage.text,
            sender: newMessage.sender,
          },
          updatedAt: new Date().toISOString(),
          unseenCount:
            updatedUnseenCount && newMessage.sender !== loginUser?._id
              ? (moveChat.chat.unseenCount || 0) + 1
              : moveChat.chat.unseenCount || 0,
        },
      };

      updatedChats.unshift(updatedChat);
    }

    return updatedChats; 
  });
};


  const resetUnseenCount = (chatId:string)=>{
    setChats((prev)=>{
      if(!prev) return null;

      return prev.map((chat)=>{
        if(chat.chat._id === chatId){
          return {
            ...chat,
            chat:{
              ...chat.chat,
              unseenCount:0,
            }
          }
        }
        return chat;
      })

    })
  }
  const createChat = async (u: User) => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        toast.error("Please login to start chat");
        return;
      }
      const { data } = await axios.post(
        `${chat_service}/api/v1/chat/new`,
        {
          userId: loginUser?._id,
          otherUserId: u._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Chat created:", data);
      setSelectedUser(data.chatId);
      setShowAllUsers(false);
      await fetchChats();
    } catch (error) {
      toast.error("faild to start chat");
      console.error("Create chat error:", error);
    }
  };


    const handleMessageSent = async(e:any,imageFile?:File|null)=>{
      e.preventDefault();

      if(!message.trim() && !imageFile ) return;

      if(!selectedUser) return;


      //socket work 
      if(typingTimeout){
        clearTimeout(typingTimeout)
        setTypingTimeout(null);
      }
      socket?.emit('stopTyping',{
        chatId:selectedUser,
        userId: loginUser?._id
      })



      const token = Cookies.get("token");

      try {
        const formData = new FormData();

        formData.append("chatId",selectedUser)

        if(message.trim()){
          formData.append('text',message);

        }
        if(imageFile){
          formData.append('image',imageFile);

        }
        const {data} = await axios.post(`${chat_service}/api/v1/message`,formData,{
          headers:{
            Authorization: `Bearer ${token}`,
            "Content-Type":"multipart/form-data"

          }
        })
        setMessages((prev)=>{
          const currentMessages = prev || [];
          const messageExist = currentMessages.some((msg)=> msg._id === data.message._id)

          if(!messageExist){
            return [...currentMessages,data.message]
          }
          return currentMessages;

        })
        setMessage("");
        const displayText = imageFile ? "📷 image" : message;
      } catch (error:any) {
        toast.error(error.response.data.message)
        
      }


    }
    const handleTyping = (val: string)=>{
      setMessage(val);

      if(!selectedUser || !socket) {
        return;
      }

      //socket setup
      if(val.trim()){
        socket.emit('typing',{
          chatId:selectedUser,
          userId:loginUser?._id,
        })
      }

      if(typingTimeout){
        clearTimeout(typingTimeout);
      }
      const timeOut = setTimeout(()=>{
        socket.emit("stopTyping",{
           chatId:selectedUser,
          userId:loginUser?._id,
        })
      },2000)

      setTypingTimeout(timeOut);

    }
    useEffect(()=>{
        socket?.on("newMessage",(message)=>{
          console.log('recieved new message:',message);
          if(selectedUser ===message.chatId){
            setMessages((prev)=>{
              const currentMessages = prev || [];
              const messageExists = currentMessages.some(
                (msg)=>msg._id===message._id
              )

              if(!messageExists){
                return [...currentMessages,message]
              }
              return currentMessages;
            })
            moveChatToTOp(message.chatId,message,false)
          }
        })


      socket?.on("messagesSeen",(data)=>{
        console.log('Message seen by ',data);
        if(selectedUser===data.chatId){
          setMessages((prev)=>{
            if(!prev) return null;
            return prev.map((msg)=>{
              if(msg.sender===loginUser?._id && data.messageIds && data.messageIds.includes(msg._id)){
                return {
                  ...msg,
                  seen:true,
                  seenAt:new Date().toString(),

                }
              }else if(msg.sender===loginUser?._id && !data.messageIds){
                 return {
                  ...msg,
                  seen:true,
                  seenAt:new Date().toString(),

                }
              }
              return msg
            })
          })

        }
      })
      socket?.on("userTyping",(data)=>{
        console.log("recived user Typing",data)
        if(data.chatId===selectedUser && data.userId !==loginUser?._id){
          setIsTyping(true);
        }
      })

         socket?.on("userStoppedTyping",(data)=>{
        console.log("recived user stopped Typing",data)
        if(data.chatId===selectedUser && data.userId !==loginUser?._id){
          setIsTyping(false);
        }
      })

      return ()=>{
        socket?.off("newMessage")
        socket?.off("userTyping")
        socket?.off("userStoppedTyping")
      }
},[selectedUser,socket,setChats,loginUser?._id])
  useEffect(() => {
    if (selectedUser) {
      fetchChat();
      setIsTyping(false);
      resetUnseenCount(selectedUser)

      socket?.emit("joinChat",selectedUser)

      return ()=>{

        socket?.emit('leaveChat',selectedUser)
        setMessages(null);
      }
    }
  }, [selectedUser,socket]);

  useEffect(()=>{
    return ()=>{
      if(typingTimeout){
        clearTimeout(typingTimeout)
      }
    }
  },[typingTimeout])

  if (loading) {
    return <Loading />;
  }
  return (
    <div className="min-h-screen flex bg-gray-900 text-white overflow-hidden">
  {/* Sidebar with responsive behavior */}
  <div className={`${sidebarOpen ? 'block' : 'hidden md:block'} w-80 bg-gray-800 border-r border-white/10 fixed md:relative z-30 md:z-auto h-full md:h-auto left-0 top-0`}>
    <ChatSideBar
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      showAllUsers={showAllUsers}
      setShowAllUsers={setShowAllUsers}
      Users={users}
      logedInUser={loginUser}
      chats={chats}
      selectedUser={selectedUser}
      setSlectedUser={setSelectedUser}
      handleLogout={handleLogout}
      createChat={createChat}
      onlineUsers = {onlineUsers}
    />
  </div>

  {/* Main chat area */}
  <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-xl">
    <ChatHeader user={user} isTyping={isTyping} setSidebarOpen={setSidebarOpen} onlineUsers = {onlineUsers}  />
    {/* Chat Body */}
    <ChatMessages selectedUser={selectedUser} messages={messages} loggedInUser={loginUser}/>
    <MessageInput selectedUser={selectedUser} message={message} setMessage={handleTyping} handleMessageSend={handleMessageSent}/>
  </div>

  {/* Mobile overlay for sidebar */}
  {sidebarOpen && (
    <div 
      className="fixed inset-0 bg-black/50 z-20 md:hidden" 
      onClick={() => setSidebarOpen(false)}
    />
  )}
</div>

  );
};

export default ChatApp;
