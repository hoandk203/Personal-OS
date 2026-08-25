'use client';

import React from 'react';
import { Task, TaskStatus, Priority, Project, SourceType } from '@personal-os/types';
import { CognitiveLoadBadge } from './CognitiveLoadBadge';
import { ExternalLink, GitBranch, Calendar, Trash2, CheckCircle2, Clock } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  onTransitionStatus: (id: string, newStatus: TaskStatus) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  projects,
  onTransitionStatus,
  onDeleteTask
}) => {
  const projectMap = new Map(projects.map(p => [p.id, p.name]));

  return (
    <div className="glass-panel rounded-card border border-custom-divider overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-custom-divider bg-surface-container-lowest text-custom-text-muted uppercase tracking-wider font-mono-data">
              <th className="py-3 px-4">Task Name</th>
              <th className="py-3 px-4">Project</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Load</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Source Link</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-custom-divider-light font-body-md">
            {tasks.map((task) => {
              const isOverdue = task.dueAt && new Date(task.dueAt).getTime() < Date.now() && task.status !== TaskStatus.COMPLETED;

              return (
                <tr key={task.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-3.5 px-4 font-medium text-on-surface">
                    <div className="flex items-center gap-2">
                      <span>{task.title}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-custom-text-muted">
                    {task.projectId ? (
                      <span className="px-2 py-0.5 bg-surface-container rounded-sm font-mono text-[11px]">
                        {projectMap.get(task.projectId) || 'Project'}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <select
                      value={task.status}
                      onChange={(e) => onTransitionStatus(task.id, e.target.value as TaskStatus)}
                      className="bg-surface-container-low border border-custom-divider rounded-sm px-2 py-1 text-xs text-on-surface outline-none focus-glow"
                    >
                      {Object.values(TaskStatus).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-sm font-mono text-[11px] uppercase ${
                      task.priority === Priority.HIGH ? 'text-primary border border-primary/30' :
                      task.priority === Priority.URGENT ? 'text-signal-critical border border-signal-critical/30' :
                      'text-custom-text-muted border border-custom-divider'
                    }`}>
                      {task.priority}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <CognitiveLoadBadge load={task.cognitiveLoad} compact />
                  </td>

                  <td className="py-3.5 px-4 font-mono-data">
                    {task.dueAt ? (
                      <span className={`flex items-center gap-1 ${isOverdue ? 'text-signal-critical font-medium' : 'text-custom-text-muted'}`}>
                        <Clock className="w-3 h-3" />
                        {new Date(task.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    {task.source && task.source.externalUrl ? (
                      <a
                        href={task.source.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-secondary hover:underline font-mono text-[11px]"
                      >
                        {task.source.type === SourceType.GITHUB ? <GitBranch className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                        <span>{task.source.externalReferenceId || 'Link'}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="text-custom-text-muted hover:text-signal-critical p-1 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
