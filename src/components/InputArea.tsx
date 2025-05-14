import React, { useState, useRef } from "react";

interface InputAreaProps {
  onSendMessage: (
    content: string,
    options?: { stream?: boolean; image?: string }
  ) => void;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (message.trim() || selectedImage) {
      onSendMessage(message, {
        stream: isStreaming,
        image: selectedImage || undefined,
      });
      setMessage("");
      setSelectedImage(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        alert("Please select an image file");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 border-t">
      {selectedImage && (
        <div className="mb-2 relative">
          <img
            src={selectedImage}
            alt="Selected"
            className="h-20 object-contain rounded"
          />
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
          >
            ✕
          </button>
        </div>
      )}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-2"
          title="Upload image"
        >
          📎
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Type your message..."
          className="flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="ml-2 flex items-center">
          <label className="text-sm flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isStreaming}
              onChange={() => setIsStreaming(!isStreaming)}
              className="mr-1"
            />
            Stream
          </label>
          <button
            type="submit"
            className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </form>
  );
};

export default InputArea;
