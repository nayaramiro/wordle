import { useCallback, useEffect, useState } from "react";
import { wordList } from "../lib/wordList";

export enum LetterState {
  None,
  OK,
  Misplaced,
  Fail
}

export interface Letter {
  letter: string;
  state: LetterState;
}

type Try = Letter[];

const getLetterState = (
  word: string,
  letter: string,
  letterIndex: number
): LetterState => {
  if (word[letterIndex] === letter) return LetterState.OK;

  if (word.includes(letter)) return LetterState.Misplaced;

  return LetterState.Fail;
};

interface Callbacks {
  onGameEnd?: (
    word: string,
    wordFound: boolean,
    tries: Try[],
    maxTries: number
  ) => void;
  onInvalidWord?: (word: string) => void;
}

export const useWordle = (
  wordToFind: string,
  maxTries: number,
  { onGameEnd, onInvalidWord }: Callbacks
) => {
  const [tries, setTries] = useState<Try[]>([]);
  const [previousTries, setPreviousTries] = useState<Try[]>([]);
  const [currentTry, setCurrentTry] = useState("");
  const [canValidate, setCanValidate] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [wordFound, setWordFound] = useState(false);
  const [foundLetters, setFoundLetters] = useState<Letter[]>([]);

  const addLetter = useCallback(
    (letter: string) => {
      if (gameEnded) return;

      setCurrentTry((prev) => {
        if (prev.length >= wordToFind.length)
          return prev.slice(0, wordToFind.length);
        return prev + letter;
      });
    },
    [wordToFind, gameEnded]
  );

  const validateWord = useCallback(() => {
    if (gameEnded) return;
    if (currentTry.length < wordToFind.length) return;

    if (!wordList.includes(currentTry)) {
      onInvalidWord?.(currentTry);
      return;
    }

    setCurrentTry("");

    if (currentTry.toLowerCase() === wordToFind.toLowerCase()) {
      setPreviousTries((prev) => [
        ...prev,
        [...currentTry].map((letter) => ({ letter, state: LetterState.OK }))
      ]);
      setWordFound(true);
      return;
    }

    setPreviousTries((prev) => [
      ...prev,
      [...currentTry].map((letter, index) => ({
        letter,
        state: getLetterState(wordToFind.toLowerCase(), letter, index)
      }))
    ]);
  }, [gameEnded, currentTry, wordToFind, onInvalidWord]);

  const removeLastLetter = () => {
    setCurrentTry((prev) => prev.slice(0, prev.length - 1));
  };

  const reset = () => {
    setGameEnded(false);
    setPreviousTries([]);
    setCurrentTry("");
    setWordFound(false);
  };

  useEffect(() => {
    setCanValidate(currentTry.length === wordToFind.length);
  }, [currentTry, wordToFind]);

  useEffect(() => {
    setTries(() => {
      if (wordFound)
        return [
          ...previousTries,
          ...Array.from({ length: maxTries - previousTries.length }, () =>
            Array.from({ length: wordToFind.length }, () => ({
              letter: "",
              state: LetterState.None
            }))
          )
        ];

      if (gameEnded) return [...previousTries];

      return [
        ...previousTries,
        [...currentTry.padEnd(wordToFind.length)].map((letter) => ({
          letter,
          state: LetterState.None
        })),
        ...Array.from({ length: maxTries - previousTries.length - 1 }, () =>
          Array.from({ length: wordToFind.length }, () => ({
            letter: "",
            state: LetterState.None
          }))
        )
      ];
    });
  }, [gameEnded, previousTries, currentTry, wordFound, maxTries, wordToFind]);

  useEffect(() => {
    setGameEnded(previousTries.length >= maxTries || wordFound);
  }, [wordFound, previousTries, maxTries]);

  useEffect(() => {
    reset();
  }, [wordToFind, maxTries]);

  useEffect(() => {
    if (gameEnded) onGameEnd?.(wordToFind, wordFound, previousTries, maxTries);
  }, [gameEnded, onGameEnd, wordToFind, wordFound, previousTries, maxTries]);

  useEffect(() => {
    setFoundLetters([...previousTries].flat().reverse());
  }, [previousTries]);

  return {
    canValidate,
    addLetter,
    validateWord,
    tries,
    reset,
    removeLastLetter,
    foundLetters
  };
};
