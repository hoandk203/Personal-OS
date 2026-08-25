'use client';

import React, { useState } from 'react';
import { Project, ProjectStatus } from '@personal-os/types';
import { ProjectHealthGauge } from './ProjectHealthGauge';
import { Calendar, Tag, RefreshCw, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
  onRecalculateHealth: (id: string) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onRecalculateHealth,
  onDeleteProject
}) => {
  const [recalculating, setRecalculating] = useState(false);

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      await onRecalculateHealth(project.id);
    } finally {
      setRecalculating(false);
    }
  };

  const formattedDeadline = project.deadline
    ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No deadline';

  return (
    <div className="glass-card p-5 rounded-card relative overflow-hidden flex flex-col justify-between group transition-all hover:border-white/[0.15]">
      {/* Top Edge Glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

      <div className="space-y-4">
        {/* Header: Title & Status */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-h4 text-on-surface font-medium group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-xs text-custom-text-muted mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          <span
            className={`px-2 py-0.5 text-[11px] font-mono rounded-DEFAULT uppercase tracking-wider ${
              project.status === ProjectStatus.ACTIVE
                ? 'bg-signal-active/10 text-signal-active border border-signal-active/30'
                : 'bg-surface-container-high text-custom-text-muted border border-custom-divider'
            }`}
          >
            {project.status}
          </span>
        </div>

        {/* Tags & Deadline Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-custom-text-muted">
          <div className="flex items-center gap-1.5 font-mono-data text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-secondary" />
            <span>{formattedDeadline}</span>
          </div>

          {project.tags && project.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-surface-container-low text-custom-text-muted rounded-sm text-[11px] border border-custom-divider-light"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Health Score Gauge */}
        <div className="pt-2 border-t border-white/[0.06]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase tracking-wider text-custom-text-muted font-medium">
              Health Metric
            </span>
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="text-[11px] text-custom-text-muted hover:text-primary flex items-center gap-1 transition-colors"
              title="Recalculate Health Score"
            >
              <RefreshCw className={`w-3 h-3 ${recalculating ? 'animate-spin text-primary' : ''}`} />
              <span>Recalculate</span>
            </button>
          </div>
          <ProjectHealthGauge health={project.health} />
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.06]">
        <Link
          href={`/tasks?projectId=${project.id}`}
          className="text-xs text-primary hover:text-primary-fixed flex items-center gap-1 font-medium transition-colors"
        >
          <span>View Project Tasks</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <button
          onClick={() => onDeleteProject(project.id)}
          className="text-custom-text-muted hover:text-signal-critical transition-colors p-1"
          title="Delete Project"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
