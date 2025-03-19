import { useState, useEffect, useCallback } from "react";

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

const useWebSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");

  // Function to connect to WebSocket
  const connect = useCallback(
    (url: string) => {
      // Close existing connection if any
      if (socket) {
        socket.close();
      }

      try {
        setConnectionStatus("connecting");
        const newSocket = new WebSocket(url);

        newSocket.onopen = () => {
          console.log("WebSocket connection established");
          setConnectionStatus("connected");
        };

        newSocket.onmessage = (event) => {
          // Parse the incoming message
          try {
            const data = JSON.parse(event.data);
            setLastMessage(data);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
            setLastMessage(event.data);
          }
        };

        newSocket.onclose = () => {
          console.log("WebSocket connection closed");
          setConnectionStatus("disconnected");
        };

        newSocket.onerror = (error) => {
          console.error("WebSocket error:", error);
          setConnectionStatus("error");
        };

        setSocket(newSocket);
      } catch (error) {
        console.error("Failed to establish WebSocket connection:", error);
        setConnectionStatus("error");
      }
    },
    [socket]
  );

  // Function to disconnect
  const disconnect = useCallback(() => {
    if (socket) {
      socket.close();
      setSocket(null);
      setConnectionStatus("disconnected");
    }
  }, [socket]);

  // Function to send a message
  const sendMessage = useCallback(
    (message: string | object) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        const messageToSend =
          typeof message === "string" ? message : JSON.stringify(message);

        socket.send(messageToSend);
        return true;
      }
      return false;
    },
    [socket]
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
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
  };
};

export default useWebSocket;
