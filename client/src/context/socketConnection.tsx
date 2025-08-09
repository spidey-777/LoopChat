'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client"
import { chat_service, useAppData } from "./appContext";

interface SocketContexType{
    socket: Socket| null;


}

const SocketContex = createContext<SocketContexType>({
    socket:null,

})


interface ProviderProps{
    children: ReactNode;

}

export const SocketProvider =({children}:ProviderProps)=>{
    const [socket,SetSocket]=useState<Socket|null>(null);
    const {user} = useAppData();

    useEffect(()=>{
        if(!user?._id) return;

        const newSocket = io(chat_service);

        SetSocket(newSocket);


        return ()=>{
            newSocket.disconnect()
        }
    },[user?._id])

    return <SocketContex.Provider value={{socket}}>{children}</SocketContex.Provider>

}

export const SocketData = ()=> useContext(SocketContex);

