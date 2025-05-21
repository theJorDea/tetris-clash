import React from 'react';
import { PlayerState } from '../types';
import GameBoard from './GameBoard';
import ScoreDisplay from './ScoreDisplay';

interface OpponentGameViewProps {
  playerState: PlayerState;
  playerName: string;
}

const OpponentGameView: React.FC<OpponentGameViewProps> = ({ playerState, playerName }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 text-sm font-semibold text-green-600">
        {playerName || 'Оппонент'}
      </div>
      
      <div className="transform scale-75 origin-top">
        <GameBoard 
          board={playerState.board} 
          currentPiece={playerState.currentPiece} 
        />
      </div>
      
      <div className="mt-1">
        <ScoreDisplay 
          score={playerState.score} 
          level={playerState.level} 
          lines={playerState.linesCleared} 
        />
      </div>
    </div>
  );
};

export default OpponentGameView; 