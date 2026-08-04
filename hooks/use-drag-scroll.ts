'use client';

/**
 * useDragScroll — Enables mouse click-drag horizontal scrolling on a ref'd element.
 *
 * Click/drag disambiguation:
 *   - A gesture is only classified as a DRAG once cumulative horizontal movement
 *     exceeds DRAG_THRESHOLD_PX (5 px). Below that threshold it is treated as a click.
 *   - When a drag is detected, `isDraggingRef.current` is set to `true`.
 *   - An `onClickCapture` handler (attach to the SAME element) suppresses the resulting
 *     click event when `isDragging` is true, preventing accidental child navigation or
 *     overlay opens at drag-end.
 *   - Cursor changes: `grab` at rest (set via className), `grabbing` while dragging.
 *
 * Touch events are NOT handled here — native browser touch scrolling is sufficient
 * and adding touch handling would cause double-handling on mobile.
 *
 * Per pcs-tech-standards §12 — mandatory pattern for all horizontal carousels.
 *
 * Usage:
 *   const drag = useDragScroll();
 *   <div
 *     ref={drag.ref}
 *     onMouseDown={drag.onMouseDown}
 *     onMouseMove={drag.onMouseMove}
 *     onMouseUp={drag.onMouseUp}
 *     onMouseLeave={drag.onMouseLeave}
 *     onClickCapture={drag.onClickCapture}
 *     className="overflow-x-auto cursor-grab scrollbar-hide"
 *   >
 *     ...children with their own onClick handlers work correctly...
 *   </div>
 */

import { useRef, useCallback } from 'react';

/** Minimum horizontal movement in px before a gesture is classified as a drag. */
const DRAG_THRESHOLD_PX = 5;

export function useDragScroll() {
  const ref = useRef<HTMLElement | null>(null);

  /** True between mousedown and mouseup/mouseleave. */
  const isPointerDownRef = useRef(false);

  /**
   * True once movement has exceeded DRAG_THRESHOLD_PX.
   * Stored as a ref (not state) so the capture-phase click handler can read
   * the current value synchronously without stale-closure issues.
   */
  const isDraggingRef = useRef(false);

  /** pageX at the moment of mousedown, relative to element's left edge. */
  const startXRef = useRef(0);

  /** scrollLeft at the moment of mousedown. */
  const scrollLeftRef = useRef(0);

  /**
   * Capture-phase click suppressor.
   * Attach via `onClickCapture` on the same scrollable element.
   * Fires before any child's `onClick`, so it can intercept and cancel accidental
   * click events that result from releasing the mouse at the end of a drag.
   */
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;

    isPointerDownRef.current = true;
    isDraggingRef.current = false; // reset on each new gesture

    startXRef.current = e.pageX - el.getBoundingClientRect().left;
    scrollLeftRef.current = el.scrollLeft;

    el.style.cursor = 'grabbing';
    el.style.userSelect = 'none'; // prevent text selection during drag
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPointerDownRef.current) return;
    const el = ref.current;
    if (!el) return;

    const x = e.pageX - el.getBoundingClientRect().left;
    const walk = x - startXRef.current;

    // Upgrade from "click candidate" to "drag" once threshold is crossed
    if (!isDraggingRef.current && Math.abs(walk) >= DRAG_THRESHOLD_PX) {
      isDraggingRef.current = true;
    }

    if (isDraggingRef.current) {
      e.preventDefault(); // prevent browser's own text-selection drag
      el.scrollLeft = scrollLeftRef.current - walk;
    }
  }, []);

  const endDrag = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    isPointerDownRef.current = false;
    el.style.cursor = '';
    el.style.userSelect = '';

    /**
     * Defer the isDragging reset to the NEXT event-loop tick.
     * The synthetic `click` event fires synchronously right after `mouseup`,
     * so `onClickCapture` must still see `isDragging = true` when it runs.
     * Resetting on the next tick ensures the click is suppressed, then cleared.
     */
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 0);
  }, []);

  return {
    ref,
    onMouseDown,
    onMouseMove,
    onMouseUp: endDrag,
    onMouseLeave: endDrag,
    onClickCapture,
  } as const;
}
