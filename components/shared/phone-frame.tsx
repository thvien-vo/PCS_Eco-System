import { cn } from '@/lib/utils';

interface PhoneFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
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
  return (
    /*
     * Outer shell: full-screen on mobile, centered neutral bg on desktop.
     * The media-query breakpoint uses Tailwind's `sm` (640px).
     * On a REAL mobile device (≤480px), the frame never shows — only the content.
     * On a desktop/laptop viewport, the phone bezel renders via sm: classes.
     */
    <div className="min-h-screen bg-background sm:bg-slate-700/30 sm:p-6 flex items-center justify-center">
      <div
        className={cn(
          // Mobile: full viewport, no frame
          'w-full h-screen relative overflow-hidden bg-background',
          // Desktop: phone-sized mockup with bezel
          'sm:h-[844px] sm:w-[390px]',
          'sm:rounded-[44px] sm:shadow-phone-frame',
          'sm:border-[10px] sm:border-[var(--frame-bezel)]',
          // Inner notch simulation via top padding (desktop only)
          'sm:ring-1 sm:ring-white/10',
          className
        )}
        {...props}
      >
        {/* Notch decoration — desktop only */}
        <div className="absolute top-0 left-1/2 z-50 hidden h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-[var(--frame-bezel)] sm:block" />

        {children}
      </div>
    </div>
  );
}
