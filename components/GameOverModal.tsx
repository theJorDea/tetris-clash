
import React from 'react';

interface GameOverModalProps {
  winnerOPlayerName: string | null; 
  onRestart: () => void;
  isOpen: boolean;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ winnerOPlayerName, onRestart, isOpen }) => {
  if (!isOpen) return null;

  let message = "The game has ended!"; 
  let messageClass = "text-slate-700";
  if (winnerOPlayerName) {
    if (winnerOPlayerName.toLowerCase().includes("draw")) {
      message = winnerOPlayerName;
      messageClass = "text-orange-600";
    } else {
      message = `${winnerOPlayerName} Wins!`;
      messageClass = "text-green-600";
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 content-fade-in">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl text-center border border-slate-300 max-w-md w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3 sm:mb-4">Game Over!</h2>
        <p className={`text-lg sm:text-xl mb-6 sm:mb-8 break-words px-2 font-medium ${messageClass}`}>{message}</p>
        <button
          onClick={onRestart}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-md transition-colors duration-150 focus:outline-none focus:ring-4 focus:ring-blue-300 w-full sm:w-auto"
          aria-label="Play Again"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;