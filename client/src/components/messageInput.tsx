import { Loader2, Paperclip, Send, X } from 'lucide-react';
import React, { useState } from 'react'

interface MessageInputProp {
    selectedUser: string | null;
    message: string;
    setMessage: (message: string) => void;
    handleMessageSend: (e: any, imageFile?: File | null) => void;
}

const MessageInput = ({
    selectedUser,
    message,
    setMessage,
    handleMessageSend
}: MessageInputProp) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!message.trim() && !imageFile) {
            return;
        }
        setIsUploading(true);
        await handleMessageSend(e, imageFile);
        setImageFile(null);
        setIsUploading(false);
    };

    if (!selectedUser) {
        return null;
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 border-t border-gray-700 pt-2"
        >
            {imageFile && (
                <div className="relative w-fit">
                    <img
                        src={URL.createObjectURL(imageFile)}
                        alt="preview"
                        className="w-24 h-24 object-cover rounded-lg border border-gray-600"
                    />
                    <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-black rounded-full p-1"
                        onClick={() => setImageFile(null)}
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>
                </div>
            )}

            <div className="flex items-center gap-2">
                <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-2 transition-colors">
                    <Paperclip className="text-gray-300" size={18} />
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && file.type.startsWith('image/')) {
                                setImageFile(file);
                            }
                        }}
                    />
                </label>

                {/* Text Input */}
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 outline-none border border-gray-700 focus:border-gray-500"
                    placeholder="Type a message..."
                />

                {/* Send Button */}
                <button
                    type="submit"
                    disabled={(!imageFile && !message)|| isUploading}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 disabled:opacity-50"
                >
                    {isUploading ? <Loader2 className='w-4 h-4 animate-spin' /> : <Send className='w-4 h-4 '/>}
                </button>
            </div>
        </form>
    );
};

export default MessageInput;
