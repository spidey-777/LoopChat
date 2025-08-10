import { User } from "@/context/appContext";
import {
  CornerDownRight,
  CornerUpLeft,
  LogOut,
  MessageCircle,
  Plus,
  Search,
  UserCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

interface ChatSideBarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  showAllUsers?: boolean;
  setShowAllUsers?: (show: boolean | ((prev: boolean) => boolean)) => void;
  Users: User[] | null;
  logedInUser: User | null;
  chats: any[] | null;
  selectedUser: string | null;
  setSlectedUser: (userId: string | null) => void;
  handleLogout: () => void;
  createChat: (user: User) => void;
  onlineUsers: string[];
}

const ChatSideBar = ({
  sidebarOpen,
  setSidebarOpen,
  showAllUsers,
  setShowAllUsers,
  Users,
  logedInUser,
  chats,
  selectedUser,
  setSlectedUser,
  handleLogout,
  createChat,
  onlineUsers,
}: ChatSideBarProps) => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <aside
      className={`fixed z-20 top-0 left-0 h-screen w-80 bg-gray-800 
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      shadow-lg sm:translate-x-0 transition-transform duration-300 flex flex-col border-r border-gray-700 transform`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="sm:hidden flex justify-end mb-0">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {showAllUsers ? "New Chat" : "Messages"}
            </h2>
          </div>
          <button
            className={`p-2.5 rounded-lg transition-colors
              ${
                showAllUsers
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            onClick={() => setShowAllUsers((prev) => !prev)}
          >
            {showAllUsers ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Plus className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden px-4 py-2">
        {showAllUsers ? (
          <div className="space-y-4 h-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search Users..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Users list */}
            <div className="space-y-2 overflow-y-auto h-full pd-4">
              {Users?.filter(
                (user) =>
                  user._id !== logedInUser?._id &&
                  user.name.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((user) => (
                <button
                  key={user._id}
                  className="w-full text-left p-4 rounded-lg border border-gray-700
                    hover:bg-gray-800 hover:border-gray-600 transition-colors"
                  onClick={() => createChat(user)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <UserCircle className="w-8 h-8 text-gray-300" />
                      {onlineUsers.includes(user._id) && (
                        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-gray-900" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-white">
                        {user.name}
                      </span>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {onlineUsers.includes(user._id) ? (
                          <span className="text-green-500">online</span>
                        ) : (
                          "offline"
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : chats && chats.length > 0 ? (
          <div className="space-y-2 overflow-y-auto h-full pd-4">
            {chats.map((chat) => {
              const latestMessage = chat.chat.latestMessage;
              const isSelected = selectedUser === chat.chat._id;
              const isSendByLoggedInUser =
                latestMessage?.sender === logedInUser?._id;
              const unseenCount = chat.unseenCount || 0;

              return (
                <button
                  key={chat.chat._id}
                  onClick={() => {
                    setSlectedUser(chat.chat._id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left p-4 rounded-lg transition-colors
                    ${
                      isSelected
                        ? "bg-blue-600 text-white border border-blue-50"
                        : "hover:bg-gray-800 hover:border-gray-600"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                        <UserCircle className="w-8 h-8 text-gray-300" />
                      </div>
                      {onlineUsers.includes(chat.user._id) && (
                        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-gray-900" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-semibold truncate ${
                            isSelected ? "text-white" : "text-gray-200"
                          }`}
                        >
                          {chat.user.name}
                        </span>

                        {/* Unread count badge */}
                        {unseenCount > 0 && (
                          <div
                            className="bg-red-600 text-white text-xs font-bold rounded-full min-w-[22px]
                              h-[22px] flex items-center justify-center px-2"
                          >
                            {unseenCount > 99 ? "99+" : unseenCount}
                          </div>
                        )}
                      </div>

                      {latestMessage && (
                        <div className="flex items-center gap-2">
                          {isSendByLoggedInUser ? (
                            <CornerUpLeft
                              size={14}
                              className="text-blue-200 shrink-0"
                            />
                          ) : (
                            <CornerDownRight
                              size={14}
                              className="text-green-400 shrink-0"
                            />
                          )}
                          <span className="text-sm text-gray-400 truncate flex-1">
                            {latestMessage.text}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 bg-gray-800 rounded-full mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-400 font-medium">No conversation yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Start a new chat to begin chatting!
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        <Link
          href={"/profile"}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <div className="p-1.5 bg-gray-700 rounded-lg">
            <UserCircle className="w-6 h-6 text-gray-300" />
          </div>
          <span className="font-bold text-gray-300">Profile</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg 
            hover:bg-red-600 transition-colors hover:text-white text-red-200 cursor-pointer"
        >
          <div className="p-1.5 bg-red-600 rounded-lg">
            <LogOut className="w-6 h-6 text-gray-300" />
          </div>
          <span className="font-bold text-red-200">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default ChatSideBar;
