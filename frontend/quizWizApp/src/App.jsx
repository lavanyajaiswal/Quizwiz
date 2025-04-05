import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState({});
  const [scores, setScores] = useState({});
  const [question, setQuestion] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    socket.on("updateUsers", (users) => setUsers(users));
    socket.on("gameStarted", (q) => setQuestion(q));
    socket.on("nextQuestion", (q) => setQuestion(q));
    socket.on("gameOver", (finalScores) => {
      setScores(finalScores);
      setGameOver(true);
    });
  }, []);

  const joinRoom = () => {
    if (username && room) {
      socket.emit("joinRoom", { username, room });
      setJoined(true);
    }
  };

  const startGame = () => {
    console.log("Start Game Clicked. Room:", room);
    socket.emit("startGame", room);
  };

  const submitAnswer = (index) => {
    socket.emit("submitAnswer", {
      room,
      socketId: socket.id,
      selectedOption: index
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center px-4 py-8">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        {!joined ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-purple-600">Join QuizWiz</h2>
            <input
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Room"
              onChange={(e) => setRoom(e.target.value)}
            />
            <button
              onClick={joinRoom}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-xl transition"
            >
              Join Room
            </button>
          </div>
        ) : gameOver ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center text-green-600">Game Over!</h2>
            <h3 className="font-semibold text-gray-700">Final Scores:</h3>
            {Object.entries(scores).map(([id, score]) => (
              <div key={id} className="flex justify-between border-b py-1">
                <span>{users[id]}</span>
                <span>{score}</span>
              </div>
            ))}
          </div>
        ) : question ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-700">{question.q}</h3>
            {question.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => submitAnswer(i)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-xl transition block"
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Welcome to Room: <span className="text-purple-600">{room}</span></h3>
            <p className="text-gray-600">Players in room:</p>
            <ul className="list-disc pl-5">
              {Object.values(users).map((u, i) => (
                <li key={i} className="text-gray-700">{u}</li>
              ))}
            </ul>
            <button
              onClick={startGame}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl transition"
            >
              Start Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
