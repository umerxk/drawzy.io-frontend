import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { useLocation } from 'react-router-dom';
import IconCopy from "./icons/IconCopy";
import IconLogout from "./icons/IconLogout";

interface Message {
  username: string;
  text: string;
  room: string | null; // Added room field to message structure
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [room, setRoom] = useState<string>(""); // State to store the selected room
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [enteredRoom, setEnteredRoom] = useState<boolean>(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const messagesEndRef = useRef<any>(null);
  let roomUrl = queryParams.get('room');
  const inputRef = useRef<any>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Run this effect whenever messages change

  useEffect(() => {
    if (room && enteredRoom) {
      // const socket = new WebSocket("ws://localhost:8080/ws");
      const socket = new WebSocket("ws://18.193.76.117:8080/ws");
      setWs(socket);
      socket.onopen = () => {
        console.log("WebSocket connected.");
        socket.send(JSON.stringify({ type: "join", room })); // Send room info to server on connect
      };

      socket.onclose = (event) => console.log("WebSocket closed:", event.reason);
      socket.onerror = (error) => console.error("WebSocket error:", error);

      socket.onmessage = (event) => {
        const message: Message = JSON.parse(event.data);
        if (message.room === room) {
          setMessages((prev) => [...prev, message]);
        }
      };

      return () => {
        socket.close();
      };
    }
  }, [room, enteredRoom]);

  useEffect(() => {
    if (roomUrl) {
      setRoom(roomUrl);
    }
  }, [roomUrl]);


  const sendMessage = (e: any) => {
    e.preventDefault();
    if (ws?.readyState === WebSocket.OPEN && text.trim() && username.trim()) {
      const message: Message = { username, text, room };
      ws.send(JSON.stringify(message));
      setText("");
      inputRef.current.focus();
    } else {
      console.error("WebSocket is not open or missing fields.");
    }
  };

  const joinRoom = () => {
    setEnteredRoom(true);
    localStorage.setItem("username", username);
    history.pushState({}, '', `/?room=${room}`);

    if (room?.trim() && username.trim()) {
      setMessages([]); // Clear messages when switching rooms
      if (ws) ws.close(); // Close any existing WebSocket connection
    } else {
      console.error("Room and username are required.");
    }
  };

  const usernameFromStorage = localStorage.getItem("username");

  useEffect(() => {
    if (usernameFromStorage) {
      setUsername(usernameFromStorage);
      if (roomUrl) {
        setEnteredRoom(true);

      }
    }
  }, [usernameFromStorage]);


  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="flex flex-col flex-grow bg-gray-800 shadow-md">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-700">
          <h1 className="text-lg font-semi-bold text-white">Chat App   {!!(username && enteredRoom) && `- ${username}`} </h1>
          {enteredRoom && (
            <div className="flex gap-5">
              <div className="cursor-pointer gap-2 flex items-center" onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Copied to clipboard!");
              }} >Copy Invite URL
                <IconCopy />

              </div>

              <div className="cursor-pointer gap-2 flex items-center" onClick={() => {
                localStorage.removeItem("username");
                window.location.href = "/"
              }}>Logout <IconLogout /> </div>

            </div>

          )}

        </div>

        <div className="flex flex-grow">
          {!enteredRoom ? (
            <div className="flex flex-col items-center justify-center w-full px-6 py-12 space-y-4 bg-transparent">
              <input
                type="text"
                placeholder="Your Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full max-w-sm px-4 py-2 text-gray-900 rounded-xl focus:outline-none"
              />

              {!roomUrl && (
                <input
                  type="text"
                  placeholder="Room Name"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full max-w-sm px-4 py-2 text-gray-900 rounded-xl focus:outline-none"
                />
              )}

              <button
                onClick={joinRoom}
                className="px-6 py-2 text-white bg-blue-600 rounded-xl hover:bg-blue-500"
              >
                {(roomUrl) ? "Join Room" : "Join Room"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col flex-grow bg-gray-800">
              <div className="flex-grow overflow-y-auto px-4 py-2 space-y-2 bg-gray-900 max-h-[calc(100vh-4rem)] pb-24">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.username === username ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`px-4 py-2 rounded-xl ${msg.username === username
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-200"
                        } break-words whitespace-normal max-w-xs sm:max-w-md`}
                    >
                      <strong>{msg.username}:</strong> {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="fixed bottom-0 w-full bg-gray-900">
                <div className="flex items-center px-4 py-3">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    ref={inputRef}
                    autoFocus
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="flex-grow px-4 py-2 text-gray-900 rounded-xl focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 ml-2 text-white bg-blue-600 rounded-xl hover:bg-blue-500"
                  >
                    Send
                  </button>
                </div>
              </form>

            </div>
          )}
        </div>
      </div>
    </div>

  );
};

export default App;
