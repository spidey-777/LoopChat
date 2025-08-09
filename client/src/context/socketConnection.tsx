'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client"
import { chat_service, useAppData } from "./appContext";

interface SocketContexType{
    socket: Socket| null;
    onlineUsers: string[];



}

const SocketContex = createContext<SocketContexType>({
    socket:null,
    onlineUsers:[],

})


interface ProviderProps{
    children: ReactNode;

}

export const SocketProvider =({children}:ProviderProps)=>{
    const [socket,SetSocket]=useState<Socket|null>(null);
    const [onlineUsers,setOnlineUsers] = useState<string[]>([]);
    const {user} = useAppData();

    useEffect(()=>{
        if(!user?._id) return;

        const newSocket = io(chat_service,{
            query:{
                userId:user._id,
            }
        });

        SetSocket(newSocket);

        newSocket.on("getOnlineUser",(users:string[])=>{
            setOnlineUsers(users)
        })


        return ()=>{
            newSocket.disconnect()
        }
    },[user?._id])

    return <SocketContex.Provider value={{socket,onlineUsers}}>{children}</SocketContex.Provider>

}

export const SocketData = ()=> useContext(SocketContex);

