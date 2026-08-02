/**
 * PCS Motion Tokens — single source of truth for all animation constants.
 *
 * Every animated component MUST import from here.
 * Never define raw numbers inside a component.
 *
 * Per pcs-tech-standards §4.
 */

export const MOTION_TOKENS = {
  /** Duration values in seconds (Framer Motion convention) */
  durations: {
    fast: 0.15, // Micro-interactions: button presses, icon transitions
    base: 0.25, // Standard transitions: page fades, card reveals
    slow: 0.4, // Modals, overlays, full-screen animations
    verySlow: 0.7, // Particle bursts, celebration animations
  },

  /** Consistent cubic-bezier easing curve */
  easing: {
    /** Material Design "standard" easing — smooth deceleration */
    standard: [0.4, 0, 0.2, 1] as [number, number, number, number],
    /** Ease out only — for elements entering the screen */
    enter: [0, 0, 0.2, 1] as [number, number, number, number],
    /** Ease in only — for elements leaving the screen */
    exit: [0.4, 0, 1, 1] as [number, number, number, number],
  },

  /** Framer Motion spring configs */
  spring: {
    /** Standard interactive spring (snappy) */
    standard: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
    /** Gentle spring for cards and page transitions */
    gentle: {
      type: 'spring' as const,
      stiffness: 180,
      damping: 22,
    },
    /** Bouncy spring for swipe cards */
    bouncy: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 20,
    },
  },
} as const;
