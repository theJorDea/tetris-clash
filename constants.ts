
import { Tetromino } from './types';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const BLOCK_SIZE_CSS = 'w-4 h-4'; // Tailwind class for block size (1rem = 16px)
export const NEXT_PIECE_BLOCK_SIZE_CSS = 'w-3 h-3'; // Tailwind class for block size (0.75rem = 12px)

// Solid, distinct colors for minimalist theme
export const COLORS: { [key: number]: string } = {
  1: '#00A1E4', // I: Bright Blue
  2: '#0050EF', // J: Dark Blue
  3: '#F7921C', // L: Orange
  4: '#FFD900', // O: Yellow
  5: '#00A859', // S: Green
  6: '#A700AE', // T: Purple
  7: '#E4002B', // Z: Red
  8: '#6C757D'  // Garbage: Medium Grey
};

export const TETROMINOES_LIST: Tetromino[] = [
  { // I
    id: 1, name: 'I', colorClass: COLORS[1], shapes: [
      { shape: [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]] },
      { shape: [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]] },
    ]
  },
  { // J
    id: 2, name: 'J', colorClass: COLORS[2], shapes: [
      { shape: [[1,0,0], [1,1,1], [0,0,0]] },
      { shape: [[0,1,1], [0,1,0], [0,1,0]] },
      { shape: [[0,0,0], [1,1,1], [0,0,1]] },
      { shape: [[0,1,0], [0,1,0], [1,1,0]] },
    ]
  },
  { // L
    id: 3, name: 'L', colorClass: COLORS[3], shapes: [
      { shape: [[0,0,1], [1,1,1], [0,0,0]] },
      { shape: [[0,1,0], [0,1,0], [0,1,1]] },
      { shape: [[0,0,0], [1,1,1], [1,0,0]] },
      { shape: [[1,1,0], [0,1,0], [0,1,0]] },
    ]
  },
  { // O
    id: 4, name: 'O', colorClass: COLORS[4], shapes: [
      { shape: [[1,1], [1,1]] },
    ]
  },
  { // S
    id: 5, name: 'S', colorClass: COLORS[5], shapes: [
      { shape: [[0,1,1], [1,1,0], [0,0,0]] },
      { shape: [[0,1,0], [0,1,1], [0,0,1]] },
    ]
  },
  { // T
    id: 6, name: 'T', colorClass: COLORS[6], shapes: [
      { shape: [[0,1,0], [1,1,1], [0,0,0]] },
      { shape: [[0,1,0], [0,1,1], [0,1,0]] },
      { shape: [[0,0,0], [1,1,1], [0,1,0]] },
      { shape: [[0,1,0], [1,1,0], [0,1,0]] },
    ]
  },
  { // Z
    id: 7, name: 'Z', colorClass: COLORS[7], shapes: [
      { shape: [[1,1,0], [0,1,1], [0,0,0]] },
      { shape: [[0,0,1], [0,1,1], [0,1,0]] },
    ]
  }
];

export const GARBAGE_BLOCK_ID = 8;

export const INITIAL_DROP_INTERVAL = 1000; // ms
export const LINES_PER_LEVEL = 10;
export const SPEED_INCREMENT_PER_LEVEL = 0.8; // Multiplier for interval

export const SCORE_VALUES = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  SOFT_DROP_PER_ROW: 1,
  HARD_DROP_PER_ROW: 2,
};

// Lines cleared -> Garbage lines sent
export const GARBAGE_RULES: { [key: number]: number } = {
  2: 1, // Double
  3: 2, // Triple
  4: 4, // Tetris
};

export const PLAYER_1_CONTROLS = {
  left: 'a',
  right: 'd',
  rotate: 'w',
  softDrop: 's',
  hardDrop: ' ', // Space
};

export const PLAYER_2_CONTROLS = {
  left: 'ArrowLeft',
  right: 'ArrowRight',
  rotate: 'ArrowUp',
  softDrop: 'ArrowDown',
  hardDrop: 'Enter',
};