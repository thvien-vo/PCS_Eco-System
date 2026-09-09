'use client';

/**
 * QrCameraScanner — live camera QR decode for the Kiosk QR_DISPLAY phase.
 *
 * Renders a `html5-qrcode` viewfinder into a fixed-id div and reports back
 * via callbacks only — it owns no kiosk state itself. The caller (QrDisplayModule)
 * decides what a successful decode means (it feeds the same triggerScan()
 * transition used by the "Simulate QR scan" debug button).
 *
 * LIFECYCLE CONTRACT
 * - Camera start/stop is tied to this component's mount/unmount. The caller
 *   (QrDisplayModule) passes stable, memoized callbacks (useCallback with
 *   stable deps — triggerScan from Zustand is itself a stable reference), so
 *   including them in the effect's dependency array does not cause the
 *   camera to restart on unrelated re-renders.
 * - Cleanup calls `.stop()` then `.clear()` on the Html5Qrcode instance so no
 *   video track is left open (avoids a stuck "camera in use" tab indicator).
 *   The caller unmounts this component whenever the camera view should close
 *   (cancel button, successful scan, or the Kiosk modal itself closing), so
 *   this single effect cleanup is the ONLY place camera teardown needs to live.
 *
 * HTTPS NOTE: getUserMedia is only available in a secure context (HTTPS, or
 * localhost for local dev). That restriction is enforced by the browser
 * itself — this component makes no protocol/host assumptions of its own, so
 * it works unmodified when the kiosk is served over HTTPS on a real device.
 */

import { useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const VIEWFINDER_ELEMENT_ID = 'kiosk-qr-camera-viewfinder';

interface QrCameraScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onFailure: () => void;
}

export function QrCameraScanner({ onScanSuccess, onFailure }: QrCameraScannerProps) {
  useEffect(() => {
    let hasSucceeded = false;
    const scanner = new Html5Qrcode(VIEWFINDER_ELEMENT_ID, { verbose: false });

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          // Multiple frames can decode before the caller unmounts us — only
          // the first success should trigger the state transition.
          if (hasSucceeded) return;
          hasSucceeded = true;
          onScanSuccess(decodedText);
        },
        () => {
          // Per-frame "no QR found in this frame" callback — expected while
          // nothing is in view, not an error condition.
        },
      )
      .catch(() => {
        // Permission denied, no camera device, or insecure (non-HTTPS) context.
        onFailure();
      });

    return () => {
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {
          // start() never resolved (e.g. permission was denied) — nothing
          // to stop or clear.
        });
    };
  }, [onScanSuccess, onFailure]);

  return (
    <div
      id={VIEWFINDER_ELEMENT_ID}
      className="w-full overflow-hidden rounded-2xl bg-black [&_video]:w-full [&_video]:rounded-2xl"
    />
  );
}
