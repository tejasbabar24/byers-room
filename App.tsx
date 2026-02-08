import React, { useState, useEffect, useCallback, useRef } from "react";
import Wall from "./components/Wall";
import socket from "./socket";
import WelcomeOverlay from "./components/WelcomeOverlay";
import { TECHNICAL_WORDS } from "./constants";
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [gameState, setGameState] = useState<
    "IDLE" | "PLAYING" | "PAUSED" | "FINISHED"
  >("IDLE");
  const [currentWord, setCurrentWord] = useState("");
  const currentWordRef = useRef(currentWord);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(-1);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Session management states
  const [sessionActive, setSessionActive] = useState(false);
  const [wordsShown, setWordsShown] = useState(0);
  const [chancesRemaining, setChancesRemaining] = useState(12);
  const [wordArrayIndex, setWordArrayIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState("");
  const [sessionScore, setSessionScore] = useState({ correct: 0, wrong: 0 });
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [revealWord, setRevealWord] = useState("");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bgUrl = new URL("./assets/BG.png", import.meta.url).toString();
const getRandomWord = () => {
  return TECHNICAL_WORDS[
    Math.floor(Math.random() * TECHNICAL_WORDS.length)
  ];
};

  const startNewGame = async (providedWord?: string) => {
    setIsLoading(true);
    try {
      if (providedWord) {
        const w = providedWord.toUpperCase().replace(/[^A-Z]/g, "");
        setCurrentWord(w);
        currentWordRef.current = w;
      } else {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents:
            'Generate a single short uppercase word (3 to 8 letters) related to 1980s sci-fi, technology, or "the upside down". Reply with ONLY the word and nothing else.',
        });
        const generatedWord = response.text
          ?.trim()
          .toUpperCase()
          .replace(/[^A-Z]/g, "");
        if (generatedWord && generatedWord.length >= 3) {
          setCurrentWord(generatedWord);
          currentWordRef.current = generatedWord;
        } else {
          throw new Error("Invalid word format");
        }
      }
    } catch (error) {
      const randomWord =
        TECHNICAL_WORDS[Math.floor(Math.random() * TECHNICAL_WORDS.length)];
      setCurrentWord(randomWord);
      currentWordRef.current = randomWord;
    } finally {
      setIsLoading(false);
      setGameState("PLAYING");
      setCurrentLetterIndex(-1);
      setActiveLetter(null);
      setShowAnswer(false);
      setShowWelcome(false);
      // ref already updated above when word was set
    }
  };

  const handleBlink = useCallback(() => {
    if (gameState !== "PLAYING") return;

    setCurrentLetterIndex((prev) => {
      const next = prev + 1;
      if (next < currentWord.length) {
        setActiveLetter(currentWord[next]);
        return next;
      } else {
        setActiveLetter(null);
        setGameState("FINISHED");
        return prev;
      }
    });
  }, [gameState, currentWord]);

  useEffect(() => {
    // register socket listeners once and keep refs for latest values
    socket.connect();
    const onStart = (payload: any) => {
      // Check if previous session needs to be completed first
      if (sessionActive && !sessionCompleted) {
        console.log(
          "Previous session must be completed before starting new one",
        );
        return;
      }

      const userName = payload?.userName;
      if (!userName) {
        console.log("User name is required to start session");
        return;
      }

      // Start a new session
      setSessionActive(true);
      setWordsShown(0);
      setChancesRemaining(12);
      setWordArrayIndex(0);
      setCurrentUser(userName);
      setSessionScore({ correct: 0, wrong: 0 });
      setSessionCompleted(false);
      setShowWelcome(false);

      // Start with first word from array
      const firstWord = getRandomWord();

      setCurrentWord(firstWord);
      currentWordRef.current = firstWord;
      startNewGame(firstWord);
    };

   const onNext = () => {
  if (!sessionActive || chancesRemaining <= 0) return;

  const newChancesRemaining = chancesRemaining - 1;

  if (newChancesRemaining <= 0) {
    setChancesRemaining(0);
    setSessionCompleted(true);
    setGameState("FINISHED");
    socket.emit("game:sessionCompleted", { userName: currentUser });
    return;
  }

  const nextWord = getRandomWord();

  setWordsShown((prev) => prev + 1);
  setChancesRemaining(newChancesRemaining);

  setCurrentWord(nextWord);
  currentWordRef.current = nextWord;
  startNewGame(nextWord);
};


    const onRepeat = () => repeatSequence();
    const onReveal = (payload: any) => {
      const wordToReveal = payload?.word || currentWordRef.current;
      setRevealWord(wordToReveal);
      setShowRevealModal(true);
    };
    const onScore = (payload: any) => {
      if (!sessionActive || payload?.name !== currentUser) return;

      setSessionScore((prev) => ({
        correct: payload.correct ? prev.correct + 1 : prev.correct,
        wrong: payload.correct ? prev.wrong : prev.wrong + 1,
      }));
    };

    const onEnd = () => {
      // End current session and reset everything
      setSessionActive(false);
      setSessionCompleted(false);
      setGameState("FINISHED");
      setShowWelcome(true);
      setWordsShown(0);
      setChancesRemaining(12);
      setWordArrayIndex(0);
      setCurrentUser("");
      setSessionScore({ correct: 0, wrong: 0 });
    };

    socket.on("start", onStart);
    socket.on("next", onNext);
    socket.on("repeat", onRepeat);
    socket.on("reveal", onReveal);
    socket.on("score", onScore);
    socket.on("end", onEnd);
    if (gameState === "PLAYING") {
      // Use 600ms for last 4 words, 800ms otherwise
      const interval = chancesRemaining <= 4 ? 600 : 800;
      timerRef.current = setInterval(() => {
        handleBlink();
      }, interval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      socket.off("start", onStart);
      socket.off("next", onNext);
      socket.off("repeat", onRepeat);
      socket.off("reveal", onReveal);
      socket.off("score", onScore);
      socket.off("end", onEnd);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, handleBlink, chancesRemaining]);

  const togglePause = () => {
    setGameState((prev) => (prev === "PLAYING" ? "PAUSED" : "PLAYING"));
  };

  const repeatSequence = () => {
    setCurrentLetterIndex(-1);
    setActiveLetter(null);
    setGameState("PLAYING");
  };

  const closeRevealModal = () => {
    setShowRevealModal(false);
    setRevealWord("");
  };

  return (
    <div className="relative h-screen w-full bg-[#1a0f0a] overflow-hidden flex flex-col items-center justify-center">
      {/* Texture Background - subtle */}
      <div
        className="absolute inset-0 bg-repeat opacity-20"
        style={{
          backgroundImage: `url('https://www.transparenttextures.com/patterns/black-linen-2.png')`,
          zIndex: 1,
        }}
      />

      {/* Local Background Image (brighter) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${bgUrl})`,
          filter: "brightness(0.98) contrast(1.05) sepia(0.05)",
        }}
      />

      {/* Main Content Area */}
      <div className="relative z-20 w-full h-full flex flex-col items-center justify-between p-4 md:p-8">
        {showWelcome ? (
          <WelcomeOverlay onStart={startNewGame} isLoading={isLoading} />
        ) : (
          <>
            {/* The Alphabet Wall */}
            <div className="flex-1 flex items-center justify-center w-full max-w-6xl mt-6">
              <Wall activeLetter={activeLetter} />
            </div>

            {/* Session Info and Controls */}
            <div className="w-full max-w-xl bg-black/40 backdrop-blur-lg border border-white/5 rounded-2xl p-6 mb-12 shadow-2xl text-center">
              {sessionActive ? (
                <div className="text-zinc-200 mb-3">
                  <div className="text-xl font-bold text-green-400 mb-2">
                    {currentUser}
                  </div>
                  <div className="flex justify-center gap-6 mb-3">
                    <div className="text-green-400">
                      ✓ Correct:{" "}
                      <span className="font-bold">{sessionScore.correct}</span>
                    </div>
                    <div className="text-red-400">
                      ✗ Wrong:{" "}
                      <span className="font-bold">{sessionScore.wrong}</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    Words: {wordsShown}/12 | Chances Left: {chancesRemaining}
                  </div>
                  {chancesRemaining <= 4 && chancesRemaining > 0 && (
                    <div className="text-yellow-400 text-sm mt-1 animate-pulse">
                      ⚡ SPEED MODE ACTIVE ⚡
                    </div>
                  )}
                  {sessionCompleted && (
                    <div className="text-purple-400 text-lg mt-2 animate-pulse">
                      🎉 SESSION COMPLETED! 🎉
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-zinc-200 mb-3">
                  {sessionCompleted ? (
                    <div className="text-purple-400 mb-2">
                      {currentUser}'s session completed!
                      <br />
                      <span className="text-sm">Ready for next player</span>
                    </div>
                  ) : (
                    <div>No Active Session</div>
                  )}
                </div>
              )}
              <a
                href="/admin"
                className="inline-block px-4 py-2 bg-red-600 rounded-md"
              >
                Open Admin
              </a>
              <div className="mt-4 text-zinc-500 text-[10px] uppercase tracking-[0.4em] text-center font-mono">
                {sessionActive
                  ? "Session Mode"
                  : sessionCompleted
                    ? "Session Complete"
                    : "Waiting for Player"}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Reveal Modal */}
      {showRevealModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-red-900/90 to-red-800/90 backdrop-blur-lg border-2 border-red-500/50 rounded-3xl p-8 max-w-4xl w-full text-center shadow-2xl animate-[scaleIn_0.3s_ease-out]">
            <div className="mb-6">
              <h2 className=" benguiat-bold text-2xl md:text-3xl font-bold text-red-300 mb-4">
                Will says:
              </h2>
              <div className="stranger-things-outlined text-4xl md:text-6xl lg:text-7xl font-bold text-red-100  tracking-[0.2em] drop-shadow-[0_0_20px_rgba(220,38,38,0.8)] break-words px-4">
                {revealWord}
              </div>
            </div>
            <button
              onClick={closeRevealModal}
              className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300/50"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Atmospheric Particles Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-screen overflow-hidden">
        <div className="animate-pulse absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full blur-sm" />
        <div className="animate-pulse absolute top-1/2 left-3/4 w-1 h-1 bg-white rounded-full blur-sm delay-700" />
        <div className="animate-pulse absolute top-2/3 left-1/3 w-1 h-1 bg-white rounded-full blur-sm delay-1000" />
      </div>
    </div>
  );
};

export default App;
