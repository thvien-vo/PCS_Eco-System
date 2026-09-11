/**
 * kiosk-store.ts — Module 7 Kiosk State Machine Store
 *
 * Local-mock state diagram (unchanged):
 *   IDLE → QR_DISPLAY → SIMULATED_SCAN → RESULT_PASS | RESULT_REJECT → IDLE
 *
 * Remote-station state diagram (multi-bottle session, added for the
 * pcs-kiosk-app WebSocket handshake):
 *   QR_DISPLAY → WS_CONNECTING → WS_AWAITING_BOTTLE → WS_PROCESSING →
 *     RESULT_PASS | RESULT_REJECT → (loops back to) WS_AWAITING_BOTTLE
 *   ... → WS_SESSION_ENDED → IDLE
 *
 * RESULT_PASS / RESULT_REJECT are reused as-is for both flows — only what
 * happens after them differs, gated by `sessionMode`:
 *   - 'local'  → the existing 5s auto-reset closes the modal (unchanged).
 *   - 'remote' → a brief flash, then loops back to WS_AWAITING_BOTTLE.
 * The remote session itself only ends via endRemoteSession() (explicit
 * Complete tap, or an inactivity timeout — both call the same action).
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
  | 'WS_CONNECTING'
  | 'WS_AWAITING_BOTTLE'
  | 'WS_PROCESSING'
  | 'RESULT_PASS'
  | 'RESULT_REJECT'
  | 'WS_SESSION_ENDED';

export interface RemoteSession {
  /** The physical station's own id, parsed from its QR — e.g. "HCM-01". */
  stationId: string;
  /** The physical station's session id, parsed from its QR. Every inbound
   *  WS message is checked against this before being acted on. */
  sessionId: string;
}

interface KioskState {
  phase: KioskPhase;
  /** This app's OWN QR_DISPLAY token (shown for something else to scan).
   *  Unrelated to `remoteSession` below — never conflated. Null when IDLE. */
  sessionToken: string | null;
  /** Populated only once a remote-station QR has been scanned by this app's
   *  camera. Null for the local-mock flow. */
  remoteSession: RemoteSession | null;
  /** 'local' = existing Simulate/PASS-button mock. 'remote' = pcs-kiosk-app
   *  WebSocket handshake, potentially spanning several bottles. */
  sessionMode: 'local' | 'remote';
  /** Running tally for the current remote session. Always 0 for 'local'. */
  bottlesProcessed: number;
  pointsThisSession: number;
  /** Populated only in RESULT_PASS / RESULT_REJECT phases. */
  scanResult: ScanResult | null;

