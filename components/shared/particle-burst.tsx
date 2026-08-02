'use client';

/**
 * ParticleBurst — shared visual feedback component.
 *
 * STRICT USAGE RULE (per pcs-design-system §8):
 * This component is ONLY allowed in 3 spots:
 *   1. Module 7 Kiosk: upon PASS result
 *   2. Module 3 Green Feed: upon "Lưu mã" (Save Code) on a sponsor voucher
 *   3. Module 6 Marketplace: upon successful voucher redemption
 *
 * Particles unmount cleanly via AnimatePresence exit animations,
 * preventing DOM bloat when triggered multiple times.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOTION_TOKENS } from '@/lib/motion-tokens';

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
}

interface ParticleBurstProps {
  /** Flip to true to fire the burst. Reset to false to allow re-triggering. */
  trigger: boolean;
  /** Viewport-relative position (px) where the burst originates */
  originPosition: { x: number; y: number };
  /** Called once all particles have fully animated out */
  onComplete?: () => void;
  /** CSS color string — defaults to neon mint accent */
  color?: string;
}

const PARTICLE_COUNT = 16;
const BURST_DURATION = 0.7; // seconds

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    angle: (i * 360) / PARTICLE_COUNT + (Math.random() - 0.5) * 15,
    distance: 60 + Math.random() * 60,
    size: 4 + Math.random() * 6,
  }));
}

export function ParticleBurst({
  trigger,
  originPosition,
  onComplete,
  color = 'var(--neon-mint)',
}: ParticleBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!trigger) return;

    // Mount particles immediately when triggered
    setParticles(generateParticles());

    // After animation duration, clear particles (triggers AnimatePresence exit)
    // and fire onComplete callback
    const timer = window.setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, BURST_DURATION * 1000 + 100); // +100ms buffer for exit animation

    return () => {
      window.clearTimeout(timer);
    };
  }, [trigger, onComplete]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[200] overflow-hidden"
    >
      <AnimatePresence>
        {particles.map((p) => {
          const rad = (p.angle * Math.PI) / 180;
          const tx = Math.cos(rad) * p.distance;
          const ty = Math.sin(rad) * p.distance;

          return (
            <motion.span
              key={p.id}
              className="absolute rounded-full"
              style={{
                backgroundColor: color,
                width: p.size,
                height: p.size,
                left: originPosition.x - p.size / 2,
                top: originPosition.y - p.size / 2,
                boxShadow: `0 0 ${p.size * 1.5}px ${color}`,
              }}
              initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              animate={{
                x: tx,
                y: ty,
                scale: 0,
                opacity: 0,
                transition: {
                  duration: BURST_DURATION,
                  ease: MOTION_TOKENS.easing.standard as [number, number, number, number],
                },
              }}
              exit={{ opacity: 0, scale: 0 }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
