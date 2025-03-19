import React from "react";

export type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`mb-4 p-3 rounded-lg ${
        isUser ? "bg-blue-500 text-white ml-auto" : "bg-white text-gray-800"
      } max-w-xs`}
    >
      <p>{message.content}</p>
      <div className="text-xs opacity-70 mt-1">
        {message.timestamp.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default MessageBubble;
