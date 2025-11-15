import { useRef } from "react";

interface GameUIProps {
  onStartGame: () => void;
}

export function GameUI({ onStartGame }: GameUIProps) {
  const startButtonRef = useRef<HTMLButtonElement | null>(null);
  const howToPlayRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <button ref={startButtonRef} className="startButton hidden" onClick={onStartGame}>
        Start
      </button>
      <div ref={howToPlayRef} className="howToPlay hidden">
        <p>How to Play</p>
        <p>- Swipe or use arrows to move.</p>
        <p>- Avoid branches!</p>
        <p>- Grab Base tokens for points.</p>
        <p>- Survive the speeding tree!</p>
      </div>
    </>
  );
}

