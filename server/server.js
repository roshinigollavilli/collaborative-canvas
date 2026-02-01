const COLORS = [
  "#e74c3c", // red
  "#3498db", // blue
  "#2ecc71", // green
  "#9b59b6", // purple
  "#f1c40f", // yellow
  "#e67e22", // orange
  "#1abc9c", // teal
];

const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

// Serve frontend
app.use(express.static(path.join(__dirname, "../client")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

let strokes = [];
let redoStack = [];
let userColors = {};

let availableColors = [...COLORS];


io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  let color;

  if (availableColors.length > 0) {
    color = availableColors.shift();
  } else {
    color = COLORS[Math.floor(Math.random() * COLORS.length)];
  }
  userColors[socket.id] = color;

  socket.emit("userColor", color);


  socket.emit("initCanvas", strokes);

  // LIVE POINT STREAM
  socket.on("drawPoint", (data) => {
    socket.broadcast.emit("drawPoint", data);
  });

  socket.on("endStroke", (id) => {
    socket.broadcast.emit("endStroke", id);
  });

  // FULL STROKE SAVE
  socket.on("newStroke", (stroke) => {
    strokes.push(stroke);
    socket.broadcast.emit("drawStroke", stroke);
    redoStack = [];
  });

  // GLOBAL UNDO
  socket.on("undo", () => {
    if (strokes.length > 0) {
      let removed = strokes.pop();
      redoStack.push(removed);
      io.emit("canvasUpdate", strokes);
    }
  });

  //Global Redo
  socket.on("redo", () => {
    if (redoStack.length > 0) {
      const restored = redoStack.pop();
      strokes.push(restored);
      io.emit("canvasUpdate", strokes);
    }
  })
  //Broadcast Cursor
  socket.on("cursorMove", (data) => {
    socket.broadcast.emit("cursorMove", data);
  });
  

  socket.on("disconnect", () => {
    if (userColors[socket.id]) {
      availableColors.push(userColors[socket.id]);
    }

    delete userColors[socket.id];
    socket.broadcast.emit("cursorLeave", socket.id);
    
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
