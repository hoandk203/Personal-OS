'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, FolderKanban, Scale, BrainCircuit } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Today (Command Center)', icon: LayoutDashboard },
    { href: '/tasks', label: 'Tasks & Kanban', icon: CheckSquare },
    { href: '/projects', label: 'Projects & Health', icon: FolderKanban },
    { href: '/decisions', label: 'Decisions Journal', icon: Scale },
    { href: '/memory', label: 'Memory & Knowledge', icon: BrainCircuit }
  ];

  return (
    <aside className="w-64 glass-sidebar flex flex-col justify-between p-5 z-20 h-screen sticky top-0 shrink-0 border-r border-custom-divider">
      <div>
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-3 mb-8 px-2 group">
          <div className="w-5 h-5 bg-gradient-to-tr from-brand-primary to-secondary rounded-sm shadow-[0_0_14px_rgba(94,107,255,0.7)] transition-transform group-hover:scale-110"></div>
          <div>
            <h1 className="font-h4 font-medium tracking-tight text-on-surface leading-none">Personal OS</h1>
            <span className="text-[10px] uppercase font-mono tracking-widest text-custom-text-muted">Command Interface</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-sm rounded-DEFAULT font-medium transition-all ${
                  isActive
                    ? 'bg-white/[0.08] text-primary border border-white/[0.1] backdrop-blur-md shadow-[0_0_15px_rgba(94,107,255,0.15)] font-medium'
                    : 'text-custom-text-muted hover:bg-white/[0.04] hover:text-on-surface border border-transparent hover:border-white/[0.04]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-custom-text-muted'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-signal-positive shadow-[0_0_6px_rgba(80,216,233,0.8)]"></span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Meta */}
      <div className="pt-4 border-t border-white/[0.06] px-2 space-y-2">
        <div className="flex items-center justify-between text-xs text-custom-text-muted">
          <span className="font-mono-data">Phase 1</span>
          <span className="px-2 py-0.5 glass-pill rounded-sm text-signal-positive font-mono text-[11px]">
            Productivity Core
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-custom-text-muted">
          <span className="w-2 h-2 rounded-full bg-signal-active shadow-[0_0_6px_rgba(34,197,94,0.7)] animate-pulse"></span>
          <span>System Live & Deterministic</span>
        </div>
      </div>
    </aside>
  );
};
