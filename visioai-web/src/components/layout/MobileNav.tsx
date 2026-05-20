'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const items = [
  { href: '/', label: 'Discover', icon: '◈' },
  { href: '/studio/image', label: 'Image', icon: '🎨' },
  { href: '/studio/video', label: 'Video', icon: '🎬' },
  { href: '/history', label: 'Library', icon: '⊞' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border flex">
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors',
              active ? 'text-primary' : 'text-text-muted',
            )}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
