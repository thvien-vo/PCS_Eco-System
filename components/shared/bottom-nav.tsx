'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Rss, Wallet, Trophy, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * BottomNav — Module 2–6 navigation only.
 * Module 1 (Landing/Team) is a full-width route, NOT in this nav.
 * Per pcs-design-system §5 and §9.
 */
const tabs = [
  { name: 'Bản đồ', href: '/map', icon: Map },
  { name: 'Cộng đồng', href: '/feed', icon: Rss },
  { name: 'Ví Xanh', href: '/wallet', icon: Wallet },
  { name: 'Thử thách', href: '/challenge', icon: Trophy },
  { name: 'Đổi quà', href: '/marketplace', icon: Gift },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        // Bug fix: was `fixed` — caused nav to escape to the viewport on desktop.
        // Now `absolute` so it's positioned relative to the phone-frame's inner div,
        // which establishes a CSS containing block via translateZ(0).
        // On mobile (full-screen h-screen), absolute bottom-0 = same as fixed bottom-0.
        'absolute bottom-0 z-50 h-[72px] w-full',
        'flex items-center justify-around px-2 pb-safe',
        'border-t border-border bg-card/95 backdrop-blur-sm',
        'sm:w-[374px] sm:rounded-b-[32px]'
      )}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex h-full min-h-[44px] w-14 flex-col items-center justify-center gap-1 transition-colors duration-150',
              isActive
                ? 'text-[var(--primary-emerald)]'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon
              className="h-6 w-6"
              strokeWidth={isActive ? 2.5 : 2}
              aria-hidden="true"
            />
            <span className="text-[10px] font-medium leading-none">{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}