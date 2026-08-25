'use client';

import React from 'react';
import { Task, TaskStatus, Project } from '@personal-os/types';
import { TaskCard } from './TaskCard';
import { Inbox, Calendar, PlayCircle, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface TaskKanbanBoardProps {
  tasks: Task[];
  projects: Project[];
  onTransitionStatus: (id: string, newStatus: TaskStatus) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

export const TaskKanbanBoard: React.FC<TaskKanbanBoardProps> = ({
  tasks,
  projects,
  onTransitionStatus,
  onDeleteTask
}) => {
  const projectMap = new Map(projects.map(p => [p.id, p.name]));

  const columns: { status: TaskStatus; title: string; icon: any; colorClass: string }[] = [
    { status: TaskStatus.INBOX, title: 'Inbox / Triage', icon: Inbox, colorClass: 'text-custom-text-muted border-custom-divider' },
    { status: TaskStatus.PLANNED, title: 'Planned Queue', icon: Calendar, colorClass: 'text-secondary border-secondary/30' },
    { status: TaskStatus.IN_PROGRESS, title: 'In Progress (Active)', icon: PlayCircle, colorClass: 'text-primary border-primary/30' },
    { status: TaskStatus.BLOCKED, title: 'Blocked / Waiting', icon: AlertOctagon, colorClass: 'text-tertiary border-tertiary/30' },
    { status: TaskStatus.COMPLETED, title: 'Completed', icon: CheckCircle2, colorClass: 'text-signal-positive border-signal-positive/30' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
      {columns.map(({ status, title, icon: Icon, colorClass }) => {
        const columnTasks = tasks.filter(t => t.status === status);

        return (
          <div
            key={status}
            className="glass-card rounded-card p-3.5 border border-custom-divider flex flex-col min-h-[500px] bg-surface-container-lowest/70"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-custom-divider">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${colorClass.split(' ')[0]}`} />
                <h3 className="font-body-md text-xs uppercase tracking-wider font-medium text-on-surface">
                  {title}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono-data bg-surface-container text-custom-text-muted">
                {columnTasks.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5">
              {columnTasks.length === 0 ? (
                <div className="h-32 flex items-center justify-center border border-dashed border-custom-divider-light rounded-card text-xs text-custom-text-muted/60">
                  No tasks
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    projectName={task.projectId ? projectMap.get(task.projectId) : undefined}
                    onTransitionStatus={onTransitionStatus}
                    onDeleteTask={onDeleteTask}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
