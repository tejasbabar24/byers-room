import { createServer } from "http";
import { Server } from "socket.io";
import { TECHNICAL_WORDS } from "./constants.js";

const PORT = process.env.PORT || 3001;
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

let currentWord = null;
let currentIndex = 0;
const scores = new Map();
let activeSessionUser = null;
let scoreMarkedForCurrentWord = false;

io.on("connection", (socket) => {
  console.log("client connected", socket.id);

  socket.on("player:join", (payload) => {
    // payload: { name }
    socket.data.name = payload?.name || `Player-${socket.id.slice(0, 4)}`;
    io.emit(
      "players:list",
      Array.from(io.sockets.sockets.values()).map((s) => ({
        id: s.id,
        name: s.data.name || null,
      })),
    );
  });

  socket.on("admin:start", (payload) => {
    // start a new session with user name
    const userName = payload?.userName;
    if (!userName) {
      socket.emit("error", {
        message: "User name is required to start session",
      });
      return;
    }
    activeSessionUser = userName;
    scoreMarkedForCurrentWord = false;
    io.emit("start", { userName });
  });

  socket.on("admin:next", () => {
    // Check if score was marked for current word
    if (!scoreMarkedForCurrentWord) {
      socket.emit("error", {
        message:
          "Please mark the score for current word before moving to next word",
      });
      return;
    }
    // Reset flag for next word
    scoreMarkedForCurrentWord = false;
    // move to next word in current session
    io.emit("next");
  });

  socket.on("admin:repeat", () => {
    io.emit("repeat");
  });

  socket.on("admin:reveal", () => {
    io.emit("reveal", { word: currentWord });
  });

  socket.on("admin:end", () => {
    // End the current session
    activeSessionUser = null;
    scoreMarkedForCurrentWord = false;
    io.emit("end");
  });

  socket.on("game:sessionCompleted", (payload) => {
    // Broadcast to admin that session is completed
    io.emit("admin:sessionCompleted", payload);
  });

  socket.on("admin:mark", ({ name, correct }) => {
    // Only mark scores if there's an active session and the name matches
    if (!activeSessionUser || name !== activeSessionUser) {
      console.log("Cannot mark score: no active session or user mismatch");
      return;
    }

    // Prevent marking the same word twice
    if (scoreMarkedForCurrentWord) {
      socket.emit("error", {
        message:
          "Score already marked for this word. Click Next Word to continue.",
      });
      return;
    }

    const key = name || socket.data.name || "unknown";
    const prev = scores.get(key) || 0;
    const delta = correct ? 1 : 0;
    scores.set(key, prev + delta);
    const leaderboard = Array.from(scores.entries())
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score);
    io.emit("leaderboard", leaderboard);

    // Mark that score has been recorded for current word
    scoreMarkedForCurrentWord = true;

    // Emit score event for real-time tracking
    io.emit("score", { name, correct });
  });

  socket.on("disconnect", () => {
    console.log("client disconnected", socket.id);
    io.emit(
      "players:list",
      Array.from(io.sockets.sockets.values()).map((s) => ({
        id: s.id,
        name: s.data.name || null,
      })),
    );
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket server listening on port ${PORT}`);
});
