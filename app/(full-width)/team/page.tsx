'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Palette, GraduationCap, Code2, BarChart3, Leaf, Settings } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { TeamMember } from '@/types';
import { MOTION_TOKENS } from '@/lib/motion-tokens';
import { useTranslation } from '@/hooks/use-translation';
import { useHasMounted } from '@/hooks/use-has-mounted';

const ROLE_ICONS: Record<string, React.ElementType> = {
  'advisor-01': GraduationCap,
  'member-01': BarChart3,
  'member-02': Palette,
  'member-03': Code2,
  'member-04': Leaf,
};

function TeamCard({ member, index }: { member: TeamMember; index: number }) {
  const { t } = useTranslation();
  const tTeam = t.team;
  const tCommon = t.common;
  const RoleIcon = ROLE_ICONS[member.id] ?? Code2;
  const isAdvisor = member.role === 'advisor';

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: MOTION_TOKENS.durations.slow,
        delay: index * 0.1,
        ease: MOTION_TOKENS.easing.enter,
      }}
      className={[
        'relative overflow-hidden rounded-3xl border bg-card p-6 shadow-card',
        'transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        isAdvisor
          ? 'border-[var(--neon-mint)]/40 bg-gradient-to-br from-card to-[var(--neon-mint)]/5'
          : 'border-border',
        member.isUiDesigner ? 'ring-2 ring-[var(--primary-emerald)]/30' : '',
      ].join(' ')}
    >
      {/* Advisor crown badge */}
      {isAdvisor && (
        <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-[var(--primary-emerald)] to-[var(--neon-mint)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-md">
          {tTeam.roles.advisor}
        </div>
      )}

      {/* UI Designer badge */}
      {member.isUiDesigner && (
        <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-[10px] font-bold text-white shadow-md">
          <Palette className="h-2.5 w-2.5" />
          {tTeam.roles.uiLead}
        </div>
      )}

      {/* Avatar */}
      <div className="flex flex-col items-center text-center">
        <div
          className={[
            'relative mb-4 rounded-full',
            isAdvisor ? 'h-24 w-24' : 'h-20 w-20',
          ].join(' ')}
        >
          {/* Mint Pop Story Ring for all members */}
          <div className="absolute inset-0 rounded-full bg-mint-pop p-[3px] shadow-sm">
            <div className="h-full w-full rounded-full bg-card" />
          </div>
          
          <Image
            src={member.avatarUrl}
            alt={tCommon.imageAlt.avatarOf.replace('{{name}}', member.name)}
            width={isAdvisor ? 96 : 80}
            height={isAdvisor ? 96 : 80}
            className="relative z-10 h-full w-full rounded-full object-cover p-1.5"
          />
        </div>

        {/* Name */}
        <h3 className={['font-bold text-foreground', isAdvisor ? 'text-lg' : 'text-base'].join(' ')}>
          {member.name}
        </h3>

        {/* Role icon + title */}
        <div className="mt-1 flex items-center gap-1.5">
          <RoleIcon className="h-3.5 w-3.5 text-emerald" />
          <span className="text-xs font-medium text-emerald">{member.title}</span>
        </div>

        {/* Bio */}
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{member.bio}</p>

        {/* LinkedIn placeholder */}
        <button
          className="mt-4 flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-[var(--primary-emerald)] hover:text-emerald"
          aria-label={tCommon.aria.linkedInOf.replace('{{name}}', member.name)}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          LinkedIn
        </button>
      </div>
    </motion.div>
  );
}

export default function TeamPage() {
  const { t } = useTranslation();
  const hasMounted = useHasMounted();
  const tTeam = t.team;
  const tCommon = t.common;

  // Define team members directly here so we can use translation hooks
  const TEAM_MEMBERS: TeamMember[] = [
    {
      id: 'advisor-01',
      name: 'GS. TS. Nguyễn Văn Minh',
      role: 'advisor',
      title: tTeam.bios.advisor01.title,
      bio: tTeam.bios.advisor01.bio,
      avatarUrl: 'https://picsum.photos/seed/advisor01/200/200',
      isUiDesigner: false,
    },
    {
      id: 'member-01',
      name: 'Trần Thị Lan Anh',
      role: 'member',
      title: tTeam.bios.member01.title,
      bio: tTeam.bios.member01.bio,
      avatarUrl: 'https://picsum.photos/seed/member01/200/200',
      isUiDesigner: false,
    },
    {
      id: 'member-02',
      name: 'Lê Hoàng Phúc',
      role: 'member',
      title: tTeam.bios.member02.title,
      bio: tTeam.bios.member02.bio,
      avatarUrl: 'https://picsum.photos/seed/member02/200/200',
      isUiDesigner: true,
    },
    {
      id: 'member-03',
      name: 'Nguyễn Minh Quân',
      role: 'member',
      title: tTeam.bios.member03.title,
      bio: tTeam.bios.member03.bio,
      avatarUrl: 'https://picsum.photos/seed/member03/200/200',
      isUiDesigner: false,
    },
    {
      id: 'member-04',
      name: 'Phạm Thu Hằng',
      role: 'member',
      title: tTeam.bios.member04.title,
      bio: tTeam.bios.member04.bio,
      avatarUrl: 'https://picsum.photos/seed/member04/200/200',
      isUiDesigner: false,
    },
  ];

  const advisor = TEAM_MEMBERS.find((m) => m.role === 'advisor')!;
  const members = TEAM_MEMBERS.filter((m) => m.role === 'member');

  // Prevent hydration mismatch for translated strings
  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="h-20 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {tCommon.navigation.home}
          </Link>
          <span className="text-border">|</span>
          <h1 className="flex-1 text-sm font-semibold text-foreground">{tTeam.header.title}</h1>
          {/* Settings entry point */}
          <Link
            href="/settings"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={tCommon.navigation.settings}
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: MOTION_TOKENS.durations.slow, ease: MOTION_TOKENS.easing.enter }}
          className="mb-16 text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald/10">
            <Leaf className="h-7 w-7 text-emerald" />
          </div>
          <h1 className="mb-3 text-4xl font-extrabold text-foreground">{tTeam.hero.title}</h1>
          <p className="mx-auto max-w-lg text-base text-muted-foreground">
            {tTeam.hero.desc}
          </p>
        </motion.div>

        {/* Advisor */}
        <div className="mb-12">
          <h2 className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {tTeam.sections.advisor}
          </h2>
          <div className="mx-auto max-w-sm">
            <TeamCard member={advisor} index={0} />
          </div>
        </div>

        {/* Members */}
        <div>
          <h2 className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {tTeam.sections.members}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {members.map((member, i) => (
              <TeamCard key={member.id} member={member} index={i + 1} />
            ))}
          </div>
        </div>

        {/* Call to action back */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-emerald px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-[var(--emerald-hover)]"
          >
            <ArrowLeft className="h-4 w-4" />
            {tCommon.navigation.backHome}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
