"use client";

import React, { useState, useEffect } from "react";
import MessageBubble, { Message } from "../../components/MessageBubble";
import InputArea from "../../components/InputArea";
import useWebSocket from "../../hooks/useWebSocket";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);

  // Use our WebSocket hook
  const { connectionStatus, lastMessage, connect, sendMessage } =
    useWebSocket();

  // Connect to WebSocket when component mounts
  useEffect(() => {
    // This would typically point to your backend API
    // For testing, you might use a service like websocket-echo-server
    // or create a simple WebSocket server with Node.js
    connect("ws://localhost:8000/chat");

    // Clean up on unmount
    return () => {
      // Disconnect is automatically handled in the hook
    };
  }, [connect]);

  // Handle incoming messages
  useEffect(() => {
    if (lastMessage) {
      // Create a new message from the received data
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: lastMessage.content || JSON.stringify(lastMessage),
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    }
  }, [lastMessage]);

  // Function to handle sending a message
  const handleSendMessage = (content: string) => {
    // Create a new message object
    const newMessage: Message = {
      id: Date.now().toString(),
      content: content,
      role: "user",
      timestamp: new Date(),
    };

    // Add to messages
    setMessages((prev) => [...prev, newMessage]);

    // Send via WebSocket
    sendMessage({
      type: "message",
      content: content,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header with connection status */}
      <header className="bg-white p-4 shadow flex justify-between items-center">
        <h1 className="text-xl font-bold">Chat with AI Assistant</h1>
        <div className="flex items-center">
          <div
            className={`h-3 w-3 rounded-full mr-2 ${
              connectionStatus === "connected"
                ? "bg-green-500"
                : connectionStatus === "connecting"
                ? "bg-yellow-500"
                : connectionStatus === "error"
                ? "bg-red-500"
                : "bg-gray-500"
            }`}
          ></div>
          <span className="text-sm text-gray-600">{connectionStatus}</span>
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      {/* Input area */}
      <InputArea onSendMessage={handleSendMessage} />
    </div>
  );
}
