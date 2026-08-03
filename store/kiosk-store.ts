/**
 * kiosk-store.ts — Module 7 Kiosk State Machine Store
 *
 * KioskPhase mirrors the approved State Diagram exactly:
 *   IDLE → QR_DISPLAY → SIMULATED_SCAN → RESULT_PASS | RESULT_REJECT → IDLE
 *
 * RESET is NOT a phase — it is a synchronous side-effect inside resetKiosk().
 * No persist middleware: kiosk state is ephemeral by design.
 *
 * Per pcs-tech-standards §2: strict TypeScript, no `any`.
 */

import { create } from 'zustand';
import type { ScanResult } from '@/types';

export type KioskPhase =
  | 'IDLE'
  | 'QR_DISPLAY'
  | 'SIMULATED_SCAN'
  | 'RESULT_PASS'
  | 'RESULT_REJECT';

interface KioskState {
  phase: KioskPhase;
  /** Current session token string, null when IDLE. Cleared on every resetKiosk(). */
  sessionToken: string | null;
  /** Populated only in RESULT_PASS / RESULT_REJECT phases. */
  scanResult: ScanResult | null;

  /** Transition: IDLE → QR_DISPLAY. Generates a fresh session token. */
  openKiosk: (stationId: string) => void;
  /** Transition: QR_DISPLAY → SIMULATED_SCAN. Stops QR timer (handled in component). */
  triggerScan: () => void;
  /** Transition: SIMULATED_SCAN → RESULT_PASS | RESULT_REJECT. */
  setResult: (result: ScanResult) => void;
  /**
   * RESET (synchronous cleanup side-effect):
   * Clears sessionToken, scanResult, and returns to IDLE in a single atomic update.
   * Called by the Close button (any phase) and by the 5s auto-timeout.
   * There is NO intermediate rendered state — the store jumps directly to IDLE.
   */
  resetKiosk: () => void;
}

function generateSessionToken(stationId: string): string {
  // Mock token format as specified: pcs-station-{stationId}-session-{randomId}
  // Conceptually this would be a real backend session token in production.
  const randomId = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `pcs-station-${stationId}-session-${randomId}`;
}

export const useKioskStore = create<KioskState>((set) => ({
  phase: 'IDLE',
  sessionToken: null,
  scanResult: null,

  openKiosk: (stationId) =>
    set({
      phase: 'QR_DISPLAY',
      sessionToken: generateSessionToken(stationId),
      scanResult: null,
    }),

  triggerScan: () =>
    set((state) => {
      // Guard: only valid from QR_DISPLAY
      if (state.phase !== 'QR_DISPLAY') return state;
      return { phase: 'SIMULATED_SCAN' };
    }),

  setResult: (result) =>
    set((state) => {
      // Guard: only valid from SIMULATED_SCAN (strict determinism per confirmed spec)
      if (state.phase !== 'SIMULATED_SCAN') return state;
      return {
        phase: result.status === 'PASS' ? 'RESULT_PASS' : 'RESULT_REJECT',
        scanResult: result,
      };
    }),

  resetKiosk: () =>
    set({
      phase: 'IDLE',
      sessionToken: null, // Old token ALWAYS cleared — confirmed in QA point #2
      scanResult: null,
    }),
}));
