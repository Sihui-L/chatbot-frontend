"use client";

import React, { useState, useEffect, useRef } from "react";
import useWebSocket from "../../hooks/useWebSocket";
import MessageBubble, { Message } from "../../components/MessageBubble";
import InputArea from "../../components/InputArea";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const clientId = useRef<string>(
    `user-${Math.random().toString(36).substring(2, 9)}`
  );

  // Use our WebSocket hook
  const {
    connectionStatus,
    lastMessage,
    connect,
    sendChatMessage,
    sendFeedback,
  } = useWebSocket();

  // Connect to WebSocket when component mounts
  useEffect(() => {
    // Add a small delay to ensure the component is fully mounted
    const connectToWebSocket = async () => {
      try {
        // Use the correct URL that matches your backend
        await connect("ws://localhost:8081", clientId.current);

        // Add an initial system message only after successful connection
        setMessages([
          {
            id: "welcome",
            content: "Welcome! How can I help you today?",
            role: "system",
            timestamp: new Date(),
          },
        ]);
      } catch (error) {
        console.error("Failed to connect to WebSocket:", error);
        // Add an error message to display to the user
        setMessages([
          {
            id: "error",
            content:
              "Failed to connect to the chat server. Please refresh the page and try again.",
            role: "system",
            timestamp: new Date(),
            error: true,
          },
        ]);
      }
    };

    connectToWebSocket();

    // Clean up on unmount is handled by the hook
    return () => {
      // Additional cleanup if needed
    };
  }, []); // Removed 'connect' from dependency array to prevent reconnection loops

  // Handle incoming messages
  useEffect(() => {
    if (!lastMessage) return;

    console.log("Received message:", lastMessage);

    switch (lastMessage.type) {
      case "message":
        // Complete message from the assistant
        const newMessage: Message = {
          id: lastMessage.message_id || Date.now().toString(),
          content: lastMessage.content,
          role: "assistant",
          timestamp: new Date(),
          metadata: lastMessage.metadata,
        };
        setMessages((prev) => [...prev, newMessage]);
        break;

      case "stream":
        // Handle streaming message chunk
        if (streamingMessageId) {
          // Update existing streaming message
          setMessages((prev) => {
            return prev.map((msg) => {
              if (msg.id === streamingMessageId) {
                return {
                  ...msg,
                  content: msg.content + lastMessage.content,
                };
              }
              return msg;
            });
          });
        } else {
          // Create new streaming message
          const newStreamingMessage: Message = {
            id: lastMessage.message_id || Date.now().toString(),
            content: lastMessage.content,
            role: "assistant",
            timestamp: new Date(),
            pending: true,
          };
          setStreamingMessageId(newStreamingMessage.id);
          setMessages((prev) => [...prev, newStreamingMessage]);
        }
        break;

      case "stream_complete":
        // Streaming is complete, update the message with metadata
        if (streamingMessageId) {
          setMessages((prev) => {
            return prev.map((msg) => {
              if (msg.id === streamingMessageId) {
                return {
                  ...msg,
                  pending: false,
                  metadata: lastMessage.metadata,
                };
              }
              return msg;
            });
          });
          setStreamingMessageId(null);
        }
        break;

      case "error":
        // Handle error message
        const errorMessage: Message = {
          id: lastMessage.message_id || Date.now().toString(),
          content: lastMessage.content,
          role: "assistant",
          timestamp: new Date(),
          error: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
        // Clear streaming state if there was an error
        setStreamingMessageId(null);
        break;

      case "feedback_received":
        // Handle feedback acknowledgment
        console.log("Feedback received:", lastMessage);
        break;

      case "pong":
        // Handle pong (keep-alive response)
        console.log("Pong received:", lastMessage.timestamp);
        break;
    }
  }, [lastMessage, streamingMessageId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Function to handle sending a message - add connection check
  const handleSendMessage = (content: string, options = {}) => {
    // Check if we're connected before trying to send
    if (connectionStatus !== "connected") {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content:
            "Not connected to the chat server. Please wait for the connection to establish.",
          role: "system",
          timestamp: new Date(),
          error: true,
        },
      ]);
      return;
    }

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
    const sent = sendChatMessage(content, options);

    // If message failed to send, add an error message
    if (!sent) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          content: "Failed to send message. Please check your connection.",
          role: "system",
          timestamp: new Date(),
          error: true,
        },
      ]);
    }
  };

  // Function to handle sending feedback
  const handleSendFeedback = (
    messageId: string,
    rating: "positive" | "negative" | "neutral"
  ) => {
    sendFeedback(messageId, rating);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Use ChatSidebar and MessageBubble components from imports */}
      <div className="flex-1 flex flex-col">
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
            <MessageBubble
              key={message.id}
              message={message}
              onSendFeedback={handleSendFeedback}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <InputArea onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
