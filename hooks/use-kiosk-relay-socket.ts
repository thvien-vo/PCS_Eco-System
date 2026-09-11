'use client';

/**
 * useKioskRelaySocket — WebSocket relay for a remote pcs-kiosk-app station.
 *
 * Message shapes (from pcs-kiosk-app's own wsClient.js header comment):
 *   outgoing → {"event":"user_identified","payload":{"userName","userId","sessionId"}}
 *   incoming → {"event":"bottle_processing","payload":{"sessionId"}}
 *   incoming → {"event":"bottle_result","payload":{"sessionId","result":"accept"|"reject",
 *               "bottleType"?,"points"?,"reason"?}}
 *     reason (reject only) ∈ dirty | ood | mixed | low_confidence | unknown
 *
 * Every inbound message is checked against this session's own sessionId
 * before being acted on — a mismatched sessionId is ignored rather than
 * applied, so a stray message from a different station/session can never
 * mutate this session's phase.
 *
 * Scope (demo-grade, per approved plan): one connection attempt, no
 * auto-reconnect. The socket stays open for the WHOLE multi-bottle session
 * — opened once phase enters the remote flow, closed on fallback/session-end/
 * unmount, not after a single bottle_result.
 *
 * Inactivity timeout: while WS_AWAITING_BOTTLE, if no bottle_processing
 * arrives within INACTIVITY_TIMEOUT_MS, the session ends automatically
 * (same endRemoteSession() path as the explicit Complete button).
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useKioskStore } from '@/store/kiosk-store';
import type { ScanResult } from '@/types';

const INACTIVITY_TIMEOUT_MS = 60_000; // 60s — approved placeholder, no fixed number from pcs-kiosk-app

type RejectReasonCode = 'dirty' | 'ood' | 'mixed' | 'low_confidence' | 'unknown';

const REJECT_REASON_MAP: Record<RejectReasonCode, NonNullable<ScanResult['rejectReason']>> = {
  dirty: 'Dirty/Wet',
  ood: 'OOD Material',
  mixed: 'Mixed/Composite',
  low_confidence: 'Low Confidence',
  unknown: 'Unknown',
};

interface BottleResultPayload {
  sessionId: string;
  result: 'accept' | 'reject';
  bottleType?: string;
  points?: number;
  reason?: string;
}

interface InboundMessage {
  event: 'bottle_processing' | 'bottle_result' | string;
  payload: { sessionId: string } & Partial<BottleResultPayload>;
}

function isInboundMessage(value: unknown): value is InboundMessage {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as { event?: unknown; payload?: unknown };
  return typeof candidate.event === 'string' && typeof candidate.payload === 'object';
}

function toMaterial(bottleType: string | undefined): ScanResult['materialDetected'] {
  const known: ReadonlyArray<NonNullable<ScanResult['materialDetected']>> = [
    'PET',
    'PE',
    'PP',
    'PS',
    'PVC',
    'OOD',
  ];
  return known.find((m) => m === bottleType);
}

const DEFAULT_POINTS_AWARDED = 25;

interface UseKioskRelaySocketParams {
  userId: string | null;
  userName: string;
}

export function useKioskRelaySocket({ userId, userName }: UseKioskRelaySocketParams): {
  connectionError: boolean;
  retryConnection: () => void;
} {
  const remoteSession = useKioskStore((s) => s.remoteSession);
  const sessionMode = useKioskStore((s) => s.sessionMode);
  const phase = useKioskStore((s) => s.phase);
  const markRemoteConnected = useKioskStore((s) => s.markRemoteConnected);
  const beginBottle = useKioskStore((s) => s.beginBottle);
  const setResult = useKioskStore((s) => s.setResult);
  const endRemoteSession = useKioskStore((s) => s.endRemoteSession);

  const [connectionError, setConnectionError] = useState<boolean>(false);
  const [retryNonce, setRetryNonce] = useState<number>(0);
  const socketRef = useRef<WebSocket | null>(null);

  // A remote session is "active" for the whole handshake, from the moment a
  // station QR is scanned until the session ends or the connection is
  // abandoned — NOT tied to the per-bottle phase, so the socket persists
  // across the WS_AWAITING_BOTTLE / WS_PROCESSING / RESULT_* loop.
  const isSessionActive =
    sessionMode === 'remote' && remoteSession !== null && phase !== 'IDLE' && phase !== 'QR_DISPLAY';

  const retryConnection = useCallback(() => {
    setConnectionError(false);
    setRetryNonce((n) => n + 1);
  }, []);

  // ── Socket lifecycle — one attempt per session, no auto-reconnect ─────────
  useEffect(() => {
    if (!isSessionActive || !remoteSession) return;

    const wsUrl = process.env.NEXT_PUBLIC_KIOSK_WS_URL;
    if (!wsUrl) {
      setConnectionError(true);
      return;
    }

    setConnectionError(false);
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    let hasConnected = false;

    socket.onopen = () => {
      hasConnected = true;
      socket.send(
        JSON.stringify({
          event: 'user_identified',
          payload: {
            userName,
            userId,
            sessionId: remoteSession.sessionId,
          },
        }),
      );
      markRemoteConnected();
    };

    socket.onmessage = (event: MessageEvent<string>) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(event.data);
      } catch {
        return; // malformed payload — ignore rather than crash the session
      }
      if (!isInboundMessage(parsed)) return;
      if (parsed.payload.sessionId !== remoteSession.sessionId) return; // stray/foreign session

      if (parsed.event === 'bottle_processing') {
        beginBottle();
        return;
      }

      if (parsed.event === 'bottle_result') {
        const payload = parsed.payload as BottleResultPayload;
        if (payload.result === 'accept') {
          setResult({
            status: 'PASS',
            confidenceScore: 98.7,
            materialDetected: toMaterial(payload.bottleType),
            pointsAwarded: payload.points ?? DEFAULT_POINTS_AWARDED,
          });
        } else {
          const reasonCode = (payload.reason as RejectReasonCode | undefined) ?? 'unknown';
          setResult({
            status: 'REJECT',
            confidenceScore: 0,
            rejectReason: REJECT_REASON_MAP[reasonCode] ?? REJECT_REASON_MAP.unknown,
            pointsAwarded: 0,
          });
        }
      }
    };

    socket.onerror = () => {
      setConnectionError(true);
    };

    socket.onclose = () => {
      if (!hasConnected) setConnectionError(true);
    };

    return () => {
      socketRef.current = null;
      socket.close();
    };
    // userId/userName/action refs intentionally omitted: they're only read once
    // at connect time (mirrors "no auto-reconnect" — a value change mid-session
    // must not tear down and reopen the socket).
  }, [isSessionActive, remoteSession?.sessionId, retryNonce]);

  // ── Inactivity timeout — only runs while awaiting the next bottle ─────────
  useEffect(() => {
    if (phase !== 'WS_AWAITING_BOTTLE') return;

    const timeoutId = setTimeout(() => {
      endRemoteSession();
    }, INACTIVITY_TIMEOUT_MS);

    return () => clearTimeout(timeoutId);
  }, [phase, endRemoteSession]);

  return { connectionError, retryConnection };
}
