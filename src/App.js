import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import ChatPage from "./components/ChatPage";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const handleLogin = (user) => {
    setUsername(user);
    setLoggedIn(true);
  };

  const handleUserSelection = (user) => {
    setSelectedUser(user);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<LoginPage onLogin={handleLogin} />}
        />
        <Route
          path="/chat"
          element={
            <ChatPage 
              username={username} 
              selectedUser={selectedUser} 
              onUserSelect={handleUserSelection} 
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
