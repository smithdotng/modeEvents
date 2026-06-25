'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Initialises GSAP animations on every route change.
 * Mirrors SAFacilities/js/main.js, adapted for Next.js.
 *
 * KEY SSR FIX: `immediateRender: false` in every fromTo/from call.
 * Without it, GSAP immediately sets opacity:0 on .mil-up elements
 * the moment it initialises — causing visible text to flash away then
 * animate back in. immediateRender:false tells GSAP to only apply the
 * "from" state when the animation is actually about to play (i.e. when
 * the ScrollTrigger fires), so SSR content stays visible until then.
 */
export default function GSAPInit() {
  const pathname = usePathname();

  useEffect(() => {
    let retryTimer;

    function init() {
      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;
      const ScrollToPlugin = window.ScrollToPlugin;

      if (!gsap || !ScrollTrigger) {
        retryTimer = setTimeout(init, 60);
        return;
      }

      gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

      // Kill stale triggers from previous route
      ScrollTrigger.getAll().forEach(t => t.kill());

      // ── Scroll progress bar ─────────────────────────────────────────
      const progressEl = document.querySelector('.me-progress');
      if (progressEl) {
        gsap.to(progressEl, {
          height: '100%',
          ease: 'none',
          scrollTrigger: { scrub: 0.3 },
        });
      }

      // ── .mil-up — fade + slide in on scroll ─────────────────────────
      // immediateRender:false stops GSAP setting opacity:0 before the
      // ScrollTrigger fires, preventing the "content disappears" flash.
      document.querySelectorAll('.mil-up').forEach((el) => {
        if (el._gsapInited) return;
        el._gsapInited = true;

        gsap.fromTo(
          el,
          {
            opacity: 0,
            y: 40,
            scale: 0.98,
            immediateRender: false,   // ← prevents the SSR flash
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // ── .mil-stagger — staggered children ──────────────────────────
      document.querySelectorAll('.mil-stagger').forEach((parent) => {
        if (parent._gsapInited) return;
        parent._gsapInited = true;

        gsap.fromTo(
          Array.from(parent.children),
          {
            opacity: 0,
            y: 40,
            scale: 0.98,
            immediateRender: false,   // ← same fix for staggered items
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: 'power2.out',
            stagger: 0.08,
            scrollTrigger: {
              trigger: parent,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // ── [data-mil-parallax] — vertical parallax ─────────────────────
      if (window.innerWidth > 960) {
        document.querySelectorAll('[data-mil-parallax]').forEach((el) => {
          const [v1, v2] = (el.dataset.milParallax || '-30,30').split(',').map(Number);
          gsap.fromTo(
            el,
            { y: v1, immediateRender: false },
            { y: v2, ease: 'none', scrollTrigger: { trigger: el, scrub: true } }
          );
        });
      }

      // ── [data-mil-rotate] — rotation on scroll ──────────────────────
      document.querySelectorAll('[data-mil-rotate]').forEach((el) => {
        gsap.fromTo(
          el,
          { rotate: 0, immediateRender: false },
          {
            rotate: Number(el.dataset.milRotate || 360),
            ease: 'none',
            scrollTrigger: { trigger: el, scrub: true },
          }
        );
      });

      // ── Hero blob parallax (desktop) ────────────────────────────────
      document.querySelectorAll('.hero-blob').forEach((blob, i) => {
        gsap.to(blob, {
          y: i % 2 === 0 ? -60 : 60,
          ease: 'none',
          scrollTrigger: {
            trigger: blob.closest('section') || blob,
            scrub: 1.5,
          },
        });
      });

      // ── Smooth anchor scroll ────────────────────────────────────────
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
          const target = document.querySelector(anchor.getAttribute('href'));
          if (!target) return;
          e.preventDefault();
          if (ScrollToPlugin) {
            gsap.to(window, {
              duration: 0.8,
              scrollTo: { y: target, offsetY: 80 },
              ease: 'power2.inOut',
            });
          } else {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    }

    init();

    return () => {
      clearTimeout(retryTimer);
      if (window.gsap && window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach(t => t.kill());
      }
      // Clear per-element flag so they re-animate on next visit
      document.querySelectorAll('.mil-up, .mil-stagger').forEach(el => {
        delete el._gsapInited;
      });
    };
  }, [pathname]);

  return null;
}
