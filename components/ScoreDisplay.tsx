
import React from 'react';

interface ScoreDisplayProps {
  score: number;
  lines: number;
  level: number;
  incomingGarbage?: number;
}

const StatItem: React.FC<{ label: string; value: string | number; valueClass?: string; labelClass?: string }> = ({ label, value, valueClass = "text-slate-700", labelClass = "text-slate-500" }) => (
  <div className="flex justify-between items-center py-1">
    <span className={`text-xs font-medium ${labelClass} tracking-wider`}>{label}:</span>
    <span className={`text-sm font-semibold ${valueClass}`}>{value}</span>
  </div>
);

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, lines, level, incomingGarbage }) => {
  return (
    <div className="p-3 bg-white rounded border border-slate-300 shadow-sm w-full space-y-1">
      <StatItem label="SCORE" value={score} valueClass="text-blue-600" />
      <StatItem label="LINES" value={lines} />
      <StatItem label="LEVEL" value={level} />
      {incomingGarbage !== undefined && incomingGarbage > 0 && (
         <div className="flex justify-between items-center py-1 mt-2 border-t border-slate-200 pt-2">
            <span className="text-xs font-medium text-red-600 tracking-wider">INCOMING:</span>
            <span className="text-sm font-semibold text-red-600">{incomingGarbage}</span>
        </div>
      )}
    </div>
  );
};

export default ScoreDisplay;