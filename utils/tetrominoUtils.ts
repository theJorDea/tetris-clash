import { BoardShape, CurrentPiece, Tetromino, BlockValue } from '../types';
import { BOARD_WIDTH, BOARD_HEIGHT, TETROMINOES_LIST, GARBAGE_BLOCK_ID } from '../constants';

export const createEmptyBoard = (): BoardShape =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));

export const getRandomTetrominoId = (): number => {
  return Math.floor(Math.random() * TETROMINOES_LIST.length) + 1;
};

export const getTetrominoById = (id: number): Tetromino => {
  const tet = TETROMINOES_LIST.find(t => t.id === id);
  if (!tet) throw new Error(`Tetromino with id ${id} not found.`);
  return tet;
};

export const spawnNewPiece = (tetrominoId: number): CurrentPiece => {
  const tetromino = getTetrominoById(tetrominoId);
  const initialRotationIndex = 0;
  const initialShape = tetromino.shapes[initialRotationIndex].shape;
  
  // Найдем первую непустую строку в форме
  let firstNonEmptyRow = 0;
  for (let y = 0; y < initialShape.length; y++) {
    if (initialShape[y].some(cell => cell !== 0)) {
      firstNonEmptyRow = y;
      break;
    }
  }
  
  return {
    tetrominoId: tetromino.id,
    shape: initialShape,
    x: Math.floor(BOARD_WIDTH / 2) - Math.floor(initialShape[0].length / 2),
    y: -firstNonEmptyRow, // Начинаем с учетом пустых строк вверху фигуры
    rotationIndex: initialRotationIndex,
  };
};

export const checkCollision = (
  piece: CurrentPiece,
  board: BoardShape,
  offsetX: number = 0,
  offsetY: number = 0,
  newShape?: number[][]
): boolean => {
  const shapeToTest = newShape || piece.shape;
  for (let y = 0; y < shapeToTest.length; y++) {
    for (let x = 0; x < shapeToTest[y].length; x++) {
      if (shapeToTest[y][x] !== 0) {
        const boardX = piece.x + x + offsetX;
        const boardY = piece.y + y + offsetY;

        if (
          boardX < 0 ||
          boardX >= BOARD_WIDTH ||
          boardY < 0 ||
          boardY >= BOARD_HEIGHT ||
          (boardY >= 0 && board[boardY] && board[boardY][boardX] !== 0)
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

export const addPieceToBoard = (board: BoardShape, piece: CurrentPiece): BoardShape => {
  const newBoard = board.map(row => [...row]);
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const boardY = piece.y + y;
        const boardX = piece.x + x;
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = piece.tetrominoId as BlockValue;
        }
      }
    });
  });
  return newBoard;
};

export const clearLines = (board: BoardShape): { newBoard: BoardShape; linesCleared: number } => {
  let linesCleared = 0;
  let newBoard = board.filter(row => {
    if (row.every(cell => cell !== 0)) {
      linesCleared++;
      return false;
    }
    return true;
  });

  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(0));
  }
  return { newBoard, linesCleared };
};

export const addGarbageLinesToBoard = (board: BoardShape, count: number): BoardShape => {
  if (count <= 0) return board;
  const newBoard = board.map(row => [...row]);

  for (let i = 0; i < count; i++) {
    newBoard.shift(); // Remove top row
    const garbageRow = Array(BOARD_WIDTH).fill(GARBAGE_BLOCK_ID as BlockValue);
    const holePosition = Math.floor(Math.random() * BOARD_WIDTH);
    garbageRow[holePosition] = 0; // Create a hole
    newBoard.push(garbageRow); // Add garbage at the bottom
  }
  return newBoard;
};
