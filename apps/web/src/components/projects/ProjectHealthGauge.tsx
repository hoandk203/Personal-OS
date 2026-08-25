import React from 'react';
import { ProjectHealth, ProjectHealthStatus } from '@personal-os/types';
import { ShieldCheck, AlertTriangle, Flame, Clock, CheckCircle2 } from 'lucide-react';

interface ProjectHealthGaugeProps {
  health: ProjectHealth | null;
  compact?: boolean;
}

export const ProjectHealthGauge: React.FC<ProjectHealthGaugeProps> = ({ health, compact = false }) => {
  if (!health) {
    return (
      <div className="text-xs text-custom-text-muted italic py-1">
        Health not yet computed. Click recalculate.
      </div>
    );
  }

  const overallScore = health.overallScore ?? 50;
  const status = health.status ?? ProjectHealthStatus.HEALTHY;

  // Status color mappings strictly adhering to DESIGN_TOKEN.md
  let statusColorClass = 'text-signal-positive border-secondary/30 bg-secondary/10';
  let badgeLabel = 'Healthy';

  if (status === ProjectHealthStatus.EXCELLENT) {
    statusColorClass = 'text-primary border-primary/30 bg-primary/10';
    badgeLabel = 'Excellent';
  } else if (status === ProjectHealthStatus.NEEDS_ATTENTION) {
    statusColorClass = 'text-tertiary border-tertiary/30 bg-tertiary/10';
    badgeLabel = 'Needs Attention';
  } else if (status === ProjectHealthStatus.AT_RISK) {
    statusColorClass = 'text-signal-critical border-signal-critical/30 bg-signal-critical/10';
    badgeLabel = 'At Risk';
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 text-xs font-mono rounded-DEFAULT border ${statusColorClass}`}>
          {overallScore}/100 • {badgeLabel}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-2">
      {/* Overall Score Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="kpi-text text-2xl font-mono-data text-on-surface">
            {overallScore}<span className="text-sm text-custom-text-muted font-normal">/100</span>
          </div>
          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-DEFAULT border ${statusColorClass}`}>
            {badgeLabel}
          </span>
        </div>
        <span className="text-[11px] text-custom-text-muted font-mono-data">
          Progress: {Math.round(health.progressScore)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-primary to-secondary transition-all duration-500 rounded-full"
          style={{ width: `${Math.min(100, Math.max(5, health.progressScore))}%` }}
        ></div>
      </div>

      {/* Metric Breakdown Grid */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <div className="bg-surface-container-low p-2 rounded-DEFAULT border border-custom-divider-light flex flex-col">
          <div className="flex items-center gap-1 text-[11px] text-custom-text-muted">
            <Flame className="w-3 h-3 text-secondary" />
            <span>Momentum</span>
          </div>
          <span className="font-mono-data text-xs text-on-surface font-medium mt-0.5">
            {Math.round(health.momentumScore)}/100
          </span>
        </div>

        <div className="bg-surface-container-low p-2 rounded-DEFAULT border border-custom-divider-light flex flex-col">
          <div className="flex items-center gap-1 text-[11px] text-custom-text-muted">
            <Clock className="w-3 h-3 text-tertiary" />
            <span>Schedule Risk</span>
          </div>
          <span className="font-mono-data text-xs text-on-surface font-medium mt-0.5">
            {Math.round(health.scheduleRiskScore)}%
          </span>
        </div>

        <div className="bg-surface-container-low p-2 rounded-DEFAULT border border-custom-divider-light flex flex-col">
          <div className="flex items-center gap-1 text-[11px] text-custom-text-muted">
            <AlertTriangle className="w-3 h-3 text-signal-critical" />
            <span>Blocker Risk</span>
          </div>
          <span className="font-mono-data text-xs text-on-surface font-medium mt-0.5">
            {Math.round(health.blockerRiskScore)}%
          </span>
        </div>
      </div>

      {/* Task Counts if available */}
      {health.breakdown && (
        <div className="flex items-center gap-3 text-[11px] text-custom-text-muted pt-1">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-signal-positive" />
            {health.breakdown.completedTasks}/{health.breakdown.totalTasks} Tasks Done
          </span>
          {health.breakdown.blockedTasks > 0 && (
            <span className="text-signal-critical font-medium">
              • {health.breakdown.blockedTasks} Blocked
            </span>
          )}
          {health.breakdown.overdueTasks > 0 && (
            <span className="text-tertiary font-medium">
              • {health.breakdown.overdueTasks} Overdue
            </span>
          )}
        </div>
      )}
    </div>
  );
};
