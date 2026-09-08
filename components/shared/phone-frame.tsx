'use client';

import { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

interface PhoneFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// PhoneFrameContainerContext
//
// Exposes PhoneFrame's own bezel DOM node so modals/sheets rendered deep in
// the tree (e.g. from inside a per-item Framer Motion wrapper that animates
// x/y/scale) can portal directly into it via ModalPortal, instead of relying
// on CSS containing-block inheritance through arbitrary intermediate
// ancestors. A `transform`-animated ancestor (Framer Motion writes an inline
// `transform` style whenever x/y/scale/rotate are animated) becomes the new
// CSS containing block for any `position: fixed` descendant, per spec — this
// silently hijacks fixed positioning away from PhoneFrame's bounds whenever
// a modal happens to render underneath one of those animated wrappers.
// Portaling re-parents the modal as a DIRECT DOM child of PhoneFrame's own
// bezel node, sidestepping that hijack entirely regardless of where in the
// component tree the modal is declared.
//
// The context value is state (not a plain ref) so consumers correctly
// re-render once the DOM node exists after mount — reading a ref's
// `.current` directly in a hook would risk observing `null` on first render.
// ---------------------------------------------------------------------------
const PhoneFrameContainerContext = createContext<HTMLDivElement | null>(null);

export function usePhoneFrameContainer(): HTMLDivElement | null {
  return useContext(PhoneFrameContainerContext);
}

/**
 * PhoneFrame — Simulated mobile phone-frame mockup on desktop.
 *
 * Auto-hides the frame bezel on real mobile viewports (<= 480px).
 * On desktop, renders a centered iPhone-style mockup (390x844px).
 *
 * Per pcs-design-system §5 — Layout & Typography rules.
 */
export function PhoneFrame({ children, className, ...props }: PhoneFrameProps) {
  // Callback ref (not useRef) — a state update on mount is what lets
  // usePhoneFrameContainer() consumers correctly re-render once the node
  // exists, instead of silently reading a stale/null .current on first render.
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    /*
     * Outer shell: full-screen on mobile, centered neutral bg on desktop.
     * The media-query breakpoint uses Tailwind's `sm` (640px).
     * On a REAL mobile device (≤480px), the frame never shows — only the content.
     * On a desktop/laptop viewport, the phone bezel renders via sm: classes.
     */
    <div className="flex min-h-screen items-center justify-center bg-background sm:bg-slate-700/30 sm:p-6">
      <div
        ref={setContainer}
        className={cn(
          // Mobile: full viewport, no frame
          'relative h-screen w-full overflow-hidden bg-background',
          // Desktop: phone-sized mockup with bezel
          'sm:h-[844px] sm:w-[390px]',
          'sm:rounded-[44px] sm:shadow-phone-frame',
          'sm:border-[10px] sm:border-[var(--frame-bezel)]',
          // Inner notch simulation via top padding (desktop only)
          'sm:ring-1 sm:ring-white/10',
          // Bug fix: establish a CSS containing block so that position:absolute
          // children (BottomNav, FAB) are positioned relative to this div on
          // both desktop (phone-frame) and mobile (h-screen full-bleed).
          // translateZ(0) is visually inert — no rendering side-effects.
          '[transform:translateZ(0)]',
          className
        )}
        {...props}
      >
        {/* Notch decoration — desktop only */}
        <div className="absolute left-1/2 top-0 z-50 hidden h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-[var(--frame-bezel)] sm:block" />

        <PhoneFrameContainerContext.Provider value={container}>
          {children}
        </PhoneFrameContainerContext.Provider>
      </div>
    </div>
  );
}
