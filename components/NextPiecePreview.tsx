
import React from 'react';
import { TETROMINOES_LIST, NEXT_PIECE_BLOCK_SIZE_CSS } from '../constants';
import TetrominoBlock from './TetrominoBlock';

interface NextPiecePreviewProps {
  pieceId: number | null;
}

const NextPiecePreview: React.FC<NextPiecePreviewProps> = ({ pieceId }) => {
  if (!pieceId) return null;

  const tetromino = TETROMINOES_LIST.find(t => t.id === pieceId);
  if (!tetromino) return null;

  const shape = tetromino.shapes[0].shape;
  const gridSize = 4; 
  const blockSizePx = 12; // Corresponds to NEXT_PIECE_BLOCK_SIZE_CSS 'w-3 h-3' (0.75rem = 12px)
  const gapPx = 1; // from gap-px
  const paddingContainerPx = 1; // from p-px
  const borderContainerPx = 1; // from border

  const previewGrid: number[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));

  const shapeHeight = shape.filter(row => row.some(cell => cell === 1)).length;
  let minX = gridSize, maxX = 0;
  shape.forEach(row => {
    row.forEach((cell, cIdx) => {
      if (cell === 1) {
        if (cIdx < minX) minX = cIdx;
        if (cIdx > maxX) maxX = cIdx;
      }
    });
  });
  const shapeWidth = (minX <= maxX) ? (maxX - minX + 1) : 0;
  
  const offsetY = Math.floor((gridSize - shapeHeight) / 2);
  const offsetX = Math.floor((gridSize - shapeWidth) / 2) - minX;


  shape.forEach((row, rIdx) => {
    row.forEach((cell, cIdx) => {
      if (cell === 1) {
        const previewY = rIdx + offsetY;
        const previewX = cIdx + offsetX;
        if (previewY < gridSize && previewX < gridSize && previewY >=0 && previewX >=0) {
           previewGrid[previewY][previewX] = tetromino.id;
        }
      }
    });
  });

  const contentDimension = gridSize * blockSizePx + (gridSize - 1) * gapPx;
  const totalDimension = contentDimension + (paddingContainerPx * 2) + (borderContainerPx * 2);

  return (
    <div className="p-2 bg-white rounded border border-slate-300 shadow-sm">
      <h4 className="text-xs text-slate-600 mb-2 text-center font-semibold tracking-wider">NEXT</h4>
      <div
        className="grid gap-px mx-auto bg-slate-200 p-px border border-slate-300 rounded-sm"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          width: `${totalDimension}px`,
          height: `${totalDimension}px`,
        }}
      >
        {previewGrid.map((row, y) =>
          row.map((blockType, x) => (
            <TetrominoBlock key={`next-${y}-${x}`} type={blockType} sizeCss={NEXT_PIECE_BLOCK_SIZE_CSS} />
          ))
        )}
      </div>
    </div>
  );
};

export default NextPiecePreview;