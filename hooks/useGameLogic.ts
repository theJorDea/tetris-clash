
import { useState, useEffect, useCallback, useRef } from 'react';
import { PlayerState, CurrentPiece, BoardShape } from '../types';
import {
  BOARD_WIDTH, BOARD_HEIGHT, INITIAL_DROP_INTERVAL,
  LINES_PER_LEVEL, SPEED_INCREMENT_PER_LEVEL, SCORE_VALUES, GARBAGE_RULES
} from '../constants';
import {
  createEmptyBoard, getRandomTetrominoId, getTetrominoById, spawnNewPiece,
  checkCollision, addPieceToBoard, clearLines, addGarbageLinesToBoard
} from '../utils/tetrominoUtils';

interface UseGameLogicProps {
  onSendGarbage: (lines: number) => void;
  initialIncomingGarbage: number;
  clearInitialIncomingGarbage: () => void;
  isGameActive: boolean; // Controlled by App.tsx
}

export const useGameLogic = ({
  onSendGarbage,
  initialIncomingGarbage,
  clearInitialIncomingGarbage,
  isGameActive,
}: UseGameLogicProps) => {
  const [playerState, setPlayerState] = useState<PlayerState>(() => ({
    board: createEmptyBoard(),
    currentPiece: null,
    nextPieceId: getRandomTetrominoId(),
    score: 0,
    linesCleared: 0,
    level: 1,
    isGameOver: false,
    incomingGarbage: 0,
  }));

  const gameLoopTimeoutRef = useRef<number | null>(null);

  const resetPlayerState = useCallback(() => {
    if (gameLoopTimeoutRef.current) {
        clearTimeout(gameLoopTimeoutRef.current);
    }
    setPlayerState({
      board: createEmptyBoard(),
      currentPiece: null,
      nextPieceId: getRandomTetrominoId(),
      score: 0,
      linesCleared: 0,
      level: 1,
      isGameOver: false,
      incomingGarbage: 0,
    });
  }, []);


  const _spawnPiece = useCallback((pieceIdToSpawn: number | null, currentBoard: BoardShape, currentOwnIncomingGarbage: number) => {
    if (pieceIdToSpawn === null) {
        console.error("Attempted to spawn null pieceId");
        setPlayerState(prev => ({ ...prev, isGameOver: true, currentPiece: null }));
        return;
    }

    let boardWithGarbage = currentBoard;
    let effectiveIncomingGarbage = currentOwnIncomingGarbage;

    if (initialIncomingGarbage > 0) {
        effectiveIncomingGarbage += initialIncomingGarbage;
        clearInitialIncomingGarbage(); 
    }
    
    if (effectiveIncomingGarbage > 0) {
      boardWithGarbage = addGarbageLinesToBoard(boardWithGarbage, effectiveIncomingGarbage);
      const tempPieceForGarbageCheck = spawnNewPiece(pieceIdToSpawn); 
      if (checkCollision(tempPieceForGarbageCheck, boardWithGarbage)) {
         setPlayerState(prev => ({ ...prev, board: boardWithGarbage, isGameOver: true, currentPiece: null, incomingGarbage: 0 }));
         return; // Critical: stop if game over due to garbage
      }
    }
    
    const newPiece = spawnNewPiece(pieceIdToSpawn);
    if (checkCollision(newPiece, boardWithGarbage)) {
      setPlayerState(prev => ({ ...prev, board: boardWithGarbage, isGameOver: true, currentPiece: null, incomingGarbage: 0 }));
      // No explicit onGameOver call, parent will detect via playerState.isGameOver
    } else {
      setPlayerState(prev => ({
        ...prev,
        board: boardWithGarbage,
        currentPiece: newPiece,
        nextPieceId: getRandomTetrominoId(),
        incomingGarbage: 0, 
      }));
    }
  }, [initialIncomingGarbage, clearInitialIncomingGarbage]);


  useEffect(() => {
    if (isGameActive) {
      if (!playerState.currentPiece && !playerState.isGameOver) {
        _spawnPiece(playerState.nextPieceId, playerState.board, playerState.incomingGarbage);
      }
    } else { 
      if (gameLoopTimeoutRef.current) {
        clearTimeout(gameLoopTimeoutRef.current);
      }
    }
  }, [
    isGameActive, 
    playerState.currentPiece, 
    playerState.isGameOver, 
    _spawnPiece, 
    playerState.nextPieceId,
    playerState.board, 
    playerState.incomingGarbage
  ]);


  const lockPiece = useCallback(() => {
    if (!playerState.currentPiece || playerState.isGameOver) return;

    const newBoardWithPiece = addPieceToBoard(playerState.board, playerState.currentPiece);
    const { newBoard: boardAfterClearing, linesCleared: linesClearedThisTurn } = clearLines(newBoardWithPiece);
    
    let newScore = playerState.score;
    let totalLines = playerState.linesCleared + linesClearedThisTurn;
    if (linesClearedThisTurn > 0) {
        newScore += SCORE_VALUES[linesClearedThisTurn === 1 ? 'SINGLE' : linesClearedThisTurn === 2 ? 'DOUBLE' : linesClearedThisTurn === 3 ? 'TRIPLE' : 'TETRIS'] || 0;
        newScore += (playerState.level -1) * linesClearedThisTurn * 10; 
    }
    
    const newLevel = Math.floor(totalLines / LINES_PER_LEVEL) + 1;

    const garbageToSend = GARBAGE_RULES[linesClearedThisTurn] || 0;
    if (garbageToSend > 0) {
      onSendGarbage(garbageToSend);
    }
    
    setPlayerState(prev => ({
      ...prev,
      board: boardAfterClearing,
      score: newScore,
      linesCleared: totalLines,
      level: newLevel,
      currentPiece: null, 
    }));

  }, [playerState.currentPiece, playerState.isGameOver, playerState.board, playerState.score, playerState.linesCleared, playerState.level, onSendGarbage]);


  const move = useCallback((dx: number, dy: number, isDrop: boolean = false): boolean => {
    if (!playerState.currentPiece || playerState.isGameOver || !isGameActive) return false;

    if (!checkCollision(playerState.currentPiece, playerState.board, dx, dy)) {
      setPlayerState(prev => ({
        ...prev,
        currentPiece: prev.currentPiece ? { ...prev.currentPiece, x: prev.currentPiece.x + dx, y: prev.currentPiece.y + dy } : null,
        score: isDrop ? prev.score + SCORE_VALUES.SOFT_DROP_PER_ROW : prev.score,
      }));
      return true;
    } else if (dy > 0 && dx === 0) { 
      lockPiece();
    }
    return false;
  }, [playerState.currentPiece, playerState.isGameOver, playerState.board, playerState.score, lockPiece, isGameActive]);

  const rotate = useCallback(() => {
    if (!playerState.currentPiece || playerState.isGameOver || !isGameActive) return;

    const tetromino = getTetrominoById(playerState.currentPiece.tetrominoId);
    const newRotationIndex = (playerState.currentPiece.rotationIndex + 1) % tetromino.shapes.length;
    const newShape = tetromino.shapes[newRotationIndex].shape;

    const kicks = [0, 1, -1, 2, -2]; 
    for (const kick of kicks) {
        if (!checkCollision(playerState.currentPiece, playerState.board, kick, 0, newShape)) {
            setPlayerState(prev => ({
              ...prev,
              currentPiece: prev.currentPiece ? { ...prev.currentPiece, shape: newShape, rotationIndex: newRotationIndex, x: prev.currentPiece.x + kick } : null,
            }));
            return;
        }
    }
  }, [playerState.currentPiece, playerState.isGameOver, playerState.board, isGameActive]);


  const hardDrop = useCallback(() => {
    if (!playerState.currentPiece || playerState.isGameOver || !isGameActive) return;
    let rowsDropped = 0;
    let tempY = playerState.currentPiece.y;
    const pieceToCheck = { ...playerState.currentPiece }; 

    while (!checkCollision(pieceToCheck, playerState.board, 0, (tempY - pieceToCheck.y) + 1)) {
      tempY++;
      rowsDropped++;
    }
    
    setPlayerState(prev => ({
      ...prev,
      currentPiece: prev.currentPiece ? { ...prev.currentPiece, y: tempY } : null,
      score: prev.score + rowsDropped * SCORE_VALUES.HARD_DROP_PER_ROW,
    }));
    
    setTimeout(() => lockPiece(), 0);

  }, [playerState.currentPiece, playerState.isGameOver, playerState.board, playerState.score, lockPiece, isGameActive]);


  useEffect(() => {
    if (playerState.isGameOver || !playerState.currentPiece || !isGameActive) {
      if (gameLoopTimeoutRef.current) clearTimeout(gameLoopTimeoutRef.current);
      return;
    }

    const dropInterval = Math.max(100, INITIAL_DROP_INTERVAL * Math.pow(SPEED_INCREMENT_PER_LEVEL, playerState.level - 1));
    
    if (gameLoopTimeoutRef.current) clearTimeout(gameLoopTimeoutRef.current);
    gameLoopTimeoutRef.current = setTimeout(() => {
      move(0, 1, true);
    }, dropInterval);

    return () => {
      if (gameLoopTimeoutRef.current) clearTimeout(gameLoopTimeoutRef.current);
    };
  }, [playerState.currentPiece, playerState.isGameOver, playerState.level, move, isGameActive]);
  
  const addExternalGarbage = useCallback((lines: number) => {
    if (lines > 0 && isGameActive) { 
        setPlayerState(prev => ({...prev, incomingGarbage: prev.incomingGarbage + lines}));
    }
  }, [isGameActive]); 

  return {
    playerState,
    controls: {
      moveLeft: () => move(-1, 0),
      moveRight: () => move(1, 0),
      rotate,
      softDrop: () => move(0, 1, true),
      hardDrop,
    },
    resetPlayerState,
    addExternalGarbage,
  };
};
