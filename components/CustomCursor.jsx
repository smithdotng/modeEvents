'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Floating cursor ball — port of the SAFacilities mil-ball cursor.
 * Hidden on touch devices and small screens (< 1200 px, matching the
 * SAFacilities @media rule).
 * Uses Mode Events colours: #2a3b19 fill, #7ab648 accent.
 */
export default function CustomCursor() {
  const ballRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    // Skip on touch / pointer-less devices or narrow viewports
    if (
      typeof window === 'undefined' ||
      window.innerWidth < 1200 ||
      window.matchMedia('(pointer: coarse)').matches
    ) return;

    const ball = ballRef.current;
    if (!ball) return;

    function waitForGSAP(cb) {
      if (window.gsap) { cb(window.gsap); return; }
      setTimeout(() => waitForGSAP(cb), 50);
    }

    waitForGSAP((gsap) => {
      ball.style.display = 'block';
      gsap.set(ball, { xPercent: -50, yPercent: -50, opacity: 0.12 });

      // ── Track pointer ──────────────────────────────────────────────
      const onMove = (e) => {
        gsap.to(ball, {
          duration: 0.5,
          ease: 'sine.out',
          x: e.clientX,
          y: e.clientY,
        });
      };
      document.addEventListener('pointermove', onMove);

      // ── Shrink on interactive elements ─────────────────────────────
      const onEnterInteractive = () => gsap.to(ball, { scale: 0, duration: 0.2, ease: 'sine' });
      const onLeaveInteractive = () => gsap.to(ball, { scale: 1, duration: 0.2, ease: 'sine' });

      function bindInteractives() {
        document
          .querySelectorAll('a, button, input, textarea, select, [role="button"]')
          .forEach((el) => {
            el.addEventListener('mouseenter', onEnterInteractive);
            el.addEventListener('mouseleave', onLeaveInteractive);
          });
      }
      bindInteractives();

      // Re-bind after React re-renders on the same page
      const observer = new MutationObserver(() => bindInteractives());
      observer.observe(document.body, { childList: true, subtree: true });

      // ── Click pulse ────────────────────────────────────────────────
      const onDown = () => gsap.to(ball, { scale: 0.5, duration: 0.1, ease: 'sine' });
      const onUp   = () => gsap.to(ball, { scale: 1,   duration: 0.2, ease: 'sine' });
      document.addEventListener('mousedown', onDown);
      document.addEventListener('mouseup',   onUp);

      // ── Fade in on first move ──────────────────────────────────────
      const onFirstMove = () => {
        gsap.to(ball, { opacity: 0.12, duration: 0.3 });
        document.removeEventListener('pointermove', onFirstMove);
      };
      document.addEventListener('pointermove', onFirstMove);

      return () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('mousedown', onDown);
        document.removeEventListener('mouseup', onUp);
        observer.disconnect();
      };
    });
  }, [pathname]);

  return (
    <div
      ref={ballRef}
      aria-hidden="true"
      style={{ display: 'none' }}
      className="
        fixed top-0 left-0 z-[9999] pointer-events-none
        w-5 h-5 rounded-full
        bg-[#2a3b19]
        mix-blend-multiply
      "
    />
  );
}
