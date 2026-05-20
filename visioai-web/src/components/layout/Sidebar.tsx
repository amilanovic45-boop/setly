'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useAppStore } from '@/lib/store';
import { useBalance } from '@/lib/hooks';

const navItems = [
  { href: '/', label: 'Discover', icon: '◈' },
  { href: '/studio/image', label: 'Image Studio', icon: '🎨' },
  { href: '/studio/video', label: 'Video Studio', icon: '🎬' },
  { href: '/history', label: 'Library', icon: '⊞' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { balance, apiKey } = useAppStore();
  useBalance();

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-surface border-r border-border h-full">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet-700 flex items-center justify-center text-lg shadow-glow-sm">
            ✦
          </div>
          <span className="text-xl font-bold tracking-tight text-text-primary">VisioAI</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5',
              )}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Credits */}
      {apiKey && (
        <div className="px-3 py-4 border-t border-border">
          <div className="bg-card rounded-xl p-3 border border-border">
            <p className="text-xs text-text-muted uppercase tracking-widest mb-1 font-semibold">
              Credits
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-text-primary">
                {balance?.credits?.toLocaleString() ?? '—'}
              </span>
              <span className="text-xs text-text-muted">remaining</span>
            </div>
            <span className="inline-block mt-1.5 text-[10px] font-bold text-primary bg-primary/15 rounded-md px-2 py-0.5 uppercase tracking-widest">
              {balance?.plan ?? 'Free'}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
