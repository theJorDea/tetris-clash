
import React from 'react';
import GameBoard from './GameBoard';
import NextPiecePreview from './NextPiecePreview';
import ScoreDisplay from './ScoreDisplay';
import { PlayerState } from '../types';

interface PlayerUIProps {
  playerLabel: string; 
  playerState: PlayerState;
  isCurrentPlayer?: boolean; 
  playerColorClass?: string; 
}

const PlayerUI: React.FC<PlayerUIProps> = ({ playerLabel, playerState, playerColorClass = 'text-slate-700' }) => {
  const { board, currentPiece, nextPieceId, score, linesCleared, level, incomingGarbage, isGameOver } = playerState;

  return (
    <div className={`flex flex-col items-center space-y-3 p-3 sm:p-4 rounded-lg shadow-md bg-white border border-slate-300 w-full max-w-md sm:max-w-none sm:min-w-[280px] md:min-w-[320px] transition-all duration-300`}>
      <h2 className={`text-lg sm:text-xl font-semibold truncate max-w-full px-2 ${playerColorClass}`}>{playerLabel || "Player"}</h2>
      
      {/* This div handles internal layout of Board and Info */}
      <div className="flex flex-col items-center w-full space-y-3 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-3 md:space-x-4">
        <GameBoard board={board} currentPiece={currentPiece} />
        <div className="flex flex-col space-y-2 sm:space-y-3 w-full mt-3 sm:mt-0 sm:w-28 md:w-32">
          <ScoreDisplay score={score} lines={linesCleared} level={level} incomingGarbage={incomingGarbage} />
          {nextPieceId && <NextPiecePreview pieceId={nextPieceId} />}
        </div>
      </div>

      {isGameOver && (
        <div className="mt-2 sm:mt-4 text-lg sm:text-xl font-bold text-red-600 bg-red-100 p-2 sm:p-3 rounded border border-red-300">GAME OVER</div>
      )}
    </div>
  );
};

export default PlayerUI;