"use client";

import React, { useState, useEffect } from "react";
import MessageBubble, { Message } from "@/components/MessageBubble";
import InputArea from "@/components/InputArea";
import useWebSocket from "@/hooks/useWebSocket";

export default function ChatPage() {
  // State to store messages
  const [messages, setMessages] = useState<Message[]>([]);

  const { connectionStatus, lastMessage, connect, sendMessage } =
    useWebSocket();

  useEffect(() => {
    connect("ws://localhost:8000/chat");
    return () => {};
  }, [connect]);

  useEffect(() => {
    if (lastMessage) {
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
      id: Date.now().toString(), // Simple ID generation
      content: content,
      role: "user",
      timestamp: new Date(),
    };

    // Add the message to our messages state
    setMessages((prev) => [...prev, newMessage]);

    // Simulate a response from the assistant (we'll replace this with WebSocket later)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "This is a placeholder response. We'll implement real responses later!",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white p-4 shadow">
        <h1 className="text-xl font-bold">Chat with AI Assistant</h1>
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
