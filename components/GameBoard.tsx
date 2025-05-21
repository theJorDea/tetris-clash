import React from 'react';
import { BoardShape, CurrentPiece } from '../types';
import { BOARD_WIDTH, BOARD_HEIGHT, TETROMINOES_LIST } from '../constants';
import TetrominoBlock from './TetrominoBlock';

interface GameBoardProps {
  board: BoardShape;
  currentPiece: CurrentPiece | null;
}

const GameBoard: React.FC<GameBoardProps> = ({ board, currentPiece }) => {
  const displayBoard = board.map(row => [...row]);

  if (currentPiece) {
    const tetromino = TETROMINOES_LIST.find(t => t.id === currentPiece.tetrominoId);
    if (tetromino) {
        currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell !== 0) {
            const boardY = currentPiece.y + y;
            const boardX = currentPiece.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.tetrominoId;
            }
          }
        });
      });
    }
  }

  return (
    <div
      className="grid bg-slate-200 rounded border border-slate-300"
      style={{
        gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
        gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`,
        width: `${BOARD_WIDTH * 1}rem`, // Updated for 1rem blocks
        height: `${BOARD_HEIGHT * 1}rem`, // Updated for 1rem blocks
        aspectRatio: `${BOARD_WIDTH} / ${BOARD_HEIGHT}`,
        padding: '2px', 
        gap: '1px',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {displayBoard.map((row, y) =>
        row.map((blockType, x) => (
          <TetrominoBlock key={`${y}-${x}`} type={blockType} />
        ))
      )}
    </div>
  );
};

export default GameBoard;