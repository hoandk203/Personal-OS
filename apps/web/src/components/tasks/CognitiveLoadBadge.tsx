import React from 'react';
import { Brain } from 'lucide-react';

interface CognitiveLoadBadgeProps {
  load: number | null | undefined;
  compact?: boolean;
}

export const CognitiveLoadBadge: React.FC<CognitiveLoadBadgeProps> = ({ load, compact = false }) => {
  const value = load ?? 1;

  // Levels: 1 (Light), 2 (Normal), 3 (Focused), 4 (Heavy), 5 (Max Deep Work)
  let colorClass = 'text-custom-text-muted border-custom-divider-light bg-surface-container-low';
  let label = 'Light';

  if (value === 2) {
    colorClass = 'text-secondary border-secondary/30 bg-secondary/10';
    label = 'Standard';
  } else if (value === 3) {
    colorClass = 'text-primary border-primary/30 bg-primary/10';
    label = 'Focused';
  } else if (value === 4) {
    colorClass = 'text-tertiary border-tertiary/30 bg-tertiary/10';
    label = 'Heavy';
  } else if (value === 5) {
    colorClass = 'text-signal-critical border-signal-critical/30 bg-signal-critical/10';
    label = 'Max Load';
  }

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[11px] font-mono border ${colorClass}`} title={`Cognitive Load: ${value}/5 (${label})`}>
        <Brain className="w-3 h-3" />
        <span>L{value}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-DEFAULT text-xs font-mono border ${colorClass}`}>
      <Brain className="w-3.5 h-3.5" />
      <span>Load: {value}/5 • {label}</span>
    </span>
  );
};
