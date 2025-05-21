export type BlockValue = number; // 0 for empty, 1-7 for tetromino colors, 8 for garbage
export type BoardShape = BlockValue[][];

export interface TetrominoShape {
  shape: number[][]; // 0 or 1 to define the block pattern
}

export interface Tetromino {
  id: number; // Unique ID (1-7) for color mapping and storage
  name: string;
  shapes: TetrominoShape[]; // All rotation states
  colorClass: string; // Tailwind CSS background color class
}

export interface CurrentPiece {
  tetrominoId: number;
  shape: number[][]; // Current rotated shape
  x: number;
  y: number;
  rotationIndex: number;
}

export interface PlayerState {
  board: BoardShape;
  currentPiece: CurrentPiece | null;
  nextPieceId: number | null;
  score: number;
  linesCleared: number;
  level: number;
  isGameOver: boolean;
  incomingGarbage: number; // Lines of garbage to be added
}

export type AppStage = 
  | 'INIT_PLAYER1_NAME'       // Host P1 enters name
  | 'LOBBY_AWAITING_PLAYER2'  // Host P1 sees lobby ID & link, waits for P2 to join via link
  | 'INIT_PLAYER2_NAME_JOIN'  // Guest P2 (from link) enters their name
  | 'READY_TO_START'          // Both names entered, ready to click "Start Game"
  | 'PLAYING'
  | 'GAME_OVER_STATE';

export interface Controls {
  left: string;
  right: string;
  rotate: string;
  softDrop: string;
  hardDrop: string;
}