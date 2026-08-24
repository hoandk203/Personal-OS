import React from 'react';

export default function DashboardPage() {
  return (
    <div className="flex h-screen w-full ambient-canvas text-on-surface overflow-hidden relative">
      {/* Background ambient lighting orbs */}
      <div className="absolute top-[-10%] right-[15%] w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[450px] h-[450px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      {/* Glass Sidebar */}
      <aside className="w-64 glass-sidebar flex flex-col justify-between p-5 z-20">
        <div>
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-4 h-4 bg-gradient-to-tr from-brand-primary to-secondary rounded-sm shadow-[0_0_12px_rgba(94,107,255,0.6)]"></div>
            <h1 className="font-h3 text-h4 font-medium tracking-tight text-on-surface">Personal OS</h1>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <a
              href="#"
              className="flex items-center gap-3 px-3.5 py-2.5 text-sm bg-white/[0.08] text-primary rounded-DEFAULT font-medium border border-white/[0.1] backdrop-blur-md shadow-[0_0_15px_rgba(94,107,255,0.15)] transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-signal-active shadow-[0_0_8px_rgba(34,197,94,0.7)]"></span>
              Today
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-custom-text-muted hover:bg-white/[0.04] hover:text-on-surface rounded-DEFAULT border border-transparent hover:border-white/[0.04] transition-all"
            >
              Tasks
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-custom-text-muted hover:bg-white/[0.04] hover:text-on-surface rounded-DEFAULT border border-transparent hover:border-white/[0.04] transition-all"
            >
              Projects
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-custom-text-muted hover:bg-white/[0.04] hover:text-on-surface rounded-DEFAULT border border-transparent hover:border-white/[0.04] transition-all"
            >
              Decisions
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-custom-text-muted hover:bg-white/[0.04] hover:text-on-surface rounded-DEFAULT border border-transparent hover:border-white/[0.04] transition-all"
            >
              Memory & Knowledge
            </a>
          </nav>
        </div>

        {/* Footer Meta */}
        <div className="pt-4 border-t border-white/[0.06] px-2">
          <div className="text-xs text-custom-text-muted flex items-center justify-between">
            <span className="font-mono-data">Clean Architecture</span>
            <span className="px-2 py-0.5 glass-pill rounded-sm text-signal-positive font-mono text-[11px]">
              v0.1.0
            </span>
          </div>
        </div>
      </aside>

      {/* Main Command Center */}
      <main className="flex-1 flex flex-col overflow-y-auto z-10">
        {/* Glass Header */}
        <header className="h-16 glass-header px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h2 className="font-h3 text-h3 text-on-surface tracking-tight">Command Center</h2>
            <span className="px-3 py-1 text-xs font-mono-data glass-pill text-secondary rounded-DEFAULT">
              Precision Operational Layer
            </span>
          </div>
          <div className="flex items-center gap-3 px-3 py-1.5 glass-pill rounded-DEFAULT">
            <span className="w-2 h-2 rounded-full bg-signal-active shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
            <span className="text-xs text-custom-text-muted font-medium">System Live</span>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-8 space-y-6 max-w-[1728px] mx-auto w-full">
          {/* Top KPI Row with Glass Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* KPI 1 */}
            <div className="glass-card p-5 rounded-card relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
              <div className="text-xs uppercase tracking-wider text-custom-text-muted font-medium mb-1">Focus Tasks</div>
              <div className="kpi-text text-primary">3 / 3</div>
              <div className="text-xs text-signal-positive mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-signal-positive shadow-[0_0_6px_rgba(80,216,233,0.8)]"></span>
                On track for today
              </div>
            </div>

            {/* KPI 2 */}
            <div className="glass-card p-5 rounded-card relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-tertiary/30 to-transparent"></div>
              <div className="text-xs uppercase tracking-wider text-custom-text-muted font-medium mb-1">Cognitive Load</div>
              <div className="kpi-text text-tertiary">Optimal (2.4)</div>
              <div className="text-xs text-custom-text-muted mt-2">Max limit: 4.0</div>
            </div>

            {/* KPI 3 */}
            <div className="glass-card p-5 rounded-card relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent"></div>
              <div className="text-xs uppercase tracking-wider text-custom-text-muted font-medium mb-1">Active Projects</div>
              <div className="kpi-text text-secondary">4</div>
              <div className="text-xs text-signal-positive mt-2">Health: 88% average</div>
            </div>

            {/* KPI 4 */}
            <div className="glass-card p-5 rounded-card relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              <div className="text-xs uppercase tracking-wider text-custom-text-muted font-medium mb-1">Audit Events</div>
              <div className="kpi-text text-on-surface">128</div>
              <div className="text-xs text-custom-text-muted mt-2">100% verified immutable</div>
            </div>
          </div>

          {/* Core Daily Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: High Priority Focus */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card rounded-card p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-primary/40 to-transparent"></div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-h3 text-h4 text-on-surface">Today&apos;s High Priority Focus</h3>
                  <span className="text-xs text-custom-text-muted font-mono-data">2 Active Items</span>
                </div>

                <div className="space-y-3">
                  {/* Task Item 1 */}
                  <div className="p-4 glass-card-nested rounded-DEFAULT flex items-center justify-between group">
                    <div>
                      <div className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
                        Review Architecture Data Contracts & Domain Ports
                      </div>
                      <div className="text-xs text-custom-text-muted mt-1 flex items-center gap-2">
                        <span>Project: <strong className="text-on-surface-variant font-normal">Personal OS Core</strong></span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded-sm bg-tertiary/10 text-tertiary text-[11px] font-mono">
                          Cognitive Load: 4
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs bg-primary-container/80 text-on-primary-container rounded-DEFAULT font-medium border border-primary/20 shadow-[0_0_10px_rgba(94,107,255,0.2)]">
                      IN PROGRESS
                    </span>
                  </div>

                  {/* Task Item 2 */}
                  <div className="p-4 glass-card-nested rounded-DEFAULT flex items-center justify-between group">
                    <div>
                      <div className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
                        Execute Phase 0 Automated Tests & Invariant Verification
                      </div>
                      <div className="text-xs text-custom-text-muted mt-1 flex items-center gap-2">
                        <span>Project: <strong className="text-on-surface-variant font-normal">Quality & Harness</strong></span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded-sm bg-secondary/10 text-secondary text-[11px] font-mono">
                          Cognitive Load: 3
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs glass-pill text-custom-text-muted rounded-DEFAULT font-medium">
                      PLANNED
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: AI Daily Insight Card */}
            <div className="space-y-6">
              <div className="glass-ai-panel rounded-card p-6 relative overflow-hidden">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_10px_rgba(80,216,233,0.9)] animate-pulse"></span>
                  <h3 className="font-h3 text-h4 text-on-surface">AI Daily Insight</h3>
                </div>

                <p className="text-sm text-on-surface-variant leading-relaxed mb-5">
                  Schedule is clear between <span className="text-secondary font-medium">14:00 - 17:30</span>. Recommend reserving this 3.5-hour block for deep work implementation of Phase 1 Connectors.
                </p>

                <div className="p-3.5 glass-card-nested rounded-DEFAULT text-xs text-custom-text-muted space-y-1.5 mb-5 border border-white/[0.07]">
                  <div className="flex justify-between">
                    <span>Evidence:</span>
                    <strong className="text-on-surface-variant font-normal">0 overlapping calendar meetings</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Confidence:</span>
                    <strong className="text-signal-positive font-mono">94%</strong>
                  </div>
                </div>

                <button className="w-full py-2.5 btn-glow text-custom-btn-text text-sm font-medium rounded-button cursor-pointer">
                  Accept Recommendation
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
