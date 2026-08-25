'use client';

import React, { useState } from 'react';
import { CreateProjectDto } from '@personal-os/types';
import { X, FolderPlus } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateProjectDto) => Promise<void>;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        deadline: deadline || undefined,
        tags: tags.length > 0 ? tags : undefined
      });

      setName('');
      setDescription('');
      setDeadline('');
      setTagsInput('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg p-6 rounded-card border border-custom-divider relative shadow-glass">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-custom-divider">
          <div className="flex items-center gap-2.5">
            <FolderPlus className="w-5 h-5 text-primary" />
            <h3 className="font-h4 text-on-surface font-medium">Create New Project</h3>
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
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AI Intelligence Engine"
              required
              className="w-full bg-surface-container-lowest border border-custom-divider rounded-DEFAULT px-3.5 py-2 text-sm text-on-surface focus-glow outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-custom-text-muted font-medium mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key deliverables and architecture focus..."
              rows={3}
              className="w-full bg-surface-container-lowest border border-custom-divider rounded-DEFAULT px-3.5 py-2 text-sm text-on-surface focus-glow outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-custom-text-muted font-medium mb-1.5">
                Target Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-surface-container-lowest border border-custom-divider rounded-DEFAULT px-3.5 py-2 text-sm text-on-surface focus-glow outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-custom-text-muted font-medium mb-1.5">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Core, AI, DB"
                className="w-full bg-surface-container-lowest border border-custom-divider rounded-DEFAULT px-3.5 py-2 text-sm text-on-surface focus-glow outline-none transition-all"
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
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
