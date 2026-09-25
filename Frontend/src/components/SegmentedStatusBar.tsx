import React from 'react';
import { Check } from 'lucide-react';

interface SegmentedStatusBarProps {
  progressPercent: number; // 0 to 100
  className?: string;
}

export const SegmentedStatusBar: React.FC<SegmentedStatusBarProps> = ({
  progressPercent,
  className = '',
}) => {
  // Clamp between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progressPercent));
  
  // Each segment represents 10% (10 segments total)
  const completedSegments = Math.round(clampedProgress / 10);
  const totalSegments = 10;
  const isComplete = clampedProgress >= 100;
  const isNotStarted = clampedProgress === 0;

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 select-none ${className}`}>
      
      {/* 10-Segmented Long Bar */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-950/80 border border-slate-800 shadow-inner">
        {Array.from({ length: totalSegments }).map((_, index) => {
          let segmentColor = '';

          if (isNotStarted) {
            // "grey boxes if not yet started"
            segmentColor = 'bg-slate-700/60 border-slate-600/50';
          } else if (index < completedSegments) {
            // "shade them green how much is done"
            segmentColor = 'bg-emerald-500 border-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]';
          } else {
            // "and red how much is remaining"
            segmentColor = 'bg-red-600/75 border-red-500/60 shadow-[0_0_4px_rgba(239,68,68,0.4)]';
          }

          return (
            <div
              key={index}
              className={`w-3.5 sm:w-5 h-6 sm:h-7 rounded-[3px] border transition-all duration-300 ${segmentColor}`}
              title={`Segment ${index + 1} (${(index + 1) * 10}%)`}
            />
          );
        })}
      </div>

      {/* Status Label & 100% Complete Indicator */}
      <div className="flex items-center gap-2">
        {isComplete ? (
          // "If the task is 100% complete show a green circle with a green tick mark inside"
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="w-7 h-7 rounded-full border-2 border-emerald-400 bg-emerald-950/80 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.7)] animate-bounce">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 tracking-wide">
              100% complete
            </span>
          </div>
        ) : isNotStarted ? (
          <span className="text-xs font-mono text-slate-400">
            status : <span className="text-slate-500 font-semibold">not yet started</span>
          </span>
        ) : (
          <span className="text-xs font-mono text-slate-300">
            status : <span className="text-cyan-400 font-bold">{clampedProgress}% complete</span>
          </span>
        )}
      </div>

    </div>
  );
};
