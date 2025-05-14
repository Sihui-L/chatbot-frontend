import React from "react";
import { ChatSession } from "./MessageBubble"; // Now imports from updated MessageBubble

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  connectionStatus,
}) => {
  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  // Function to get chat preview text
  const getChatPreview = (session: ChatSession): string => {
    const lastMessage = session.messages[session.messages.length - 1];
    if (!lastMessage) return "New conversation";
    return lastMessage.content.length > 30
      ? `${lastMessage.content.substring(0, 30)}...`
      : lastMessage.content;
  };

  return (
    <div className="w-64 h-full flex flex-col bg-gray-800 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="font-semibold">Chat Sessions</h2>
        <div className="flex items-center">
          <div
            className={`h-2 w-2 rounded-full mr-2 ${
              connectionStatus === "connected"
                ? "bg-green-500"
                : connectionStatus === "connecting"
                ? "bg-yellow-500"
                : connectionStatus === "disconnected"
                ? "bg-gray-500"
                : "bg-red-500"
            }`}
          ></div>
          <span className="text-xs text-gray-300 capitalize">
            {connectionStatus}
          </span>
        </div>
      </div>

      {/* Session list */}
      <div className="flex-grow overflow-y-auto p-2">
        {sessions.length === 0 ? (
          <div className="text-center p-4 text-gray-400">
            <p className="text-sm">No chats yet. Create a new one!</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {sessions.map((session) => (
              <li key={session.id}>
                <div
                  className={`flex flex-col p-2 rounded cursor-pointer ${
                    activeSessionId === session.id
                      ? "bg-gray-700"
                      : "hover:bg-gray-700"
                  }`}
                  onClick={() => onSelectSession(session.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium truncate max-w-[80%]">
                      {session.name}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          confirm("Are you sure you want to delete this chat?")
                        ) {
                          onDeleteSession(session.id);
                        }
                      }}
                      className="text-gray-400 hover:text-red-400 ml-2"
                      title="Delete session"
                    >
                      ×
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 truncate mt-1">
                    {getChatPreview(session)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(session.updatedAt)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create new chat button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onCreateSession}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition cursor-pointer"
        >
          <span>+</span>
          <span>New Chat</span>
        </button>
      </div>
    </div>
  );
};

export default ChatSidebar;
