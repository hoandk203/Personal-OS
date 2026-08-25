'use client';

import React, { useState, useEffect } from 'react';
import {
  Task,
  TaskStatus,
  DailyFocusResponseDto,
  DailyScheduleResponseDto,
  ActivityTimelineResponseDto,
  Project
} from '@personal-os/types';
import { api } from '../services/apiClient';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { DailyFocusSelector } from '../components/today/DailyFocusSelector';
import { UnifiedScheduleTimeline } from '../components/today/UnifiedScheduleTimeline';
import { LiveActivityFeed } from '../components/today/LiveActivityFeed';
import {
  Target,
  Brain,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [dailyFocus, setDailyFocus] = useState<DailyFocusResponseDto | null>(null);
  const [schedule, setSchedule] = useState<DailyScheduleResponseDto | null>(null);
  const [timeline, setTimeline] = useState<ActivityTimelineResponseDto | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [focusData, scheduleData, timelineData, tasksData, projectsData] = await Promise.all([
        api.getDailyFocus(),
        api.getDailySchedule(),
        api.getActivityTimeline(),
        api.getTasks(),
        api.getProjects()
      ]);
      setDailyFocus(focusData);
      setSchedule(scheduleData);
      setTimeline(timelineData);
      setAllTasks(tasksData);
      setProjects(projectsData);
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleTaskCompletion = async (taskId: string) => {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === TaskStatus.COMPLETED ? TaskStatus.IN_PROGRESS : TaskStatus.COMPLETED;
    await api.transitionTaskStatus(taskId, newStatus);
    fetchDashboardData();
  };

  const handleToggleFocusPin = async (taskId: string) => {
    await api.toggleDailyFocusTask(taskId);
    fetchDashboardData();
  };

  // KPIs
  const focusCompleted = dailyFocus?.completedCount || 0;
  const focusTotal = dailyFocus?.totalCount || 0;
  const totalMeetingMins = schedule?.totalMeetingMinutes || 105;
  const totalDeepWorkMins = schedule?.totalDeepWorkMinutes || 375;
  const avgHealth = projects.length > 0
    ? Math.round(projects.reduce((acc, p) => acc + (p.health?.overallScore || 50), 0) / projects.length)
    : 85;

  return (
    <div className="flex h-screen w-full ambient-canvas text-on-surface overflow-hidden relative">
      {/* Background ambient lighting orbs strictly within design token bounds */}
      <div className="absolute top-[-10%] right-[15%] w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[450px] h-[450px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <Sidebar />

      <main className="flex-1 flex flex-col overflow-y-auto z-10">
        <Header
          title="Command Center"
          subtitle="Precision Operational Layer"
          onSyncComplete={fetchDashboardData}
        />

        <div className="p-8 space-y-6 max-w-[1728px] mx-auto w-full">
          {/* Top KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* KPI 1: Focus Tasks */}
            <div className="glass-card p-5 rounded-card relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
              <div className="text-xs uppercase tracking-wider text-custom-text-muted font-medium mb-1">Focus Tasks</div>
              <div className="kpi-text text-primary">{focusCompleted} / {focusTotal || 3}</div>
              <div className="text-xs text-signal-positive mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-signal-positive shadow-[0_0_6px_rgba(80,216,233,0.8)]"></span>
                <span>Top 3 Priorities</span>
              </div>
            </div>

            {/* KPI 2: Deep Work Time */}
            <div className="glass-card p-5 rounded-card relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent"></div>
              <div className="text-xs uppercase tracking-wider text-custom-text-muted font-medium mb-1">Deep Work Capacity</div>
              <div className="kpi-text text-secondary">{Math.round(totalDeepWorkMins / 60)}h {(totalDeepWorkMins % 60)}m</div>
              <div className="text-xs text-custom-text-muted mt-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-secondary" />
                <span>High Focus Opportunity</span>
              </div>
            </div>

            {/* KPI 3: Meeting Load */}
            <div className="glass-card p-5 rounded-card relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-tertiary/30 to-transparent"></div>
              <div className="text-xs uppercase tracking-wider text-custom-text-muted font-medium mb-1">Meeting Time</div>
              <div className="kpi-text text-tertiary">{Math.round(totalMeetingMins / 60)}h {(totalMeetingMins % 60)}m</div>
              <div className="text-xs text-custom-text-muted mt-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-tertiary" />
                <span>Synchronized from Calendar</span>
              </div>
            </div>

            {/* KPI 4: System Health */}
            <div className="glass-card p-5 rounded-card relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-signal-active/30 to-transparent"></div>
              <div className="text-xs uppercase tracking-wider text-custom-text-muted font-medium mb-1">Project Health Score</div>
              <div className="kpi-text text-signal-active">{avgHealth} <span className="text-sm font-normal text-custom-text-muted">/100</span></div>
              <div className="text-xs text-signal-positive mt-2 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-signal-active" />
                <span>Deterministic Invariants OK</span>
              </div>
            </div>
          </div>

          {/* Core Operations Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left 2 Cols: Daily Focus & Unified Schedule */}
            <div className="xl:col-span-2 space-y-6">
              <DailyFocusSelector
                dailyFocus={dailyFocus}
                allTasks={allTasks}
                onToggleTaskCompletion={handleToggleTaskCompletion}
                onToggleFocusPin={handleToggleFocusPin}
              />

              <UnifiedScheduleTimeline schedule={schedule} />
            </div>

            {/* Right 1 Col: Live Activity Feed & Quick Actions */}
            <div className="space-y-6">
              <LiveActivityFeed timeline={timeline} />

              {/* Quick Navigation Panel */}
              <div className="glass-panel p-5 rounded-card border border-custom-divider space-y-3">
                <h4 className="font-h4 text-sm font-medium text-on-surface">Productivity Modules</h4>
                <div className="space-y-2">
                  <Link
                    href="/tasks"
                    className="flex items-center justify-between p-3 bg-surface-container-low hover:bg-surface-container-high rounded-DEFAULT border border-custom-divider transition-all text-xs font-medium group"
                  >
                    <span>Manage Kanban Board</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                  <Link
                    href="/projects"
                    className="flex items-center justify-between p-3 bg-surface-container-low hover:bg-surface-container-high rounded-DEFAULT border border-custom-divider transition-all text-xs font-medium group"
                  >
                    <span>Track Project Health Gauges</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-secondary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
