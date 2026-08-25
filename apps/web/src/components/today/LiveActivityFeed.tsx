'use client';

import React from 'react';
import { ActivityTimelineResponseDto, ActivityTimelineItem, SourceType } from '@personal-os/types';
import { Activity, GitCommit, GitPullRequest, Calendar, CheckSquare, AlertTriangle } from 'lucide-react';

interface LiveActivityFeedProps {
  timeline: ActivityTimelineResponseDto | null;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ timeline }) => {
  const items = timeline?.items || [];

  return (
    <div className="glass-panel p-6 rounded-card border border-custom-divider space-y-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-custom-divider">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-DEFAULT bg-signal-active/10 border border-signal-active/20 flex items-center justify-center text-signal-active">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-h4 text-on-surface font-medium">Live Activity Timeline</h3>
            <p className="text-xs text-custom-text-muted">Real-time synchronized events & alerts</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-signal-positive font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-signal-positive shadow-[0_0_6px_rgba(80,216,233,0.8)] animate-pulse"></span>
          Streaming
        </span>
      </div>

      {/* Activity List */}
      <div className="space-y-3 pt-1">
        {items.length === 0 ? (
          <div className="p-6 text-center text-xs text-custom-text-muted">
            No recent activity recorded today.
          </div>
        ) : (
          items.map((item) => {
            const isBottleneck = item.type.includes('bottleneck') || (item.metadata?.isBottleneck as boolean);
            const isCommit = item.type.includes('commit');
            const isPR = item.type.includes('pull_request');
            const isMeeting = item.type.includes('meeting');

            let Icon = Activity;
            let iconColor = 'text-primary';
            if (isBottleneck) {
              Icon = AlertTriangle;
              iconColor = 'text-signal-critical';
            } else if (isCommit) {
              Icon = GitCommit;
              iconColor = 'text-secondary';
            } else if (isPR) {
              Icon = GitPullRequest;
              iconColor = 'text-primary';
            } else if (isMeeting) {
              Icon = Calendar;
              iconColor = 'text-tertiary';
            } else {
              Icon = CheckSquare;
              iconColor = 'text-signal-active';
            }

            const timeFormatted = item.timestamp
              ? new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              : 'Just now';

            return (
              <div
                key={item.id}
                className={`p-3 rounded-DEFAULT border transition-all flex items-start justify-between gap-3 ${
                  isBottleneck
                    ? 'bg-signal-critical/10 border-signal-critical/30'
                    : 'bg-surface-container-low border-custom-divider-light hover:border-custom-divider'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-6 h-6 rounded-sm bg-surface-container-high flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                  </div>

                  <div className="min-w-0">
                    <h5 className={`text-xs font-medium ${isBottleneck ? 'text-signal-critical' : 'text-on-surface'}`}>
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-custom-text-muted truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                <span className="font-mono-data text-[11px] text-custom-text-muted shrink-0">
                  {timeFormatted}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
