import React, { useState, useEffect } from "react";
import "./App.css";

interface Message {
  username: string;
  text: string;
  room: string; // Added room field to message structure
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [room, setRoom] = useState<string>(""); // State to store the selected room
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [enteredRoom, setEnteredRoom] = useState<boolean>(false);

  useEffect(() => {
    if (room && enteredRoom) {
      const socket = new WebSocket("ws://5db9-154-208-62-234.ngrok-free.app/ws");
      setWs(socket);

      socket.onopen = () => {
        console.log("WebSocket connected.");
        socket.send(JSON.stringify({ type: "join", room })); // Send room info to server on connect
      };

      socket.onclose = (event) => console.log("WebSocket closed:", event.reason);
      socket.onerror = (error) => console.error("WebSocket error:", error);

      socket.onmessage = (event) => {
        const message: Message = JSON.parse(event.data);
        console.log("mmm", message);
        if (message.room === room) {
          // Display only messages from the current room
          setMessages((prev) => [...prev, message]);
        }
      };

      return () => {
        socket.close();
      };
    }
  }, [room, enteredRoom]);

  console.log("messages::", messages);

  const sendMessage = () => {
    console.log("ws?.readyState::", ws?.readyState)
    if (ws?.readyState === WebSocket.OPEN && text.trim() && username.trim()) {
      const message: Message = { username, text, room };
      ws.send(JSON.stringify(message));
      setText("");
    } else {
      console.error("WebSocket is not open or missing fields.");
    }
  };

  const joinRoom = () => {
    setEnteredRoom(true);

    if (room.trim() && username.trim()) {
      setMessages([]); // Clear messages when switching rooms
      if (ws) ws.close(); // Close any existing WebSocket connection
    } else {
      console.error("Room and username are required.");
    }
  };

  return (
    <div className="App">
      <div className="chat-container">
        <h1 className="text-white">Chat App</h1>
        {!enteredRoom ? (
          <div className="join-room">
            <input
              type="text"
              placeholder="Your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="text"
              placeholder="Room name"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
            <button onClick={joinRoom}>Join Room</button>
          </div>
        ) : (
          <>
            <div className="messages">
              {messages.map((msg, index) => (
                <div key={index}>
                  <strong>{msg.username}: </strong>{msg.text}
                </div>
              ))}
            </div>
            <input
              type="text"
              placeholder="Type a message"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
