import React, { useState, useEffect } from "react";
import "./App.css";
import { useLocation } from 'react-router-dom';

interface Message {
  username: string;
  text: string;
  room: string | null; // Added room field to message structure
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [enteredRoom, setEnteredRoom] = useState<boolean>(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const roomUrl = queryParams.get('room');
  console.log("roomUrl::", roomUrl);
  useEffect(() => {
    if (roomUrl && enteredRoom) {
      // const socket = new WebSocket("wss://5db9-154-208-62-234.ngrok-free.app/ws");
      const socket = new WebSocket("ws://localhost:8080/ws");
      setWs(socket);

      socket.onopen = () => {
        console.log("WebSocket connected.");
        socket.send(JSON.stringify({ type: "join", room: roomUrl })); // Send room info to server on connect
      };

      socket.onclose = (event) => console.log("WebSocket closed:", event.reason);
      socket.onerror = (error) => console.error("WebSocket error:", error);

      socket.onmessage = (event) => {
        const message: Message = JSON.parse(event.data);
        console.log("mmm", message);
        if (message.room === roomUrl) {
          // Display only messages from the current room
          setMessages((prev) => [...prev, message]);
        }
      };

      return () => {
        socket.close();
      };
    }
  }, [roomUrl, enteredRoom]);

  console.log("messages::", messages);

  const sendMessage = () => {
    console.log("ws?.readyState::", ws?.readyState)
    if (ws?.readyState === WebSocket.OPEN && text.trim() && username.trim()) {
      const message: Message = { username, text, room: roomUrl };
      ws.send(JSON.stringify(message));
      setText("");
    } else {
      console.error("WebSocket is not open or missing fields.");
    }
  };

  const joinRoom = () => {
    setEnteredRoom(true);

    if (roomUrl?.trim() && username.trim()) {
      setMessages([]); // Clear messages when switching rooms
      if (ws) ws.close(); // Close any existing WebSocket connection
    } else {
      console.error("Room and username are required.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="flex flex-col flex-grow max-w-4xl mx-auto bg-gray-800 shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-700">
          <h1 className="text-lg font-semi-bold text-white">Chat App</h1>
        </div>

        {/* Chat Body */}
        <div className="flex flex-grow">
          {!enteredRoom ? (
            <div className="flex flex-col items-center justify-center w-full px-6 py-12 space-y-4 bg-gray-800">
              <h2 className="text-lg font-semibold text-white">Join a Room</h2>
              <input
                type="text"
                placeholder="Your Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full max-w-sm px-4 py-2 text-gray-900 rounded-xl focus:outline-none"
              />
              <button
                onClick={joinRoom}
                className="px-6 py-2 text-white bg-blue-600 rounded-xl hover:bg-blue-500"
              >
                Join Room
              </button>
            </div>
          ) : (
            <div className="flex flex-col flex-grow bg-gray-800">
              {/* Messages */}
              <div className="flex-grow overflow-y-auto px-4 py-2 space-y-2 bg-gray-900">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.username === username
                        ? "justify-end"
                        : "justify-start"
                      }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-xl ${msg.username === username
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-200"
                        }`}
                    >
                      <strong>{msg.username}:</strong> {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="flex items-center px-4 py-3 bg-gray-700">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-grow px-4 py-2 text-gray-900 rounded-xl focus:outline-none"
                />
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 ml-2 text-white bg-blue-600 rounded-xl hover:bg-blue-500"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

  );
};

export default App;
