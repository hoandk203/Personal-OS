'use client';

import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, Priority, Project, CreateTaskDto } from '@personal-os/types';
import { api } from '../../services/apiClient';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { TaskKanbanBoard } from '../../components/tasks/TaskKanbanBoard';
import { TaskList } from '../../components/tasks/TaskList';
import { CreateTaskModal } from '../../components/tasks/CreateTaskModal';
import {
  Plus,
  Kanban,
  List as ListIcon,
  Search,
  Filter,
  CheckCircle2,
  Brain,
  AlertCircle
} from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchTasksAndProjects = async () => {
    try {
      setLoading(true);
      const [fetchedTasks, fetchedProjects] = await Promise.all([
        api.getTasks(),
        api.getProjects()
      ]);
      setTasks(fetchedTasks);
      setProjects(fetchedProjects);
    } catch (e) {
      console.error('Failed to load tasks and projects', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndProjects();
  }, []);

  const handleCreateTask = async (dto: CreateTaskDto) => {
    await api.createTask(dto);
    fetchTasksAndProjects();
  };

  const handleTransitionStatus = async (id: string, newStatus: TaskStatus) => {
    // Optimistic UI update
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, status: newStatus, completedAt: newStatus === TaskStatus.COMPLETED ? new Date() : null } : t)));
    try {
      await api.transitionTaskStatus(id, newStatus);
    } catch (e) {
      console.error('Failed to transition status', e);
      fetchTasksAndProjects(); // Rollback on error
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
      await api.deleteTask(id);
    }
  };

  // Filter tasks based on search & selectors
  const filteredTasks = tasks.filter(t => {
    if (selectedProjectId && t.projectId !== selectedProjectId) return false;
    if (selectedPriority && t.priority !== selectedPriority) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const completedCount = filteredTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const inProgressCount = filteredTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  const avgLoad = filteredTasks.length > 0
    ? (filteredTasks.reduce((acc, t) => acc + (t.cognitiveLoad || 1), 0) / filteredTasks.length).toFixed(1)
    : '0';

  return (
    <div className="flex h-screen w-full ambient-canvas text-on-surface overflow-hidden relative">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-y-auto z-10">
        <Header
          title="Tasks & Context Management"
          subtitle="Cognitive Load & Source Context Orchestration"
          onSyncComplete={fetchTasksAndProjects}
        />

        <div className="p-8 space-y-6 max-w-[1728px] mx-auto w-full">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="glass-card p-5 rounded-card relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
              <div className="text-xs uppercase tracking-wider text-custom-text-muted font-medium mb-1">Total Tasks</div>
              <div className="kpi-text text-primary">{filteredTasks.length}</div>
              <div className="text-xs text-signal-positive mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-signal-positive" />
                <span>{completedCount} Completed</span>
              </div>
            </div>

            <div className="glass-card p-5 rounded-card relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent"></div>
              <div className="text-xs uppercase tracking-wider text-custom-text-muted font-medium mb-1">Active In-Progress</div>
              <div className="kpi-text text-secondary">{inProgressCount}</div>
              <div className="text-xs text-custom-text-muted mt-2">
                Focused Deep Work Units
              </div>
            </div>

            <div className="glass-card p-5 rounded-card relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-tertiary/30 to-transparent"></div>
              <div className="text-xs uppercase tracking-wider text-custom-text-muted font-medium mb-1">Avg Cognitive Load</div>
              <div className="kpi-text text-tertiary">{avgLoad} <span className="text-sm font-normal text-custom-text-muted">/ 5.0</span></div>
              <div className="text-xs text-custom-text-muted mt-2 flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-tertiary" />
                <span>Mental Energy Optimal</span>
              </div>
            </div>

            <div className="glass-card p-5 rounded-card relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-signal-active/30 to-transparent"></div>
              <div className="text-xs uppercase tracking-wider text-custom-text-muted font-medium mb-1">Context Link Rate</div>
              <div className="kpi-text text-signal-active">
                {filteredTasks.length > 0
                  ? `${Math.round((filteredTasks.filter(t => t.source?.externalReferenceId).length / filteredTasks.length) * 100)}%`
                  : '100%'}
              </div>
              <div className="text-xs text-custom-text-muted mt-2">
                GitHub / Calendar Traceable
              </div>
            </div>
          </div>

          {/* Control Bar: View Switcher, Search & Filters */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-custom-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-full bg-surface-container-lowest border border-custom-divider rounded-DEFAULT pl-9 pr-3.5 py-1.5 text-xs text-on-surface focus-glow outline-none transition-all"
                />
              </div>

              {/* Project Filter */}
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-surface-container-lowest border border-custom-divider rounded-DEFAULT px-3 py-1.5 text-xs text-on-surface outline-none"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              {/* Priority Filter */}
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-surface-container-lowest border border-custom-divider rounded-DEFAULT px-3 py-1.5 text-xs text-on-surface outline-none"
              >
                <option value="">All Priorities</option>
                {Object.values(Priority).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 self-end lg:self-auto">
              {/* View Switcher */}
              <div className="flex items-center bg-surface-container-lowest p-1 rounded-DEFAULT border border-custom-divider">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-sm transition-all ${
                    viewMode === 'kanban'
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-custom-text-muted hover:text-on-surface'
                  }`}
                >
                  <Kanban className="w-3.5 h-3.5" />
                  <span>Kanban</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-sm transition-all ${
                    viewMode === 'list'
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-custom-text-muted hover:text-on-surface'
                  }`}
                >
                  <ListIcon className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
              </div>

              {/* Create Task Button */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-custom-btn-primary hover:bg-brand-primary-hover text-custom-btn-text rounded-DEFAULT btn-shadow-glow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>New Task</span>
              </button>
            </div>
          </div>

          {/* Main Board / List */}
          {loading ? (
            <div className="py-16 text-center text-custom-text-muted text-sm animate-pulse">
              Loading contextual task board...
            </div>
          ) : viewMode === 'kanban' ? (
            <TaskKanbanBoard
              tasks={filteredTasks}
              projects={projects}
              onTransitionStatus={handleTransitionStatus}
              onDeleteTask={handleDeleteTask}
            />
          ) : (
            <TaskList
              tasks={filteredTasks}
              projects={projects}
              onTransitionStatus={handleTransitionStatus}
              onDeleteTask={handleDeleteTask}
            />
          )}
        </div>
      </main>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        projects={projects}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}
