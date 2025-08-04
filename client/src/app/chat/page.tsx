'use client';
import ChatSideBar from '@/components/chatSidebar';
import Loading from '@/components/Loading';
import { useAppData,User } from '@/context/appContext'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

export interface Message{
  _id:string;
  chatId:string;
  sender:string;
  text?:string;
  image?:{
    url:string;
    publicId:string;
  },
  messageType: 'text'|"image";
  seen:boolean;
  seenAt?:string;
  createdAt:string;
}

const ChatApp = () => {
  const {isAuth,loading,logoutUser,chats,user:loginUser,users,fetchChats,setChats} = useAppData();
  const router = useRouter();
  const [selectedUser,setSelectedUser] = useState<string|null>("");
  const [message,setMessage] = useState('');
  const [sidebarOpen,setSidebarOpen] = useState<boolean>(true);
  const [messages,setMessages] = useState<Message[]|null>(null);
  const [user,setUser] = useState<User|null>(null);
  const [showAllUsers,setShowAllUsers] = useState<boolean>(false);
  const [isTyping,setIsTyping] = useState<boolean>(false);
  const [typingTimeout,setTypingTimeout] = useState<NodeJS.Timeout|null>(null);

  useEffect(() => {
    if(!isAuth && !loading){
      router.push('/login');
    }
  }, [isAuth, loading, router]);  
  if(loading){
    return <Loading/>
  }
  const handleLogout = ()=> logoutUser();
  return (
    <div className='min-h-screen flex bg-gray-900 text-white relative overflow-hidden'>
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
      />
    </div>
  )
}

export default ChatApp