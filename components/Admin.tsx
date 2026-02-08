import React, { useEffect, useState } from "react";
import socket from "../socket";

const Admin: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [currentSessionUser, setCurrentSessionUser] = useState("");
  const [leaderboard, setLeaderboard] = useState<
    Array<{ name: string; score: number }>
  >([]);
  const [players, setPlayers] = useState<Array<{ id: string; name?: string }>>(
    [],
  );
  const [scoreMarkedForWord, setScoreMarkedForWord] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  useEffect(() => {
    socket.connect();
    setConnected(true);

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("leaderboard", (data: any) => {
      setLeaderboard(data || []);
    });

    socket.on("players:list", (list: any) => {
      setPlayers(list || []);
    });

    socket.on("start", (data: any) => {
      if (data?.userName) {
        setCurrentSessionUser(data.userName);
        setScoreMarkedForWord(false);
        setSessionCompleted(false);
      }
    });

    socket.on("end", () => {
      setCurrentSessionUser("");
      setScoreMarkedForWord(false);
      setSessionCompleted(false);
    });

    socket.on("next", () => {
      // Reset score flag for new word
      setScoreMarkedForWord(false);
    });

    socket.on("admin:sessionCompleted", () => {
      setSessionCompleted(true);
    });

    return () => {
      socket.off("leaderboard");
      socket.off("players:list");
      socket.off("start");
      socket.off("end");
      socket.off("next");
      socket.off("admin:sessionCompleted");
    };
  }, []);

  const start = () => {
    if (!newUserName.trim()) {
      alert("Please enter a user name to start the session");
      return;
    }
    socket.emit("admin:start", { userName: newUserName.trim() });
    setNewUserName(""); // Clear the input after starting
  };
  const next = () => {
    if (!scoreMarkedForWord) {
      alert(
        "Please mark the score for current word before moving to next word",
      );
      return;
    }
    socket.emit("admin:next");
  };
  const repeat = () => socket.emit("admin:repeat");
  const reveal = () => socket.emit("admin:reveal");
  const end = () => {
    socket.emit("admin:end");
    setCurrentSessionUser("");
    setScoreMarkedForWord(false);
    setSessionCompleted(false);
  };

  const mark = (correct: boolean) => {
    if (!currentSessionUser) {
      alert("No active session to mark score for");
      return;
    }
    socket.emit("admin:mark", { name: currentSessionUser, correct });
    setScoreMarkedForWord(true);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
      <div className="mb-4">
        Status: {connected ? "connected" : "disconnected"}
      </div>

      <div className="mb-6 p-4 bg-zinc-900 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Start New Session</h2>
        <label className="block mb-1">Enter player name:</label>
        <input
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
          className="px-3 py-2 rounded bg-white/10 w-full mb-3"
          placeholder="Enter player name to start session"
          onKeyPress={(e) => e.key === "Enter" && start()}
        />
        <button
          onClick={start}
          className="px-4 py-2 bg-green-600 rounded w-full"
        >
          Start Session
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={next}
          disabled={!scoreMarkedForWord || sessionCompleted}
          className={`px-4 py-2 rounded ${
            !scoreMarkedForWord || sessionCompleted
              ? "bg-gray-500 cursor-not-allowed opacity-50"
              : "bg-yellow-600 hover:bg-yellow-700"
          }`}
        >
          Next Word
        </button>
        <button
          onClick={repeat}
          disabled={sessionCompleted}
          className={`px-4 py-2 rounded ${
            sessionCompleted
              ? "bg-gray-500 cursor-not-allowed opacity-50"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Repeat
        </button>
        <button
          onClick={reveal}
          disabled={sessionCompleted}
          className={`px-4 py-2 rounded ${
            sessionCompleted
              ? "bg-gray-500 cursor-not-allowed opacity-50"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          Reveal
        </button>
        <button
          onClick={end}
          className="px-4 py-2 bg-zinc-600 hover:bg-zinc-500 rounded"
        >
          End Session
        </button>
      </div>

      {currentSessionUser && (
        <div className="mb-6 p-4 bg-zinc-900 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">
            Mark Score for:{" "}
            <span className="text-green-400">{currentSessionUser}</span>
            {sessionCompleted && (
              <span className="text-yellow-400 text-sm ml-2">
                (Session Completed)
              </span>
            )}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => mark(true)}
              disabled={scoreMarkedForWord || sessionCompleted}
              className={`px-4 py-2 rounded flex-1 ${
                scoreMarkedForWord || sessionCompleted
                  ? "bg-gray-600 cursor-not-allowed opacity-50"
                  : "bg-green-700 hover:bg-green-600"
              }`}
            >
              Mark Correct ✓
            </button>
            <button
              onClick={() => mark(false)}
              disabled={scoreMarkedForWord || sessionCompleted}
              className={`px-4 py-2 rounded flex-1 ${
                scoreMarkedForWord || sessionCompleted
                  ? "bg-gray-600 cursor-not-allowed opacity-50"
                  : "bg-red-700 hover:bg-red-600"
              }`}
            >
              Mark Wrong ✗
            </button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Players</h2>
        <ul>
          {players.map((p) => (
            <li key={p.id}>{p.name || p.id}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Leaderboard</h2>
        <ol className="list-decimal pl-6">
          {leaderboard.map((entry) => (
            <li key={entry.name}>
              {entry.name}: {entry.score}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default Admin;
