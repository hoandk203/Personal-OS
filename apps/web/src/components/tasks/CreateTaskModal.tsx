'use client';

import React, { useState } from 'react';
import { CreateTaskDto, Priority, SourceType, Project } from '@personal-os/types';
import { X, PlusCircle } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  projects: Project[];
  onClose: () => void;
  onSubmit: (dto: CreateTaskDto) => Promise<void>;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  projects,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [cognitiveLoad, setCognitiveLoad] = useState<number>(3);
  const [dueAt, setDueAt] = useState('');
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState<number>(60);
  const [sourceType, setSourceType] = useState<SourceType>(SourceType.MANUAL);
  const [externalReferenceId, setExternalReferenceId] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        projectId: projectId || undefined,
        priority,
        cognitiveLoad,
        dueAt: dueAt || undefined,
        estimatedDurationMinutes: Number(estimatedDurationMinutes) || undefined,
        source: sourceType !== SourceType.MANUAL ? {
          type: sourceType,
          externalReferenceId: externalReferenceId || undefined,
          externalUrl: externalUrl || undefined
        } : undefined
      });

      // Reset
      setTitle('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg p-6 rounded-card border border-custom-divider relative shadow-glass max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-custom-divider">
          <div className="flex items-center gap-2.5">
            <PlusCircle className="w-5 h-5 text-primary" />
            <h3 className="font-h4 text-on-surface font-medium">Create Contextual Task</h3>
          </div>
          <button
            onClick={onClose}
            className="text-custom-text-muted hover:text-on-surface p-1 rounded-DEFAULT transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-error-container/20 border border-error/30 rounded-DEFAULT text-xs text-error">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-custom-text-muted font-medium mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement Architecture Reviewer Guard"
              required
              className="w-full bg-surface-container-lowest border border-custom-divider rounded-DEFAULT px-3.5 py-2 text-sm text-on-surface focus-glow outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-custom-text-muted font-medium mb-1.5">
              Description / Action Items
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Context, requirements, and acceptance criteria..."
              rows={2}
              className="w-full bg-surface-container-lowest border border-custom-divider rounded-DEFAULT px-3.5 py-2 text-sm text-on-surface focus-glow outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-custom-text-muted font-medium mb-1.5">
                Assign to Project
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-surface-container-lowest border border-custom-divider rounded-DEFAULT px-3.5 py-2 text-sm text-on-surface focus-glow outline-none transition-all"
              >
                <option value="">No Project (Standalone)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-custom-text-muted font-medium mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-surface-container-lowest border border-custom-divider rounded-DEFAULT px-3.5 py-2 text-sm text-on-surface focus-glow outline-none transition-all"
              >
                {Object.values(Priority).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cognitive Load Slider */}
          <div className="p-3 bg-surface-container-low rounded-DEFAULT border border-custom-divider-light space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="uppercase tracking-wider text-custom-text-muted font-medium">Cognitive Load (1 - 5)</span>
              <span className="font-mono text-primary font-medium">Level {cognitiveLoad}</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={cognitiveLoad}
              onChange={(e) => setCognitiveLoad(Number(e.target.value))}
              className="w-full accent-brand-primary"
            />
            <div className="flex justify-between text-[10px] text-custom-text-muted">
              <span>L1: Light</span>
              <span>L2: Normal</span>
              <span>L3: Focused</span>
              <span>L4: Heavy</span>
              <span>L5: Max Deep Work</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-custom-text-muted font-medium mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="w-full bg-surface-container-lowest border border-custom-divider rounded-DEFAULT px-3.5 py-2 text-sm text-on-surface focus-glow outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-custom-text-muted font-medium mb-1.5">
                Estimated Duration (mins)
              </label>
              <input
                type="number"
                value={estimatedDurationMinutes}
                onChange={(e) => setEstimatedDurationMinutes(Number(e.target.value))}
                className="w-full bg-surface-container-lowest border border-custom-divider rounded-DEFAULT px-3.5 py-2 text-sm text-on-surface focus-glow outline-none transition-all"
              />
            </div>
          </div>

          {/* Context Linking */}
          <div className="p-3 bg-surface-container-low rounded-DEFAULT border border-custom-divider-light space-y-3">
            <span className="block text-xs uppercase tracking-wider text-custom-text-muted font-medium">
              Context Linking (GitHub / Calendar / Email)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as SourceType)}
                className="bg-surface-container-lowest border border-custom-divider rounded-DEFAULT px-2 py-1.5 text-xs text-on-surface outline-none"
              >
                <option value={SourceType.MANUAL}>Manual</option>
                <option value={SourceType.GITHUB}>GitHub</option>
                <option value={SourceType.GOOGLE_CALENDAR}>Google Calendar</option>
                <option value={SourceType.GMAIL}>Gmail</option>
              </select>

              <input
                type="text"
                value={externalReferenceId}
                onChange={(e) => setExternalReferenceId(e.target.value)}
                placeholder="Reference (e.g. PR #101)"
                className="bg-surface-container-lowest border border-custom-divider rounded-DEFAULT px-2 py-1.5 text-xs text-on-surface outline-none"
              />

              <input
                type="text"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="URL link"
                className="bg-surface-container-lowest border border-custom-divider rounded-DEFAULT px-2 py-1.5 text-xs text-on-surface outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-custom-divider">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-custom-text-muted hover:text-on-surface rounded-DEFAULT transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-medium bg-custom-btn-primary hover:bg-brand-primary-hover text-custom-btn-text rounded-DEFAULT btn-shadow-glow transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
