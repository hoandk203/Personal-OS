'use client';

import React from 'react';
import { DailyScheduleResponseDto, ScheduleBlock, ScheduleBlockType } from '@personal-os/types';
import { Calendar, Video, Sparkles, Clock, Sun, Coffee } from 'lucide-react';

interface UnifiedScheduleTimelineProps {
  schedule: DailyScheduleResponseDto | null;
}

export const UnifiedScheduleTimeline: React.FC<UnifiedScheduleTimelineProps> = ({ schedule }) => {
  const blocks = schedule?.blocks || [];
  const totalMeetingMins = schedule?.totalMeetingMinutes || 0;
  const totalDeepWorkMins = schedule?.totalDeepWorkMinutes || 0;
  const totalFreeMins = schedule?.totalFreeMinutes || 0;

  return (
    <div className="glass-panel p-6 rounded-card border border-custom-divider space-y-5 relative overflow-hidden">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-secondary/40 to-transparent"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-DEFAULT bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-h4 text-on-surface font-medium">Unified Daily Schedule</h3>
            <p className="text-xs text-custom-text-muted">
              Synchronized Google Calendar meetings, deep work blocks & free slots
            </p>
          </div>
        </div>

        {/* Meeting vs Deep Work KPI */}
        <div className="flex items-center gap-3 text-xs font-mono-data">
          <span className="px-2.5 py-1 bg-surface-container-low rounded-DEFAULT border border-custom-divider text-secondary">
            {Math.round(totalDeepWorkMins / 60)}h {(totalDeepWorkMins % 60)}m Deep Work
          </span>
          <span className="px-2.5 py-1 bg-surface-container-low rounded-DEFAULT border border-custom-divider text-tertiary">
            {Math.round(totalMeetingMins / 60)}h {(totalMeetingMins % 60)}m Meetings
          </span>
        </div>
      </div>

      {/* Schedule Blocks Flow */}
      <div className="space-y-3 pt-1">
        {blocks.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-custom-divider rounded-card text-xs text-custom-text-muted">
            No schedule blocks available for today.
          </div>
        ) : (
          blocks.map((block) => {
            const isMeeting = block.type === ScheduleBlockType.MEETING;
            const isDeepWork = block.type === ScheduleBlockType.DEEP_WORK;
            const isFreeSlot = block.type === ScheduleBlockType.FREE_SLOT;

            let cardStyle = 'bg-surface-container-low border-custom-divider';
            let icon = Clock;
            let typeBadge = 'Schedule';
            let badgeClass = 'text-custom-text-muted border-custom-divider';

            if (isMeeting) {
              cardStyle = 'bg-tertiary-container/10 border-tertiary/30';
              icon = Video;
              typeBadge = 'Meeting';
              badgeClass = 'text-tertiary bg-tertiary/10 border-tertiary/30';
            } else if (isDeepWork) {
              cardStyle = 'bg-primary/10 border-primary/40 shadow-[0_0_20px_rgba(94,107,255,0.08)]';
              icon = Sparkles;
              typeBadge = 'Deep Work Block';
              badgeClass = 'text-primary bg-primary/10 border-primary/30';
            } else if (isFreeSlot) {
              cardStyle = 'bg-surface-container-lowest/60 border-dashed border-custom-divider-light';
              icon = Coffee;
              typeBadge = 'Free Slot';
              badgeClass = 'text-signal-positive bg-signal-positive/10 border-signal-positive/20';
            }

            const Icon = icon;

            return (
              <div
                key={block.id}
                className={`p-3.5 rounded-DEFAULT border transition-all flex items-center justify-between gap-4 ${cardStyle}`}
              >
                {/* Left: Time & Icon */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="font-mono-data text-xs text-custom-text-muted shrink-0 w-24">
                    {block.startTime} — {block.endTime}
                  </div>

                  <div className="w-7 h-7 rounded-sm bg-surface-container-high flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-on-surface" />
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-on-surface truncate">
                      {block.title}
                    </h4>
                    <span className="text-[11px] text-custom-text-muted font-mono">
                      {block.durationMinutes} minutes duration
                    </span>
                  </div>
                </div>

                {/* Right: Badge & Google Meet Link */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className={`px-2 py-0.5 rounded-sm text-[11px] font-mono border ${badgeClass}`}>
                    {typeBadge}
                  </span>

                  {block.metadata?.hangoutLink && (
                    <a
                      href={block.metadata.hangoutLink as string}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/30 rounded-DEFAULT text-xs font-medium transition-colors inline-flex items-center gap-1"
                    >
                      <Video className="w-3 h-3" />
                      <span>Join Meet</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
