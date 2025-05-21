
import React from 'react';
import { PLAYER_1_CONTROLS, PLAYER_2_CONTROLS } from '../constants';

const ControlItem: React.FC<{ action: string; p1Key: string; p2Key: string }> = ({ action, p1Key, p2Key }) => (
  <div className="grid grid-cols-3 gap-2 items-center py-1.5 text-sm">
    <span className="font-medium text-slate-700 justify-self-start">{action}</span>
    <span className="bg-slate-200 px-2 py-1 rounded text-xs font-mono justify-self-center text-slate-700 border border-slate-300 shadow-sm">{p1Key === ' ' ? 'SPACE' : p1Key.toUpperCase()}</span>
    <span className="bg-slate-200 px-2 py-1 rounded text-xs font-mono justify-self-center text-slate-700 border border-slate-300 shadow-sm">{p2Key.replace('Arrow','').toUpperCase()}</span>
  </div>
);

const ControlsGuide: React.FC = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-md mx-auto border border-slate-300">
      <h3 className="text-lg font-semibold text-center mb-3 text-slate-700">Controls</h3>
      <div className="grid grid-cols-3 gap-2 items-center mb-2 font-medium text-slate-500 text-xs tracking-wider">
        <span className="justify-self-start">ACTION</span>
        <span className="justify-self-center text-blue-600">PLAYER 1</span>
        <span className="justify-self-center text-green-600">PLAYER 2</span>
      </div>
      <ControlItem action="Left" p1Key={PLAYER_1_CONTROLS.left} p2Key={PLAYER_2_CONTROLS.left} />
      <ControlItem action="Right" p1Key={PLAYER_1_CONTROLS.right} p2Key={PLAYER_2_CONTROLS.right} />
      <ControlItem action="Rotate" p1Key={PLAYER_1_CONTROLS.rotate} p2Key={PLAYER_2_CONTROLS.rotate} />
      <ControlItem action="Soft Drop" p1Key={PLAYER_1_CONTROLS.softDrop} p2Key={PLAYER_2_CONTROLS.softDrop} />
      <ControlItem action="Hard Drop" p1Key={PLAYER_1_CONTROLS.hardDrop} p2Key={PLAYER_2_CONTROLS.hardDrop} />
    </div>
  );
};

export default ControlsGuide;