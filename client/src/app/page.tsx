/** @format */
"use client";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket;

interface MessageType {
  id?: number | string;
  username?: string;
  text: string;
  time?: string;
  type?: "server" | "user";
}

export default function Chat() {
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [inputName, setInputName] = useState("");
  const [users, setUsers] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);

  console.log("messagesmessages====", messages);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    socket = io("http://localhost:5000");

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("userList", (list) => setUsers(list));

    socket.on("serverMessage", (msg) =>
      setMessages((prev) => [...prev, { text: msg, type: "server" }])
    );

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, { ...msg, type: "user" }]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const joinChat = () => {
    if (!inputName.trim()) return;
    setUsername(inputName);
    socket.emit("join", inputName);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("chatMessage", { text: message, username });
    setMessage("");
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <h1 className='text-3xl font-bold mb-5'>
        Chat App (Next.js + TS + Socket.IO)
      </h1>

      <p className='mb-4'>
        Status:{" "}
        <span className={connected ? "text-green-600" : "text-red-600"}>
          {connected ? "Connected" : "Disconnected"}
        </span>
      </p>

      {!username ? (
        <div className='mb-5 flex gap-3'>
          <input
            className='border p-2 rounded w-64'
            placeholder='Enter username'
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
          />
          <button
            onClick={joinChat}
            className='bg-blue-600 text-white px-4 py-2 rounded'>
            Join
          </button>
        </div>
      ) : (
        <p className='mb-4 text-lg'>
          Logged in as: <b>{username}</b>
        </p>
      )}

      <div className='flex gap-4'>
        {/* Chat Area */}
        <div className='w-full border rounded p-4 flex flex-col'>
          <div className='h-96 overflow-y-auto space-y-3 pr-2'>
            {messages.map((msg, idx) => (
              <div key={idx}>
                {msg.type === "server" ? (
                  <p className='text-sm text-gray-500 italic'>{msg.text}</p>
                ) : (
                  <div>
                    <p className='font-semibold'>{msg.username}</p>
                    <p>{msg.text}</p>
                    <span className='text-xs text-gray-400'>
                      {msg.time ? new Date(msg.time).toLocaleTimeString() : ""}
                    </span>
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {username && (
            <div className='mt-4 flex gap-2'>
              <input
                className='flex-1 border p-2 rounded'
                placeholder='Type a message...'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                onClick={sendMessage}
                className='bg-green-600 text-white px-4 py-2 rounded'>
                Send
              </button>
            </div>
          )}
        </div>

        {/* Online Users */}
        <div className='w-60 border rounded p-4 h-96'>
          <h2 className='font-bold mb-3'>Online Users</h2>
          <ul className='space-y-1'>
            {users.map((user, i) => (
              <li key={i} className='text-gray-700'>
                {user}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
