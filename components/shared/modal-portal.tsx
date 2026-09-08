'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePhoneFrameContainer } from '@/components/shared/phone-frame';

interface ModalPortalProps {
  children: React.ReactNode;
}

/**
 * ModalPortal — re-parents fixed-position modal/sheet overlays as direct DOM
 * children of PhoneFrame's own bezel node, instead of wherever they happen
 * to be declared in the component tree.
 *
 * Why this is necessary: a `position: fixed` element's CSS containing block
 * is the nearest ancestor with a `transform` (among other properties) — not
 * necessarily PhoneFrame's own `[transform:translateZ(0)]`. Any intermediate
 * Framer Motion wrapper that animates x/y/scale/rotate writes an inline
 * `transform` style, which silently becomes that containing block instead,
 * shrinking/misplacing the modal to that wrapper's box. Portaling sidesteps
 * this: the modal becomes a sibling of PhoneFrame's other direct children,
 * so `w-full`/`fixed inset-0`/`fixed bottom-0` always resolve against
 * PhoneFrame's actual bounds, regardless of what wraps the trigger.
 *
 * Falls back to `document.body` when rendered outside a <PhoneFrame> (none
 * of the current call sites are, but this keeps the component safe to reuse
 * on full-width, non-kiosk routes without a silent no-op).
 *
 * Renders nothing until mounted: `usePhoneFrameContainer()` can only return
 * a non-null node after PhoneFrame's ref callback has fired, which happens
 * after PhoneFrame itself has committed — never on the server or the first
 * client render. Portaling before that would either fail (no `document`) or
 * silently target `document.body` even when a real container is about to
 * become available a tick later.
 */
export function ModalPortal({ children }: ModalPortalProps) {
  const container = usePhoneFrameContainer();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(children, container ?? document.body);
}
