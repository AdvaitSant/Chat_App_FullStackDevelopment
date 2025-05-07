import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const validUsers = {
      Advait: "12345",
      Purva: "12345",
      Ojaswi: "12345",
    };

    const normalizedUsername = username.trim().toLowerCase();
    const validUsername = Object.keys(validUsers).find(
      (user) => user.toLowerCase() === normalizedUsername
    );

    if (validUsername && validUsers[validUsername] === password) {
      navigate("/chat", { state: { username: validUsername } });
    } else {
      alert("Incorrect credentials!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1 className="app-title">Veyra</h1>
        <h2 className="login-welcome">Welcome back</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
