'use client';

import React, { createContext, ReactNode, useEffect, useState } from "react";
import Cookies from "js-cookie";
import toast, { Toaster} from 'react-hot-toast'
import axios from "axios";

export const user_service = 'http://localhost:5050';
export const chat_service = 'http://localhost:5002';




export interface User {
  _id: string;
  email: string;
  name: string;
}


export interface Chat {
    _id: string;
    users: User[];
    lastMessage?: {
        text: string;
        sender: string;
    };
    createdAt: string;
    updatedAt: string;
    unseenCount?: number;
}

export interface Chats{
    _id: string;
    user: User;
    chat: Chat;
}

interface AppContextType{
    user: User | null;
    loading: boolean;
    isAuth: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
    logoutUser: ()=> Promise<void>;
    fetchChats: ()=> Promise<void>;
    fetchUsers: ()=> Promise<void>;
    chats: Chats[] | null;
    users: User[] | null;
    setChats: React.Dispatch<React.SetStateAction<Chats[] | null>>;

}


const AppContext = createContext<AppContextType | undefined>(undefined);


interface AppProviderProps {
    children: ReactNode;
}   

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [user, setUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [isAuth, setIsAuth] = React.useState<boolean>(false);
    async function fetchUserData() {
    try {
        const token = Cookies.get("token");
        if (!token) {
            setLoading(false);
            return;
        }

        const response = await fetch(`${user_service}/api/v1/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUser(data);
        setIsAuth(true);
    } catch (error) {
        console.error("Error fetching user data:", error);
    } finally {
        setLoading(false);
    }
}
    async function logoutUser() {
        Cookies.remove("token")
        setUser(null);
        setIsAuth(false);
        toast.success("Logged out successfully");
    }
    const [chats,setChats]= useState<Chats[]| null>(null);
    async function fetchChats() {
        const token = Cookies.get("token");
        try {
            const {data} = await axios.get(`${chat_service}/api/v1/chat/all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            setChats(data.chats);
        } catch (error) {
            console.error("Error fetching chats:", error);
            
        }
    }
    const [users, setUsers] = useState<User[]| null>(null);
    async function fetchUsers() {
        const token = Cookies.get("token");
        try {
            const {data} = await axios.get(`${user_service}/api/v1/user/all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            setUsers(data.users);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    useEffect(()=>{
        fetchUserData();
        fetchChats();
        fetchUsers();
    },[]);
    return (
        <AppContext.Provider value={{ user, loading, isAuth, setUser, setIsAuth,logoutUser, fetchChats, fetchUsers, chats, setChats, users }}>
            {children}
            <Toaster position="top-right" reverseOrder={false} />
        </AppContext.Provider>
    );
};

export const useAppData = (): AppContextType => {
    const context = React.useContext(AppContext);
    if (!context) {
        throw new Error("useAppData must be used within an AppProvider");
    }
    return context;
}