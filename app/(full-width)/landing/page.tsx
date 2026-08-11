'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Leaf, MapPin, Users, Recycle, ChevronRight, Star, ArrowDown } from 'lucide-react';
import { MOTION_TOKENS } from '@/lib/motion-tokens';

// ---------------------------------------------------------------------------
// Animated stat counter
// ---------------------------------------------------------------------------
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    const duration = 1800;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString('vi-VN')}
      {suffix}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Stats data
// ---------------------------------------------------------------------------
const OVERVIEW_STATS = [
  {
    icon: Recycle,
    label: 'Tổng nhựa tái chế',
    value: 12840,
    suffix: ' kg',
    color: 'text-emerald',
    bg: 'bg-emerald/10',
  },
  {
    icon: MapPin,
    label: 'Trạm hoạt động',
    value: 47,
    suffix: ' trạm',
    color: 'text-mint',
    bg: 'bg-mint/10',
  },
  {
    icon: Users,
    label: 'Người dùng tích cực',
    value: 3210,
    suffix: '+',
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
];

// ---------------------------------------------------------------------------
// Feature highlights
// ---------------------------------------------------------------------------
const FEATURES = [
  {
    icon: '🗺️',
    title: 'Bản đồ trạm thông minh',
    desc: 'Tìm trạm PCS gần nhất với trạng thái thời gian thực.',
  },
  {
    icon: '🪙',
    title: 'Ví Điểm Xanh',
    desc: 'Tích điểm mỗi lần tái chế, đổi quà từ thương hiệu đối tác.',
  },
  {
    icon: '🏆',
    title: 'Thử thách & Bảng xếp hạng',
    desc: 'Cạnh tranh lành mạnh, cùng nhau bảo vệ hành tinh.',
  },
  {
    icon: '📊',
    title: 'Báo cáo CO₂ cá nhân',
    desc: 'Theo dõi lượng khí thải bạn đã giảm thiểu thực sự.',
  },
];

// ---------------------------------------------------------------------------
// Landing Page Component
// ---------------------------------------------------------------------------
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-mint-pop" />
        {/* Decorative circles */}
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-[var(--neon-mint)]/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-24 text-white lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: MOTION_TOKENS.durations.slow, ease: MOTION_TOKENS.easing.enter }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              Dow Circular Economy Innovation Challenge 2026
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: MOTION_TOKENS.durations.slow,
              ease: MOTION_TOKENS.easing.enter,
              delay: 0.1,
            }}
            className="mb-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight lg:text-6xl"
          >
            Hệ sinh thái số cho{' '}
            <span className="inline-block bg-gradient-to-r from-[#6ee7b7] to-[#34d399] bg-clip-text text-transparent">
              kinh tế tuần hoàn nhựa
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: MOTION_TOKENS.durations.slow,
              ease: MOTION_TOKENS.easing.enter,
              delay: 0.2,
            }}
            className="mb-10 max-w-xl text-lg text-white/80 leading-relaxed"
          >
            PCS kết nối người dùng với trạm thu gom nhựa thông minh, thưởng điểm xanh và
            cung cấp dữ liệu giá trị cho doanh nghiệp — tất cả trong một ứng dụng.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: MOTION_TOKENS.durations.base,
              ease: MOTION_TOKENS.easing.enter,
              delay: 0.35,
            }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href="/map"
              className="group flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[var(--primary-emerald)] shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
            >
              <MapPin className="h-4 w-4" />
              Tìm trạm gần đây
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/team"
              className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20"
            >
              <Users className="h-4 w-4" />
              Đội ngũ chúng tôi
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <ArrowDown className="h-5 w-5 animate-bounce text-white/40" />
          </motion.div>
        </div>
      </section>

      {/* ── OVERVIEW STATS ── */}
      <section className="bg-card py-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: MOTION_TOKENS.durations.slow }}
            className="mb-12 text-center"
          >
            <h2 className="mb-3 text-3xl font-bold text-foreground">
              Tác động thực tế
            </h2>
            <p className="text-muted-foreground">
              Cùng nhau, chúng ta đang tạo ra sự khác biệt thực sự cho hành tinh
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {OVERVIEW_STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: MOTION_TOKENS.durations.slow,
                    delay: i * 0.12,
                  }}
                  className="group rounded-2xl border border-border bg-background p-8 text-center shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div
                    className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${stat.bg}`}
                  >
                    <Icon className={`h-7 w-7 ${stat.color}`} />
                  </div>
                  <div className={`mb-1 text-4xl font-extrabold ${stat.color}`}>
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: MOTION_TOKENS.durations.slow }}
            className="mb-12 text-center"
          >
            <h2 className="mb-3 text-3xl font-bold text-foreground">Tính năng nổi bật</h2>
            <p className="text-muted-foreground">
              Từ trạm kiosk đến mạng xã hội — mọi thứ bạn cần để tái chế hiệu quả
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, scale: 0.94 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: MOTION_TOKENS.durations.slow,
                  delay: i * 0.08,
                }}
                className="rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-[var(--neon-mint)]/50 hover:shadow-lg"
              >
                <span className="mb-4 block text-4xl">{f.icon}</span>
                <h3 className="mb-2 font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-mint-pop" />
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/green-bg/1200/400')] bg-cover bg-center opacity-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: MOTION_TOKENS.durations.slow }}
          className="relative mx-auto max-w-4xl px-6 text-center text-white"
        >
          <Leaf className="mx-auto mb-4 h-10 w-10 opacity-80" />
          <h2 className="mb-4 text-3xl font-extrabold lg:text-4xl">
            Bắt đầu hành trình xanh ngay hôm nay
          </h2>
          <p className="mb-8 text-lg text-white/80">
            Mỗi chai nhựa bạn tái chế là một bước nhỏ tạo ra sự thay đổi lớn cho thế hệ tương lai.
          </p>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-[var(--primary-emerald)] shadow-xl transition-all duration-200 hover:scale-105 hover:shadow-2xl"
          >
            <MapPin className="h-5 w-5" />
            Tìm trạm PCS gần bạn
          </Link>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Recycle className="h-5 w-5 text-emerald" />
            <span className="font-semibold text-foreground">PCS Eco-System</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 Plastic Circularity Station · Dow Circular Economy Innovation Challenge
          </p>
          {/* Subtle B2B entry point — intentionally low-profile, for live pitch navigation */}
          <div className="mt-4 flex items-center justify-center">
            <Link
              href="/b2b-insight"
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronRight className="h-3 w-3" />
              Xem góc nhìn B2B
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
