import { useCallback, useEffect, useRef, useState } from "react";
import { useWordle, LetterState } from "./hooks/useWordle";
import { getRandomWord } from "./lib/wordList";
import { Keypad } from "./components/Keypad";

import "./styles.css";

export default function App() {
  const [wordToFind, setWordToFind] = useState("");
  const [error, setError] = useState("");
  const errorTimeout = useRef<number>();
  const {
    tries,
    addLetter,
    removeLastLetter,
    validateWord,
    canValidate,
    foundLetters
  } = useWordle(wordToFind, wordToFind.length + 1, {
    onGameEnd: useCallback((word, wordFound, tries, maxTries) => {
      console.log(
        `${wordFound ? "YAY" : "NAY"}: ${word} => ${
          tries.length
        }/${maxTries} tries`
      );
    }, []),
    onInvalidWord: useCallback((word) => {
      if (errorTimeout.current) clearTimeout(errorTimeout.current);
      setError(`${word} is not in word list.`);
      errorTimeout.current = setTimeout(() => {
        setError("");
      }, 2000);
    }, [])
  });

  const fetchNewWord = useCallback(() => {
    setWordToFind(getRandomWord());
  }, [setWordToFind]);

  useEffect(() => {
    fetchNewWord();
  }, [fetchNewWord]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Backspace") return removeLastLetter();
      if (event.key === "Enter") return validateWord();

      var letterMatch = event.key.match(/[a-zA-Z]/);
      const isLetter = letterMatch && event.key === letterMatch[0];
      if (!isLetter) return;

      addLetter(event.key.toLowerCase());
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [addLetter, removeLastLetter, validateWord]);

  return (
    <div className="bg-gray-800 min-h-screen text-white p-8 flex flex-col items-center">
      <h1 className="text-4xl uppercase text-lg font-semibold">Wordle</h1>
      {error && (
        <h2 className="my-3 px-2 py-1 rounded-sm bg-gray-200 text-gray-800">
          {error}
        </h2>
      )}
      <div className="my-3">
        {tries.map((wordTry, line) => (
          <div key={line} className="flex items-center">
            {wordTry.map(({ letter, state }, char) => (
              <div
                key={char}
                className={[
                  "m-0.5 text-white flex items-center justify-center w-12 h-12 text-xl rounded-sm",
                  state === LetterState.None && "border-2 border-gray-900",
                  state === LetterState.Fail && "bg-gray-900",
                  state === LetterState.OK && "bg-green-700",
                  state === LetterState.Misplaced && "bg-yellow-700"
                ].join(" ")}
              >
                {letter.toUpperCase()}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="p-4">
        <Keypad letters={foundLetters} onKeyPressed={addLetter} />
      </div>
      <div className="p-4">
        <button
          onClick={(e) => {
            (e.target as HTMLButtonElement).blur();
            validateWord();
          }}
          className="px-2 py-1 bg-indigo-700 rounded-sm mr-2 disabled:bg-gray-600"
          disabled={!canValidate}
        >
          Validate
        </button>
        <button
          onClick={(e) => {
            (e.target as HTMLButtonElement).blur();
            fetchNewWord();
          }}
          className="px-2 py-1 bg-indigo-700 rounded-sm"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
