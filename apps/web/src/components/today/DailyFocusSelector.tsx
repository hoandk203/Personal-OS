'use client';

import React from 'react';
import { Task, TaskStatus, DailyFocusResponseDto } from '@personal-os/types';
import { CognitiveLoadBadge } from '../tasks/CognitiveLoadBadge';
import { Target, CheckCircle2, Circle, Plus, Zap, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface DailyFocusSelectorProps {
  dailyFocus: DailyFocusResponseDto | null;
  allTasks: Task[];
  onToggleTaskCompletion: (taskId: string) => Promise<void>;
  onToggleFocusPin: (taskId: string) => Promise<void>;
}

export const DailyFocusSelector: React.FC<DailyFocusSelectorProps> = ({
  dailyFocus,
  allTasks,
  onToggleTaskCompletion,
  onToggleFocusPin
}) => {
  const focusTasks = dailyFocus?.tasks || [];
  const completedCount = dailyFocus?.completedCount || 0;
  const totalCount = dailyFocus?.totalCount || 0;
  const completionRate = dailyFocus?.completionRate || 0;

  // Available tasks that are not yet in focus list
  const focusIds = new Set(focusTasks.map(t => t.id));
  const availableTasks = allTasks.filter(t => !focusIds.has(t.id) && t.status !== TaskStatus.COMPLETED);

  return (
    <div className="glass-panel p-6 rounded-card border border-custom-divider space-y-5 relative overflow-hidden">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>

      {/* Header & Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-DEFAULT bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-h4 text-on-surface font-medium">Daily Focus (Top 3 Priorities)</h3>
            <p className="text-xs text-custom-text-muted">
              High-leverage tasks selected for maximum deep work impact today
            </p>
          </div>
        </div>

        {/* Progress Metric */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-mono-data text-on-surface font-medium">
              {completedCount} / {totalCount} Done ({completionRate}%)
            </div>
            <div className="text-[11px] text-custom-text-muted">
              {totalCount === 3 ? 'Focus Slots Full (3/3)' : `${3 - totalCount} Slots Available`}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-primary via-secondary to-signal-positive transition-all duration-500 rounded-full"
          style={{ width: `${Math.min(100, Math.max(completionRate > 0 ? 5 : 0, completionRate))}%` }}
        ></div>
      </div>

      {/* Focus Tasks List */}
      <div className="space-y-2.5">
        {focusTasks.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-custom-divider rounded-card text-xs text-custom-text-muted">
            No focus tasks pinned yet. Select up to 3 high-priority tasks below.
          </div>
        ) : (
          focusTasks.map((task) => {
            const isDone = task.status === TaskStatus.COMPLETED;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-DEFAULT border transition-all flex items-center justify-between gap-4 ${
                  isDone
                    ? 'bg-surface-container-lowest/50 border-custom-divider opacity-75'
                    : 'bg-surface-container-low border-custom-divider hover:border-primary/40'
                }`}
              >
                {/* Left: Checkbox & Task Title */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => onToggleTaskCompletion(task.id)}
                    className="text-custom-text-muted hover:text-signal-positive transition-colors shrink-0"
                    title={isDone ? 'Mark Incomplete' : 'Mark Completed'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-signal-positive" />
                    ) : (
                      <Circle className="w-5 h-5 text-custom-text-muted hover:text-primary" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <span className={`text-sm font-medium ${isDone ? 'line-through text-custom-text-muted' : 'text-on-surface'}`}>
                      {task.title}
                    </span>
                    {task.description && (
                      <p className="text-xs text-custom-text-muted truncate mt-0.5">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Badges & Remove Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <CognitiveLoadBadge load={task.cognitiveLoad} compact />
                  {task.source?.externalUrl && (
                    <a
                      href={task.source.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-secondary hover:text-primary p-1"
                      title="Open Source Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => onToggleFocusPin(task.id)}
                    className="text-[11px] text-custom-text-muted hover:text-signal-critical px-2 py-0.5 rounded-sm bg-surface-container-high transition-colors"
                    title="Unpin from Daily Focus"
                  >
                    Unpin
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Available Tasks to Pin */}
      {focusTasks.length < 3 && availableTasks.length > 0 && (
        <div className="pt-2 border-t border-custom-divider-light">
          <span className="block text-xs uppercase tracking-wider text-custom-text-muted font-medium mb-2">
            Quick Pin Suggestions (Choose up to 3)
          </span>
          <div className="flex flex-wrap gap-2">
            {availableTasks.slice(0, 4).map((t) => (
              <button
                key={t.id}
                onClick={() => onToggleFocusPin(t.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low hover:bg-surface-container-high border border-custom-divider text-xs text-on-surface rounded-DEFAULT transition-all group"
              >
                <Plus className="w-3.5 h-3.5 text-primary group-hover:scale-110" />
                <span className="truncate max-w-[200px]">{t.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
