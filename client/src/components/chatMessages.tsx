import { Message } from "@/app/chat/page";
import { User } from "@/context/appContext";
import React, { useEffect, useMemo, useRef } from "react";
import moment from "moment";
import { Check, CheckCheck } from "lucide-react";

interface ChatMessagesProps {
  selectedUser: string | null;
  messages: Message[] | null;
  loggedInUser: User | null;
}
const ChatMessages = ({
  selectedUser,
  messages,
  loggedInUser,
}: ChatMessagesProps) => {
  const bottamRef = useRef<HTMLDivElement>(null);
  //seen feature

  const uniqueMessages = useMemo(() => {
    if (!messages) return [];
    const newSeen = new Set();
    return messages.filter((message) => {
      if (newSeen.has(message._id)) return false;
      newSeen.add(message._id);
      return true;
    });
  }, [messages]);
  useEffect(() => {
    bottamRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedUser, uniqueMessages]);
  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full max-h-[calc(100vh-200px)] overflow-y-auto p-4 custom-scroll">
        {!selectedUser ? (
          <p className="text-gray-400 text-center mt-20 ">
            please select a user to start chatting
          </p>
        ) : (
          <>
            {uniqueMessages.map((e, i) => {
              const isSendByLoggedInUser = e.sender === loggedInUser?._id;
              const uniqueKey = `${e._id}-${i}`;
              return (
                <div
                  key={uniqueKey}
                  className={`flex flex-col gap-1 mt-2  ${
                    isSendByLoggedInUser ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`rounded-lg p-3 max-w-sm ${
                      isSendByLoggedInUser
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {e.messageType === "image" && e.image && (
                      <div className="relative group">
                        <img
                          src={e.image.url}
                          alt="shared image"
                          className="max-w-full h-auto rounded-lg "
                        />
                      </div>
                    )}
                    {e.text && <p className="text-sm mt-1 ">{e.text}</p>}
                  </div>
                  <div
                    className={`flex items-center gap-2 text-xs text-gray-400 ${
                      isSendByLoggedInUser ? "pr-2 flow-row-reverse" : "pl-2"
                    }`}
                  >
                    <span>{moment(e.createdAt).format("hh:mm A . MMM D")}</span>
                    {
                      isSendByLoggedInUser && <div className="flex items-center ml-1 ">
                        {
                          e.seen? <div className="flex items-center gap-1 text-blue-400 ">
                            <CheckCheck className="w-3 h-3"/>
                            {
                              e.seenAt && <span>{moment(e.seenAt).format("hh:mm A ")} </span>
                            }
                          </div>: <Check className="w-3 h-3 text-gray-500"/>
                        }
                        
                      </div>
                    }
                  </div>
                </div>
              );
            })}
            <div ref={bottamRef} />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatMessages;
