import React from "react";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
  pending?: boolean;
  error?: boolean;
  metadata?: {
    response_time?: number;
    length?: number;
    sentiment?: "positive" | "negative" | "neutral";
    contains_image_analysis?: boolean;
  };
}

export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface MessageBubbleProps {
  message: Message;
  onSendFeedback?: (
    messageId: string,
    rating: "positive" | "negative" | "neutral"
  ) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onSendFeedback,
}) => {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-3/4 rounded-lg p-3 ${
          isUser
            ? "bg-blue-500 text-white"
            : isSystem
            ? "bg-gray-300 text-gray-800"
            : message.error
            ? "bg-red-100 text-red-800"
            : "bg-gray-200 text-gray-800"
        }`}
      >
        {message.pending ? (
          <div className="flex items-center">
            <div className="animate-pulse">Thinking...</div>
          </div>
        ) : (
          <div>
            <div className="whitespace-pre-wrap">{message.content}</div>
            {message.metadata && (
              <div className="mt-2 text-xs opacity-70">
                {message.metadata.sentiment && (
                  <span
                    className={`px-1 py-0.5 rounded mr-2 ${
                      message.metadata.sentiment === "positive"
                        ? "bg-green-100 text-green-800"
                        : message.metadata.sentiment === "negative"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {message.metadata.sentiment}
                  </span>
                )}
                {message.metadata.response_time && (
                  <span className="mr-2">
                    {message.metadata.response_time}s
                  </span>
                )}
              </div>
            )}
          </div>
        )}
        <div className="text-xs opacity-60 mt-1">
          {message.timestamp.toLocaleTimeString()}
        </div>

        {/* Feedback buttons for assistant messages only */}
        {!isUser && !isSystem && onSendFeedback && !message.pending && (
          <div className="mt-2 flex space-x-2">
            <button
              onClick={() => onSendFeedback(message.id, "positive")}
              className="text-xs px-2 py-1 rounded hover:bg-gray-300 transition-colors"
              title="Thumbs up"
            >
              👍
            </button>
            <button
              onClick={() => onSendFeedback(message.id, "negative")}
              className="text-xs px-2 py-1 rounded hover:bg-gray-300 transition-colors"
              title="Thumbs down"
            >
              👎
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
