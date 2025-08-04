import { Message } from '@/app/chat/page';
import { User } from '@/context/appContext';
import React, { useEffect, useRef } from 'react'

interface ChatMessagesProps {
    selectedUser: string | null;
    messages: Message[] | null;
    loggedInUser: User | null;
}
const ChatMessages = ({selectedUser,messages,loggedInUser}:ChatMessagesProps) => {
    const bottamRef = useRef<HTMLDivElement>(null);
    //seen feature
useEffect(() => {
    bottamRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [selectedUser]);
  return (
    <div>ChatMessages</div>
  )
}

export default ChatMessages