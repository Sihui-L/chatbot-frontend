import Link from "next/link";
import React from "react";
import { IconPlaceholderLogo } from "../components/icons/IconPlaceholderLogo";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex items-center justify-center mb-3 text-teal-500 ">
            <div className="w-30 text-teal-500 size-auto">
              <IconPlaceholderLogo />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
            Welcome to my Chat Application!
          </h1>

          <p className="text-gray-600 mb-6 text-center">
            This is a chat interface that communicates with a backend via
            WebSockets.
          </p>
          <p className="text-gray-600 mb-6 text-center">
            You can start chatting with the bot by clicking the button below.
          </p>

          <div className="flex justify-center">
            <Link
              href="/chat"
              className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200"
            >
              Go to Chat Page
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
