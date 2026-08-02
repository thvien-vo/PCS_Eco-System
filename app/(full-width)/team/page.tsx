'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Palette, GraduationCap, Code2, BarChart3, Leaf } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { TeamMember } from '@/types';
import { MOTION_TOKENS } from '@/lib/motion-tokens';

// ---------------------------------------------------------------------------
// {/* TODO: replace with the team's real data */}
// ---------------------------------------------------------------------------
const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'advisor-01',
    name: 'GS. TS. Nguyễn Văn Minh', // TODO: replace with real advisor name
    role: 'advisor',
    title: 'Cố vấn học thuật',
    bio: 'Chuyên gia hàng đầu về hóa học polyme và kinh tế tuần hoàn tại Đại học Bách Khoa TP.HCM. Hơn 20 năm kinh nghiệm nghiên cứu về tái chế vật liệu nhựa.', // TODO: replace with real bio
    avatarUrl: 'https://picsum.photos/seed/advisor01/200/200', // TODO: replace with real photo
    isUiDesigner: false,
  },
  {
    id: 'member-01',
    name: 'Trần Thị Lan Anh', // TODO: replace with real name
    role: 'member',
    title: 'Trưởng nhóm · Kỹ thuật AI & Phân tích dữ liệu',
    bio: 'Phụ trách kiến trúc hệ thống và mô hình phân loại nhựa FTIR. Đam mê ứng dụng AI vào bài toán môi trường thực tế.', // TODO: replace with real bio
    avatarUrl: 'https://picsum.photos/seed/member01/200/200', // TODO: replace with real photo
    isUiDesigner: false,
  },
  {
    id: 'member-02',
    name: 'Lê Hoàng Phúc', // TODO: replace with real name
    role: 'member',
    title: 'UI/UX Design · Phát triển ứng dụng',
    bio: 'Thiết kế toàn bộ giao diện và trải nghiệm người dùng PCS Eco-System. Chuyên về design system, motion design và mobile-first interface.', // TODO: replace with real bio
    avatarUrl: 'https://picsum.photos/seed/member02/200/200', // TODO: replace with real photo
    isUiDesigner: true, // ← UI/App Design lead — highlighted with a badge
  },
  {
    id: 'member-03',
    name: 'Nguyễn Minh Quân', // TODO: replace with real name
    role: 'member',
    title: 'Kỹ thuật phần cứng · IoT Sensor',
    bio: 'Phát triển phần cứng trạm kiosk PCS và tích hợp cảm biến FTIR. Nghiên cứu giải pháp nhận diện nhựa chi phí thấp cho thị trường Việt Nam.', // TODO: replace with real bio
    avatarUrl: 'https://picsum.photos/seed/member03/200/200', // TODO: replace with real photo
    isUiDesigner: false,
  },
  {
    id: 'member-04',
    name: 'Phạm Thu Hằng', // TODO: replace with real name
    role: 'member',
    title: 'Chiến lược kinh doanh · Quan hệ đối tác',
    bio: 'Xây dựng mô hình kinh doanh B2B và phát triển quan hệ đối tác với các thương hiệu tài trợ. Nghiên cứu thị trường kinh tế tuần hoàn tại Đông Nam Á.', // TODO: replace with real bio
    avatarUrl: 'https://picsum.photos/seed/member04/200/200', // TODO: replace with real photo
    isUiDesigner: false,
  },
];

// ---------------------------------------------------------------------------
// Role icon mapping
// ---------------------------------------------------------------------------
const ROLE_ICONS: Record<string, React.ElementType> = {
  'advisor-01': GraduationCap,
  'member-01': BarChart3,
  'member-02': Palette,
  'member-03': Code2,
  'member-04': Leaf,
};

// ---------------------------------------------------------------------------
// Team Member Card (Instagram-bio style)
// ---------------------------------------------------------------------------
function TeamCard({ member, index }: { member: TeamMember; index: number }) {
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
          Cố vấn
        </div>
      )}

      {/* UI Designer badge */}
      {member.isUiDesigner && (
        <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-[10px] font-bold text-white shadow-md">
          <Palette className="h-2.5 w-2.5" />
          UI Design Lead
        </div>
      )}

      {/* Avatar */}
      <div className="flex flex-col items-center text-center">
        <div
          className={[
            'relative mb-4 overflow-hidden rounded-full',
            isAdvisor ? 'h-24 w-24 ring-4 ring-[var(--neon-mint)]/40' : 'h-20 w-20',
            member.isUiDesigner ? 'ring-4 ring-purple-400/40' : '',
          ].join(' ')}
        >
          {/* Gradient ring for advisor */}
          {isAdvisor && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--primary-emerald)] to-[var(--neon-mint)] p-0.5">
              <div className="h-full w-full rounded-full bg-card" />
            </div>
          )}
          <Image
            src={member.avatarUrl}
            alt={`Ảnh đại diện của ${member.name}`}
            width={isAdvisor ? 96 : 80}
            height={isAdvisor ? 96 : 80}
            className="relative z-10 rounded-full object-cover"
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
          aria-label={`LinkedIn của ${member.name}`}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          LinkedIn {/* TODO: add real LinkedIn URL */}
        </button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Team Profile Page
// ---------------------------------------------------------------------------
export default function TeamPage() {
  const advisor = TEAM_MEMBERS.find((m) => m.role === 'advisor')!;
  const members = TEAM_MEMBERS.filter((m) => m.role === 'member');

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
            Trang chủ
          </Link>
          <span className="text-border">|</span>
          <h1 className="text-sm font-semibold text-foreground">Đội ngũ PCS</h1>
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
          <h1 className="mb-3 text-4xl font-extrabold text-foreground">Đội ngũ PCS</h1>
          <p className="mx-auto max-w-lg text-base text-muted-foreground">
            Những con người đam mê, tận tâm xây dựng hệ sinh thái tái chế nhựa thông minh
            cho thế hệ tương lai.
          </p>
        </motion.div>

        {/* Advisor (1 card — full width on small, centered on large) */}
        <div className="mb-12">
          <h2 className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Cố vấn
          </h2>
          <div className="mx-auto max-w-sm">
            <TeamCard member={advisor} index={0} />
          </div>
        </div>

        {/* Members (4 cards) */}
        <div>
          <h2 className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Thành viên đội ngũ
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
            Quay lại trang chủ
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
