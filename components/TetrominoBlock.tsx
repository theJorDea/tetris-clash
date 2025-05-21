
import React from 'react';
import { BlockValue } from '../types';
import { COLORS, BLOCK_SIZE_CSS, GARBAGE_BLOCK_ID } from '../constants';

interface TetrominoBlockProps {
  type: BlockValue;
  sizeCss?: string;
}

const TetrominoBlock: React.FC<TetrominoBlockProps> = ({ type, sizeCss = BLOCK_SIZE_CSS }) => {
  let style: React.CSSProperties = {
    backgroundColor: '#E9ECEF', // Light grey for empty blocks, matching a slightly darker shade than main bg
    border: '1px solid #DEE2E6', // Subtle border for empty blocks
  };
  let blockClasses = `${sizeCss}`; 

  if (type > 0) {
    const colorHex = COLORS[type as keyof typeof COLORS] || '#6C757D'; // Fallback to garbage color
    style.backgroundColor = colorHex;
    style.border = `1px solid rgba(0,0,0,0.1)`; // Darker, subtle border for filled blocks
    if (type === GARBAGE_BLOCK_ID) {
        style.border = `1px solid rgba(0,0,0,0.2)`;
    }
  }

  return (
    <div
      className={blockClasses}
      style={style}
    />
  );
};

export default TetrominoBlock;