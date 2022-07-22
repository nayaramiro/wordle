import { Letter, LetterState } from "../hooks/useWordle";

const keys = [[..."qwertyuiop"], [..."asdfghjkl"], [..."zxcvbnm"]];

interface Props {
  letters: Letter[];
  onKeyPressed: (key: string) => void;
}

export const Keypad = ({ letters, onKeyPressed }: Props) => {
  return (
    <div className="flex flex-col items-center">
      {keys.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((key) => {
            const letter = letters.find((l) => l.letter === key);
            const letterState = letter?.state ?? LetterState.None;
            return (
              <button
                key={key}
                className={[
                  "w-8 h-12 rounded-sm bg-gray-700 m-0.5 hover:bg-blue-800",
                  letterState === LetterState.Fail && "bg-gray-900",
                  letterState === LetterState.Misplaced && "bg-yellow-700"
                ].join(" ")}
                onClick={(e) => {
                  (e.target as HTMLButtonElement).blur();
                  onKeyPressed(key);
                }}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
