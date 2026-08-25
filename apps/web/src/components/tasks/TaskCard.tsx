'use client';

import React from 'react';
import { Task, TaskStatus, Priority, SourceType } from '@personal-os/types';
import { CognitiveLoadBadge } from './CognitiveLoadBadge';
import {
  Calendar,
  ExternalLink,
  GitBranch,
  Clock,
  CheckCircle,
  Play,
  Pause,
  AlertCircle,
  Trash2,
  ChevronRight
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onTransitionStatus: (id: string, newStatus: TaskStatus) => Promise<void>;
  onDeleteTask?: (id: string) => Promise<void>;
  projectName?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onTransitionStatus,
  onDeleteTask,
  projectName
}) => {
  const isOverdue = task.dueAt && new Date(task.dueAt).getTime() < Date.now() && task.status !== TaskStatus.COMPLETED;

  // Priority styling adhering to DESIGN_TOKEN.md
  let priorityClass = 'text-custom-text-muted bg-surface-container-low border-custom-divider';
  if (task.priority === Priority.HIGH) {
    priorityClass = 'text-primary bg-primary/10 border-primary/30';
  } else if (task.priority === Priority.URGENT) {
    priorityClass = 'text-signal-critical bg-signal-critical/10 border-signal-critical/30 animate-pulse';
  } else if (task.priority === Priority.MEDIUM) {
    priorityClass = 'text-secondary bg-secondary/10 border-secondary/30';
  }

  const formattedDue = task.dueAt
    ? new Date(task.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <div className="bg-surface-container-low p-4 rounded-card border border-custom-divider hover:border-white/[0.15] transition-all flex flex-col justify-between group relative overflow-hidden shadow-sm">
      {/* Glow on left border if urgent/high */}
      {task.priority === Priority.URGENT && (
        <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-signal-critical"></div>
      )}

      <div className="space-y-3">
        {/* Top Badges: Project, Priority, Cognitive Load */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {projectName && (
              <span className="px-2 py-0.5 bg-surface-container-high text-custom-text-muted rounded-sm text-[11px] font-mono border border-custom-divider-light">
                {projectName}
              </span>
            )}
            <span className={`px-2 py-0.5 rounded-sm text-[11px] font-mono border uppercase ${priorityClass}`}>
              {task.priority}
            </span>
          </div>
          <CognitiveLoadBadge load={task.cognitiveLoad} compact />
        </div>

        {/* Task Title & Description */}
        <div>
          <h4 className="font-body-md text-sm font-medium text-on-surface group-hover:text-primary transition-colors leading-snug">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-custom-text-muted mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Source Context Linking */}
        {task.source && task.source.type !== SourceType.MANUAL && (
          <div className="pt-1">
            {task.source.externalUrl ? (
              <a
                href={task.source.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface-container-lowest hover:bg-white/[0.06] text-secondary border border-secondary/20 rounded-sm text-[11px] font-mono transition-all group/link"
              >
                {task.source.type === SourceType.GITHUB ? (
                  <GitBranch className="w-3 h-3 text-secondary" />
                ) : (
                  <Calendar className="w-3 h-3 text-secondary" />
                )}
                <span>{task.source.externalReferenceId || 'External Link'}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover/link:opacity-100" />
              </a>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container-lowest text-custom-text-muted rounded-sm text-[11px] font-mono">
                {task.source.type}: {task.source.externalReferenceId}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Due date & Transition buttons */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-custom-divider-light text-xs text-custom-text-muted">
        <div className="flex items-center gap-1.5">
          {formattedDue && (
            <span className={`flex items-center gap-1 font-mono-data text-[11px] ${isOverdue ? 'text-signal-critical font-medium' : ''}`}>
              <Clock className="w-3 h-3" />
              <span>{formattedDue} {isOverdue && '(Overdue)'}</span>
            </span>
          )}
        </div>

        {/* Quick Transition State Action */}
        <div className="flex items-center gap-1.5">
          {task.status === TaskStatus.INBOX && (
            <button
              onClick={() => onTransitionStatus(task.id, TaskStatus.PLANNED)}
              className="px-2 py-1 bg-surface-container-high hover:bg-white/[0.08] text-custom-text-muted hover:text-on-surface rounded-sm text-[11px] transition-all"
              title="Move to Planned"
            >
              Plan
            </button>
          )}

          {task.status === TaskStatus.PLANNED && (
            <button
              onClick={() => onTransitionStatus(task.id, TaskStatus.IN_PROGRESS)}
              className="flex items-center gap-1 px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-sm text-[11px] transition-all"
              title="Start Working"
            >
              <Play className="w-2.5 h-2.5" />
              <span>Start</span>
            </button>
          )}

          {task.status === TaskStatus.IN_PROGRESS && (
            <>
              <button
                onClick={() => onTransitionStatus(task.id, TaskStatus.BLOCKED)}
                className="px-2 py-1 bg-tertiary/10 hover:bg-tertiary/20 text-tertiary border border-tertiary/20 rounded-sm text-[11px] transition-all"
                title="Mark Blocked"
              >
                Block
              </button>
              <button
                onClick={() => onTransitionStatus(task.id, TaskStatus.COMPLETED)}
                className="flex items-center gap-1 px-2 py-1 bg-signal-active/10 hover:bg-signal-active/20 text-signal-active border border-signal-active/20 rounded-sm text-[11px] transition-all"
                title="Mark Done"
              >
                <CheckCircle className="w-2.5 h-2.5" />
                <span>Done</span>
              </button>
            </>
          )}

          {task.status === TaskStatus.BLOCKED && (
            <button
              onClick={() => onTransitionStatus(task.id, TaskStatus.IN_PROGRESS)}
              className="px-2 py-1 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20 rounded-sm text-[11px] transition-all"
              title="Unblock and Resume"
            >
              Resume
            </button>
          )}

          {task.status === TaskStatus.COMPLETED && (
            <span className="text-[11px] text-signal-positive font-mono flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Completed
            </span>
          )}

          {onDeleteTask && (
            <button
              onClick={() => onDeleteTask(task.id)}
              className="text-custom-text-muted hover:text-signal-critical p-1 transition-colors ml-1"
              title="Delete Task"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
