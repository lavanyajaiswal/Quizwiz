const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] }
});

app.use(cors());

let rooms = {};
let quizQuestions = [
  { q: "What is the capital of France?", options: ["Paris", "London", "Rome", "Berlin"], answer: 0 },
  { q: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Venus"], answer: 1 },
  { q: "2 + 2 = ?", options: ["3", "4", "5", "2"], answer: 1 }
];

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("joinRoom", ({ room, username }) => {
    socket.join(room);
    if (!rooms[room]) {
      rooms[room] = { users: {}, scores: {}, currentQuestion: 0 };
    }
    rooms[room].users[socket.id] = username;
    rooms[room].scores[socket.id] = 0;
    io.to(room).emit("updateUsers", rooms[room].users);
  });

  socket.on("startGame", (room) => {
    console.log(`Start game requested in room: ${room}`);
    io.to(room).emit("gameStarted", quizQuestions[0]);
  });
  
  socket.on("submitAnswer", ({ room, socketId, selectedOption }) => {
    let currentQ = rooms[room].currentQuestion;
    if (selectedOption === quizQuestions[currentQ].answer) {
      rooms[room].scores[socketId] += 10;
    }
    if (currentQ + 1 < quizQuestions.length) {
      rooms[room].currentQuestion++;
      io.to(room).emit("nextQuestion", quizQuestions[rooms[room].currentQuestion]);
    } else {
      io.to(room).emit("gameOver", rooms[room].scores);
    }
  });

  socket.on("disconnect", () => {
    for (let room in rooms) {
      delete rooms[room].users[socket.id];
      delete rooms[room].scores[socket.id];
      io.to(room).emit("updateUsers", rooms[room].users);
    }
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(4000, () => console.log("Server running on http://localhost:4000"));
