import { useState, useEffect, useCallback, useRef } from "react";

// Define all possible WebSocket message types
type MessageType =
  | "message" // Complete response
  | "stream" // Chunk of a streaming response
  | "stream_complete" // Signal that streaming is complete
  | "error" // Error from the server
  | "feedback_received" // Confirmation of feedback receipt
  | "pong"; // Response to a ping

// Type definitions for WebSocket messages
interface BaseWSMessage {
  type: MessageType;
  message_id?: string;
}

interface TextMessage extends BaseWSMessage {
  type: "message";
  content: string;
  metadata: {
    response_time: number;
    length: number;
    sentiment: "positive" | "negative" | "neutral";
    contains_image_analysis: boolean;
    timestamp: number;
  };
}

interface StreamMessage extends BaseWSMessage {
  type: "stream";
  content: string;
}

interface StreamCompleteMessage extends BaseWSMessage {
  type: "stream_complete";
  metadata: {
    response_time: number;
    length: number;
    sentiment: "positive" | "negative" | "neutral";
    contains_image_analysis: boolean;
    timestamp: number;
  };
}

interface ErrorMessage extends BaseWSMessage {
  type: "error";
  content: string;
}

interface FeedbackReceivedMessage extends BaseWSMessage {
  type: "feedback_received";
}

interface PongMessage extends BaseWSMessage {
  type: "pong";
  timestamp: number;
}

type WSMessage =
  | TextMessage
  | StreamMessage
  | StreamCompleteMessage
  | ErrorMessage
  | FeedbackReceivedMessage
  | PongMessage;

// WebSocket connection status
type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

// Maximum reconnection attempts
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 5000; // 5 seconds

// Custom hook for WebSocket
const useWebSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const wsUrlRef = useRef<string>("");
  const clientIdRef = useRef<string>("");

  // Function to connect to WebSocket
  const connect = useCallback(
    (url: string, clientId: string) => {
      // Store connection parameters for reconnection
      wsUrlRef.current = url;
      clientIdRef.current = clientId;

      // Clear any existing reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Close existing connection if any
      if (socket && socket.readyState !== WebSocket.CLOSED) {
        socket.close();
      }

      // Clear any existing ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }

      try {
        // Include client ID in the WebSocket URL
        const fullUrl = `${url}/ws/${clientId}`;
        console.log("Attempting to connect to WebSocket:", fullUrl);
        setConnectionStatus("connecting");

        const newSocket = new WebSocket(fullUrl);

        newSocket.onopen = () => {
          console.log("WebSocket connection established");
          setConnectionStatus("connected");
          reconnectAttemptsRef.current = 0; // Reset reconnection attempts

          // Set up ping interval to keep connection alive
          pingIntervalRef.current = setInterval(() => {
            if (newSocket.readyState === WebSocket.OPEN) {
              try {
                newSocket.send(JSON.stringify({ type: "ping" }));
              } catch (error) {
                console.error("Error sending ping:", error);
              }
            }
          }, 30000); // Send ping every 30 seconds
        };

        newSocket.onmessage = (event) => {
          // Parse the incoming message
          try {
            const data = JSON.parse(event.data) as WSMessage;
            setLastMessage(data);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
            // Handle unparseable messages
            setLastMessage({
              type: "error",
              content: "Failed to parse server message",
            });
          }
        };

        newSocket.onclose = (event) => {
          console.log("WebSocket connection closed:", event.code, event.reason);
          setConnectionStatus("disconnected");

          // Clear ping interval on connection close
          if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
          }

          // Attempt to reconnect if it wasn't a normal closure
          if (
            event.code !== 1000 &&
            reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS
          ) {
            reconnectAttemptsRef.current += 1;
            console.log(
              `Attempting to reconnect... (attempt ${reconnectAttemptsRef.current})`
            );

            reconnectTimeoutRef.current = setTimeout(() => {
              connect(wsUrlRef.current, clientIdRef.current);
            }, RECONNECT_INTERVAL);
          }
        };

        newSocket.onerror = (error) => {
          console.error("WebSocket error:", error);
          setConnectionStatus("error");

          // Additional error handling
          setLastMessage({
            type: "error",
            content:
              "WebSocket connection error. Please check if the server is running.",
          });
        };

        setSocket(newSocket);
        return newSocket;
      } catch (error) {
        console.error("Failed to establish WebSocket connection:", error);
        setConnectionStatus("error");

        // Attempt to reconnect after error
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect(wsUrlRef.current, clientIdRef.current);
          }, RECONNECT_INTERVAL);
        }

        return null;
      }
    },
    [socket]
  );

  // Function to disconnect
  const disconnect = useCallback(() => {
    // Clear reconnection attempts
    reconnectAttemptsRef.current = MAX_RECONNECT_ATTEMPTS;

    // Clear reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socket) {
      socket.close(1000, "Client disconnected"); // Normal closure
      setSocket(null);
      setConnectionStatus("disconnected");
    }

    // Clear ping interval
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, [socket]);

  // Function to send a message
  const sendMessage = useCallback(
    (message: string | object): boolean => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        try {
          const messageToSend =
            typeof message === "string" ? message : JSON.stringify(message);
          socket.send(messageToSend);
          return true;
        } catch (error) {
          console.error("Error sending message:", error);
          return false;
        }
      }
      console.warn("Cannot send message: WebSocket is not connected");
      return false;
    },
    [socket]
  );

  // Function to send a chat message
  const sendChatMessage = useCallback(
    (
      content: string,
      options: { stream?: boolean; image?: string } = {}
    ): boolean => {
      return sendMessage({
        type: "message",
        content,
        stream: options.stream ?? false,
        ...(options.image ? { image: options.image } : {}),
      });
    },
    [sendMessage]
  );

  // Function to send feedback
  const sendFeedback = useCallback(
    (
      messageId: string,
      rating: "positive" | "negative" | "neutral"
    ): boolean => {
      return sendMessage({
        type: "feedback",
        message_id: messageId,
        rating,
      });
    },
    [sendMessage]
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Prevent reconnection on unmount
      reconnectAttemptsRef.current = MAX_RECONNECT_ATTEMPTS;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (socket) {
        socket.close(1000, "Component unmounted");
      }

      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, [socket]);

  return {
    socket,
    lastMessage,
    connectionStatus,
    connected: connectionStatus === "connected",
    connect,
    disconnect,
    sendMessage,
    sendChatMessage,
    sendFeedback,
  };
};

export default useWebSocket;
