import React, { useState } from 'react';
import { RefreshCw, GitBranch, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../../services/apiClient';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onSyncComplete?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onSyncComplete }) => {
  const [syncingGh, setSyncingGh] = useState(false);
  const [syncingCal, setSyncingCal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSyncGitHub = async () => {
    try {
      setSyncingGh(true);
      const res = await api.syncGitHub();
      setToastMessage(`GitHub Synced: ${res.itemsSynced} items processed.`);
      if (onSyncComplete) onSyncComplete();
    } catch (e: any) {
      setToastMessage(`Sync failed: ${e.message}`);
    } finally {
      setSyncingGh(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleSyncCalendar = async () => {
    try {
      setSyncingCal(true);
      const res = await api.syncCalendar();
      setToastMessage(`Calendar Synced: ${res.itemsSynced} meetings scheduled.`);
      if (onSyncComplete) onSyncComplete();
    } catch (e: any) {
      setToastMessage(`Sync failed: ${e.message}`);
    } finally {
      setSyncingCal(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="h-16 glass-header px-8 flex items-center justify-between sticky top-0 z-30 border-b border-custom-divider">
      <div className="flex items-center gap-4">
        <h2 className="font-h3 text-h3 text-on-surface tracking-tight">{title}</h2>
        {subtitle && (
          <span className="px-3 py-1 text-xs font-mono-data glass-pill text-secondary rounded-DEFAULT hidden md:inline-block">
            {subtitle}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Toast alert */}
        {toastMessage && (
          <div className="flex items-center gap-2 px-3 py-1 bg-primary-container/20 border border-primary/40 rounded-DEFAULT text-xs text-primary animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Sync Controls */}
        <div className="flex items-center gap-2 bg-custom-card-bg p-1 rounded-DEFAULT border border-custom-divider">
          <button
            onClick={handleSyncGitHub}
            disabled={syncingGh}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-custom-text-muted hover:text-on-surface hover:bg-white/[0.06] rounded-sm transition-all disabled:opacity-50"
            title="Sync GitHub Commits & PRs"
          >
            <GitBranch className={`w-3.5 h-3.5 ${syncingGh ? 'animate-spin text-primary' : ''}`} />
            <span className="hidden sm:inline">GitHub</span>
          </button>
          <button
            onClick={handleSyncCalendar}
            disabled={syncingCal}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-custom-text-muted hover:text-on-surface hover:bg-white/[0.06] rounded-sm transition-all disabled:opacity-50"
            title="Sync Google Calendar & Meetings"
          >
            <Calendar className={`w-3.5 h-3.5 ${syncingCal ? 'animate-spin text-secondary' : ''}`} />
            <span className="hidden sm:inline">Calendar</span>
          </button>
        </div>

        {/* Date & System Status */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono-data text-custom-text-muted">
          <span>{todayFormatted}</span>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1.5 glass-pill rounded-DEFAULT">
          <span className="w-2 h-2 rounded-full bg-signal-active shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
          <span className="text-xs text-custom-text-muted font-medium">System Ready</span>
        </div>
      </div>
    </header>
  );
};
