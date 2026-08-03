'use client';

/**
 * Module 7 — Kiosk Simulation Page
 *
 * Renders the PCS Station kiosk entry point with context info and
 * the KioskModal trigger button.
 *
 * The Simulation Mode badge is also rendered persistently on the page
 * (separate from the badge inside the modal) so it is visible even
 * before the modal is opened.
 */

import { motion } from 'framer-motion';
import { Cpu, Leaf, Zap, BarChart3 } from 'lucide-react';
import { MOTION_TOKENS } from '@/lib/motion-tokens';
import { KioskModal } from '@/components/kiosk/kiosk-modal';

const STATS = [
  { label: 'Lượt tái chế hôm nay', value: '142', icon: '♻️' },
  { label: 'Điểm xanh đã trao', value: '3.550', icon: '🌿' },
  { label: 'Độ chính xác FTIR', value: '96.4%', icon: '🔬' },
];

export default function KioskPage() {
  return (
    <div className="flex min-h-full flex-col gap-4 p-4 pb-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold text-foreground">Trạm PCS</h1>
          <p className="text-xs text-muted-foreground">Kiosk Tái Chế Thông Minh · HCM-01</p>
        </div>
        {/* Simulation Mode badge — visible at all times on this page */}
        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--warning-amber)] bg-[var(--warning-amber)]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--warning-amber)]">
          <Zap className="h-2.5 w-2.5" />
          Mô phỏng
        </span>
      </div>

      {/* ── Hero stats ── */}
      <div className="grid grid-cols-3 gap-2">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: MOTION_TOKENS.durations.base,
              delay: i * 0.07,
              ease: MOTION_TOKENS.easing.enter,
            }}
            className="flex flex-col items-center gap-1 rounded-2xl bg-card p-3 text-center shadow-card"
          >
            <span className="text-xl">{stat.icon}</span>
            <span className="text-sm font-bold text-foreground">{stat.value}</span>
            <span className="text-[9px] leading-tight text-muted-foreground">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* ── Station info card ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: MOTION_TOKENS.durations.base,
          delay: 0.2,
          ease: MOTION_TOKENS.easing.enter,
        }}
        className="rounded-2xl bg-card p-4 shadow-card"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--primary-emerald)]/10">
            <Cpu className="h-5 w-5 text-[var(--primary-emerald)]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Công nghệ FTIR NIR
            </h2>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Cảm biến phổ hồng ngoại nhận diện loại nhựa (PET · PE · PP · PS · PVC)
              trong &lt;500ms. Độ chính xác &gt;96% trong điều kiện nhiệt độ 15–35°C.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── How it works ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: MOTION_TOKENS.durations.base,
          delay: 0.28,
          ease: MOTION_TOKENS.easing.enter,
        }}
        className="rounded-2xl bg-card p-4 shadow-card"
      >
        <h2 className="mb-3 text-sm font-semibold text-foreground">Quy trình 4 bước</h2>
        <div className="flex flex-col gap-2.5">
          {[
            { step: '1', label: 'Quét QR', desc: 'Xác thực phiên với mã token duy nhất' },
            { step: '2', label: 'Đặt vật phẩm', desc: 'Đưa nhựa vào khoang cảm biến' },
            { step: '3', label: 'Phân tích FTIR', desc: 'Nhận diện loại nhựa & độ tinh khiết' },
            { step: '4', label: 'Nhận điểm xanh', desc: 'Điểm tự động vào ví của bạn' },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--primary-emerald)]/15 text-xs font-bold text-[var(--primary-emerald)]">
                {s.step}
              </div>
              <div>
                <span className="text-xs font-semibold text-foreground">{s.label}</span>
                <span className="text-xs text-muted-foreground"> — {s.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Accepted plastics ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: MOTION_TOKENS.durations.base,
          delay: 0.35,
          ease: MOTION_TOKENS.easing.enter,
        }}
        className="rounded-2xl bg-card p-4 shadow-card"
      >
        <div className="mb-2 flex items-center gap-2">
          <Leaf className="h-4 w-4 text-[var(--primary-emerald)]" />
          <h2 className="text-sm font-semibold text-foreground">Loại nhựa được chấp nhận</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {['PET ♻️1', 'HDPE ♻️2', 'PP ♻️5', 'LDPE ♻️4', 'PS ♻️6'].map((label) => (
            <span
              key={label}
              className="rounded-lg bg-[var(--primary-emerald)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--primary-emerald)]"
            >
              {label}
            </span>
          ))}
          <span className="rounded-lg bg-[var(--error-rose)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--error-rose)]">
            PVC ⚠️ (hạn chế)
          </span>
        </div>
      </motion.div>

      {/* ── B2B note ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: MOTION_TOKENS.durations.base,
          delay: 0.42,
          ease: MOTION_TOKENS.easing.enter,
        }}
        className="rounded-2xl bg-gradient-to-br from-[var(--primary-emerald)]/5 to-cyan-400/5 border border-[var(--primary-emerald)]/20 p-4"
      >
        <div className="flex items-start gap-2">
          <BarChart3 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--primary-emerald)]" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Dữ liệu mỗi lần quét sẽ được tổng hợp vào báo cáo dòng nhựa tuần
            (Module 8 B2B Insight) — giúp Dow và các đối tác MRF tối ưu hoá
            nguồn nguyên liệu tái chế.
          </p>
        </div>
      </motion.div>

      {/* ── KioskModal — trigger button + full modal logic ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: MOTION_TOKENS.durations.base,
          delay: 0.48,
          ease: MOTION_TOKENS.easing.enter,
        }}
      >
        <KioskModal />
      </motion.div>
    </div>
  );
}
