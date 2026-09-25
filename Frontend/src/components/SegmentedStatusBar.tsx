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
  const clampedProgress = Math.max(0, Math.min(100, progressPercent));
  const completedSegments = Math.round(clampedProgress / 10);
  const totalSegments = 10;
  const isComplete = clampedProgress >= 100;
  const isNotStarted = clampedProgress === 0;

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 select-none ${className}`}>
      
      {/* 10-Segmented Industrial Meter */}
      <div className="flex items-center gap-1 p-1 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-inner">
        {Array.from({ length: totalSegments }).map((_, index) => {
          let segmentStyle = '';

          if (isNotStarted) {
            segmentStyle = 'bg-[var(--bg-subtle)] border border-[var(--border-subtle)] opacity-40';
          } else if (index < completedSegments) {
            segmentStyle = 'bg-[var(--success)] border border-[var(--success)]';
          } else {
            segmentStyle = 'bg-[var(--accent-muted)] border border-[var(--accent)]/40';
          }

          return (
            <div
              key={index}
              className={`w-3.5 sm:w-4.5 h-5 sm:h-6 rounded-[2px] transition-all duration-200 ${segmentStyle}`}
              title={`Segment ${index + 1} (${(index + 1) * 10}%)`}
            />
          );
        })}
      </div>

      {/* Status Label & 100% Complete Indicator */}
      <div className="flex items-center gap-2">
        {isComplete ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border border-[var(--success)] bg-[var(--success-muted)] flex items-center justify-center">
              <Check className="w-3 h-3 text-[var(--success)] stroke-[3]" />
            </div>
            <span className="text-xs font-mono font-bold text-[var(--success)] uppercase">
              100% Complete
            </span>
          </div>
        ) : isNotStarted ? (
          <span className="text-xs font-mono text-[var(--text-muted)]">
            status: <span className="text-[var(--text-muted)] font-semibold">idle</span>
          </span>
        ) : (
          <span className="text-xs font-mono text-[var(--text-secondary)]">
            status: <span className="text-[var(--text-primary)] font-bold">{clampedProgress}% active</span>
          </span>
        )}
      </div>

    </div>
  );
};