  /** Transition: IDLE → QR_DISPLAY. Generates a fresh session token. */
  openKiosk: (stationId: string) => void;
  /** Transition: QR_DISPLAY → SIMULATED_SCAN. Stops QR timer (handled in component). */
  triggerScan: () => void;
  /** Transition: QR_DISPLAY → WS_CONNECTING. Camera decoded a foreign station's QR. */
  connectToRemoteKiosk: (stationId: string, sessionId: string) => void;
  /** Transition: WS_CONNECTING → WS_AWAITING_BOTTLE. Socket is open. */
  markRemoteConnected: () => void;
  /** Transition: WS_CONNECTING → QR_DISPLAY. User gave up on the remote
   *  connection and chose to continue with the local mock instead. */
  fallbackToSimulate: () => void;
  /** Transition: WS_AWAITING_BOTTLE → WS_PROCESSING. Station started evaluating a bottle. */
  beginBottle: () => void;
  /**
   * Transition: SIMULATED_SCAN | WS_PROCESSING → RESULT_PASS | RESULT_REJECT.
   * In 'remote' mode also increments the running bottle/points tally.
   */
  setResult: (result: ScanResult) => void;
  /** Transition (remote only): RESULT_PASS | RESULT_REJECT → WS_AWAITING_BOTTLE. */
  advanceAfterBottleResult: () => void;
  /** Transition (remote only): any active remote phase → WS_SESSION_ENDED.
   *  The only way a remote session ends — explicit Complete tap or inactivity timeout. */
  endRemoteSession: () => void;
  /**
   * RESET (synchronous cleanup side-effect):
   * Clears sessionToken, remoteSession, scanResult, tally, and returns to
   * IDLE in a single atomic update.
   * Called by the Close button (any phase) and by the 5s local auto-timeout.
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
  remoteSession: null,
  sessionMode: 'local',
  bottlesProcessed: 0,
  pointsThisSession: 0,
  scanResult: null,

  openKiosk: (stationId) =>
    set({
      phase: 'QR_DISPLAY',
      sessionToken: generateSessionToken(stationId),
      remoteSession: null,
      sessionMode: 'local',
      bottlesProcessed: 0,
      pointsThisSession: 0,
      scanResult: null,
    }),

  triggerScan: () =>
    set((state) => {
      // Guard: only valid from QR_DISPLAY
      if (state.phase !== 'QR_DISPLAY') return state;
      return { phase: 'SIMULATED_SCAN' };
    }),

  connectToRemoteKiosk: (stationId, sessionId) =>
    set((state) => {
      // Guard: only valid from QR_DISPLAY
      if (state.phase !== 'QR_DISPLAY') return state;
      return {
        phase: 'WS_CONNECTING',
        sessionMode: 'remote',
        remoteSession: { stationId, sessionId },
        bottlesProcessed: 0,
        pointsThisSession: 0,
        scanResult: null,
      };
    }),

  markRemoteConnected: () =>
    set((state) => {
      // Guard: only valid from WS_CONNECTING
      if (state.phase !== 'WS_CONNECTING') return state;
      return { phase: 'WS_AWAITING_BOTTLE' };
    }),

  fallbackToSimulate: () =>
    set((state) => {
      // Guard: only valid from WS_CONNECTING
      if (state.phase !== 'WS_CONNECTING') return state;
      return {
        phase: 'QR_DISPLAY',
        sessionMode: 'local',
        remoteSession: null,
        bottlesProcessed: 0,
        pointsThisSession: 0,
      };
    }),

  beginBottle: () =>
    set((state) => {
      // Guard: only valid from WS_AWAITING_BOTTLE
      if (state.phase !== 'WS_AWAITING_BOTTLE') return state;
      return { phase: 'WS_PROCESSING' };
    }),

  setResult: (result) =>
    set((state) => {
      // Guard: valid from SIMULATED_SCAN (local) or WS_PROCESSING (remote)
      if (state.phase !== 'SIMULATED_SCAN' && state.phase !== 'WS_PROCESSING') return state;
      const isRemote = state.sessionMode === 'remote';
      return {
        phase: result.status === 'PASS' ? 'RESULT_PASS' : 'RESULT_REJECT',
        scanResult: result,
        bottlesProcessed: isRemote ? state.bottlesProcessed + 1 : state.bottlesProcessed,
        pointsThisSession: isRemote
          ? state.pointsThisSession + result.pointsAwarded
          : state.pointsThisSession,
      };
    }),

  advanceAfterBottleResult: () =>
    set((state) => {
      // Guard: remote sessions only, only from a result phase
      if (
        state.sessionMode !== 'remote' ||
        (state.phase !== 'RESULT_PASS' && state.phase !== 'RESULT_REJECT')
      ) {
        return state;
      }
      return { phase: 'WS_AWAITING_BOTTLE', scanResult: null };
    }),

  endRemoteSession: () =>
    set((state) => {
      // Guard: remote sessions only
      if (state.sessionMode !== 'remote') return state;
      return { phase: 'WS_SESSION_ENDED' };
    }),

  resetKiosk: () =>
    set({
      phase: 'IDLE',
      sessionToken: null, // Old token ALWAYS cleared — confirmed in QA point #2
      remoteSession: null,
      sessionMode: 'local',
      bottlesProcessed: 0,
      pointsThisSession: 0,
      scanResult: null,
    }),
}));
