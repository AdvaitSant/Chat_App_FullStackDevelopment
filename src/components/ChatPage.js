import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import './ChatPage.css';

const socket = io("http://localhost:5000");

export default function ChatPage({ username: propUsername }) {
  const location = useLocation();
  const username = propUsername || location.state?.username || "Anonymous";

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState({});

  const socketRef = useRef(null);
  const allUsers = ['Advait', 'Purva', 'Ojaswi'];

  useEffect(() => {
    socketRef.current = socket;
    socketRef.current.emit("join", username);
    console.log(`${username} has joined`);

    const handleReceiveMessage = (msg) => {
      const { sender, receiver } = msg;

      if (receiver !== username) return; 
      if (sender === username) return;   

      setChat((prevChat) => {
        const updatedChat = { ...prevChat };
        if (!updatedChat[sender]) updatedChat[sender] = [];
        updatedChat[sender] = [...updatedChat[sender], msg];
        return updatedChat;
      });

      if (sender !== selectedUser) {
        setUnreadMessages((prev) => ({
          ...prev,
          [sender]: (prev[sender] || 0) + 1
        }));
      }
    };

    socketRef.current.on("receiveMessage", handleReceiveMessage);

    return () => {
      socketRef.current.off("receiveMessage", handleReceiveMessage);
    };
  }, [username, selectedUser]);

  const fetchChatHistory = async (user1, user2) => {
    try {
      const res = await axios.get(`http://localhost:5000/messages/${user1}/${user2}`);
      const sortedMessages = res.data || [];
      setChat((prev) => ({
        ...prev,
        [user2]: sortedMessages
      }));
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setUnreadMessages((prev) => ({
      ...prev,
      [user]: 0
    }));

    if (!chat[user]) {
      fetchChatHistory(username, user);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === "" || selectedUser === username) {
      alert("You cannot chat with yourself!");
      return;
    }

    const msg = {
      sender: username,
      receiver: selectedUser,
      text: message
    };

    socketRef.current?.emit("sendMessage", msg);

    setChat((prevChat) => {
      const updatedChat = { ...prevChat };
      if (!updatedChat[selectedUser]) updatedChat[selectedUser] = [];
      updatedChat[selectedUser] = [...updatedChat[selectedUser], msg];
      return updatedChat;
    });

    setMessage("");
    setIsSending(true);
    setTimeout(() => setIsSending(false), 300);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      sendMessage(e);
    }
  };

  const users = allUsers.filter(user => user !== username);

  return (
    <div className="chat-container">
      <div className="left-column">
        <h1 className="app-title">Veyra</h1>
        <h2 className="welcome-message">Welcome, {username}!</h2>
        <div className="contacts-list">
          <h3>Contacts</h3>
          {users.map((user) => (
            <button
              key={user}
              className={selectedUser === user ? "selected-user" : "user-button"}
              onClick={() => handleSelectUser(user)}
            >
              <div className="user-button-content">
                {user}
                {selectedUser !== user && unreadMessages[user] > 0 && (
                  <span className="notification-badge">{unreadMessages[user]}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="right-column">
        <div className="chat-window-container">
          <div className="chat-window">
            {selectedUser ? (
              <>
                {chat[selectedUser]?.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat-row ${msg.sender === username ? "sent" : "received"}`}
                  >
                    <div className={`chat-bubble ${msg.sender === username ? "sent" : "received"}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p style={{ color: '#777' }}>Select a contact to start chatting.</p>
            )}
          </div>

          <form onSubmit={sendMessage} className="chat-input-container">
            <input
              type="text"
              placeholder="Enter message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button type="submit" disabled={isSending}>Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}
