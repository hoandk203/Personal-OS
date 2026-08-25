'use client';

import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus, CreateProjectDto } from '@personal-os/types';
import { api } from '../../services/apiClient';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { CreateProjectModal } from '../../components/projects/CreateProjectModal';
import { Plus, FolderKanban, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getProjects(filterStatus === 'ALL' ? undefined : (filterStatus as ProjectStatus));
      setProjects(data);
    } catch (e) {
      console.error('Failed to load projects', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filterStatus]);

  const handleCreateProject = async (dto: CreateProjectDto) => {
    await api.createProject(dto);
    fetchProjects();
  };

  const handleRecalculateHealth = async (id: string) => {
    await api.calculateProjectHealth(id);
    fetchProjects();
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await api.deleteProject(id);
      fetchProjects();
    }
  };

  // KPIs
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === ProjectStatus.ACTIVE).length;
  const avgHealth = projects.length > 0
    ? Math.round(projects.reduce((acc, p) => acc + (p.health?.overallScore || 50), 0) / projects.length)
    : 0;

  return (
    <div className="flex h-screen w-full ambient-canvas text-on-surface overflow-hidden relative">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-y-auto z-10">
        <Header
          title="Projects & Health Metrics"
          subtitle="Multi-Project Lifecycle & Risk Telemetry"
          onSyncComplete={fetchProjects}
        />

        <div className="p-8 space-y-6 max-w-[1728px] mx-auto w-full">
          {/* Top KPI Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="glass-card p-5 rounded-card relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
              <div className="text-xs uppercase tracking-wider text-custom-text-muted font-medium mb-1">Active Projects</div>
              <div className="kpi-text text-primary">{activeProjects} / {totalProjects}</div>
              <div className="text-xs text-signal-positive mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-signal-positive shadow-[0_0_6px_rgba(80,216,233,0.8)]"></span>
                Operational Layer Monitored
              </div>
            </div>

            <div className="glass-card p-5 rounded-card relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent"></div>
              <div className="text-xs uppercase tracking-wider text-custom-text-muted font-medium mb-1">Average Health Index</div>
              <div className="kpi-text text-secondary">{avgHealth} <span className="text-sm font-normal text-custom-text-muted">/100</span></div>
              <div className="text-xs text-signal-positive mt-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                <span>Deterministic Health Model</span>
              </div>
            </div>

            <div className="glass-card p-5 rounded-card relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-tertiary/30 to-transparent"></div>
              <div className="text-xs uppercase tracking-wider text-custom-text-muted font-medium mb-1">Schedule & Blocker Risk</div>
              <div className="kpi-text text-tertiary">Low</div>
              <div className="text-xs text-custom-text-muted mt-2">
                Real-time bottleneck PR & overdue alerts active
              </div>
            </div>
          </div>

          {/* Action Bar & Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-DEFAULT border border-custom-divider">
              {['ALL', 'ACTIVE', 'PAUSED', 'COMPLETED'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterStatus(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all ${
                    filterStatus === tab
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-custom-text-muted hover:text-on-surface'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-custom-btn-primary hover:bg-brand-primary-hover text-custom-btn-text rounded-DEFAULT btn-shadow-glow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="py-16 text-center text-custom-text-muted text-sm animate-pulse">
              Loading projects & health telemetry...
            </div>
          ) : projects.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-card border border-custom-divider space-y-3">
              <FolderKanban className="w-10 h-10 text-custom-text-muted mx-auto" />
              <h4 className="font-h4 text-on-surface">No Projects Found</h4>
              <p className="text-xs text-custom-text-muted max-w-sm mx-auto">
                Create a project to start tracking tasks, health metrics, and schedule risks.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-2 px-4 py-2 text-xs bg-custom-btn-primary text-custom-btn-text rounded-DEFAULT"
              >
                Create First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onRecalculateHealth={handleRecalculateHealth}
                  onDeleteProject={handleDeleteProject}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
