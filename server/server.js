const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

// Setup express
const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());

// Setup MongoDB connection to the 'veyra' database
mongoose.connect('mongodb://localhost:27017/veyra', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

const messageSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  text: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // your frontend origin
    methods: ["GET", "POST"]
  }
});

const users = {}; // Mapping of username to socket ID

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join: associate username with socket ID
  socket.on("join", (username) => {
    users[username] = socket.id;
    console.log(`${username} joined with socket ID: ${socket.id}`);
  });

  // Send message handler
  socket.on("sendMessage", async (msg) => {
    const { sender, receiver, text } = msg;

    // Save to MongoDB (veyra database)
    const newMsg = new Message({ sender, receiver, text });
    await newMsg.save();

    // Emit to receiver if online
    const receiverSocketId = users[receiver];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", msg);
      console.log(`Message sent to ${receiver}:`, msg);
    } else {
      console.log(`User ${receiver} is not connected`);
    }
  });

  // Disconnect handler
  socket.on("disconnect", () => {
    for (let user in users) {
      if (users[user] === socket.id) {
        delete users[user];
        console.log(`${user} disconnected`);
        break;
      }
    }
  });
});

// REST API: Fetch chat history between two users
app.get("/messages/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start server
server.listen(5000, () => {
  console.log("Server running on port 5000");
});
