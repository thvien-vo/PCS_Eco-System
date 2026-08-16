'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Rss, Wallet, Trophy, Gift } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const tabs = [
    { name: t.common.navigation.map, href: '/map', icon: Map },
    { name: t.common.navigation.feed, href: '/feed', icon: Rss },
    { name: t.common.navigation.walletShort, href: '/wallet', icon: Wallet },
    { name: t.common.navigation.challenge, href: '/challenge', icon: Trophy },
    { name: t.common.navigation.marketplace, href: '/marketplace', icon: Gift },
  ];

  return (
    <nav
      className={cn(
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
            <span className="text-[10px] font-medium leading-none truncate max-w-[52px] text-center">
              {tab.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}