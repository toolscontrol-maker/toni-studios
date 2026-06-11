'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type Phase = 'idle' | 'in' | 'out';

export default function TransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router   = useRouter();
  const pathname = usePathname();

  const [phase, setPhase] = useState<Phase>('idle');

  const navigating = useRef(false);
  const prevPath   = useRef(pathname);
  const t1 = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const t2 = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /* ── Watch pathname → start slide-out ── */
  useEffect(() => {
    if (pathname !== prevPath.current && navigating.current) {
      prevPath.current = pathname;
      clearTimeout(t1.current);
      clearTimeout(t2.current);
      t1.current = setTimeout(() => {
        setPhase('out');
        t2.current = setTimeout(() => {
          setPhase('idle');
          navigating.current = false;
        }, 650);
      }, 100);
    }
  }, [pathname]);

  /* ── Trigger transition & navigate ── */
  const go = useCallback(
    (href: string) => {
      if (navigating.current) return;
      navigating.current = true;
      prevPath.current   = pathname;

      setPhase('in');

      /* Navigate after overlay is fully visible */
      setTimeout(() => router.push(href), 550);
    },
    [pathname, router],
  );

  /* ── Global link click interceptor ── */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null;
      if (!a) return;

      const href = a.getAttribute('href') ?? '';

      /* Only internal, non-hash, same-tab links */
      if (!href.startsWith('/') || href.startsWith('//')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target === '_blank') return;

      /* Already on this page */
      const bare = href.split('?')[0];
      if (bare === pathname || bare === pathname.replace(/\/$/, '')) return;

      e.preventDefault();
      go(href);
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [go, pathname]);

  /* ── Cleanup on unmount ── */
  useEffect(() => () => {
    clearTimeout(t1.current);
    clearTimeout(t2.current);
  }, []);

  const cls = phase === 'idle' ? 'tn-ov' : `tn-ov tn-ov--${phase}`;

  return (
    <>
      {children}

      <style>{`
        /* ════ TONET CINEMATIC SLIDE TRANSITION ════ */
        .tn-ov {
          position: fixed;
          inset: 0;
          z-index: 9000;
          background: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translateY(100%);
          pointer-events: none;
          will-change: transform;
        }
        
        .tn-ov--in {
          transform: translateY(0%);
          pointer-events: all;
          transition: transform 600ms cubic-bezier(0.85, 0, 0.15, 1);
        }
        
        .tn-ov--out {
          transform: translateY(-100%);
          pointer-events: none;
          transition: transform 600ms cubic-bezier(0.85, 0, 0.15, 1);
        }

        /* Subtle radial vignette */
        .tn-ov-vgn {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at 50% 50%,
            transparent 30%,
            rgba(0, 0, 0, 0.6) 100%
          );
          pointer-events: none;
        }

        /* Centered label in Coolvetica */
        .tn-ov-lbl {
          font-family: var(--font-helvetica-bold-cond), sans-serif;
          font-size: clamp(20.4px, 2.975vw, 37.4px);
          font-weight: 300;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding-right: 0.12em;
          color: #ffffff;
          position: relative;
          z-index: 1;
          opacity: 0;
          transform: scale(0.92) translateY(15px);
          transition: opacity 350ms cubic-bezier(0.16, 1, 0.3, 1), transform 350ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .tn-ov--in .tn-ov-lbl {
          opacity: 1;
          transform: scale(1) translateY(0);
          transition-delay: 220ms;
        }
        
        .tn-ov--out .tn-ov-lbl {
          opacity: 0;
          transform: scale(1.05) translateY(-15px);
          transition: opacity 250ms ease, transform 250ms ease;
        }

        /* Architectural hairline */
        .tn-ov-rule {
          position: absolute;
          bottom: 52px;
          left: 50%;
          transform: translateX(-50%);
          width: 1px;
          height: 44px;
          background: rgba(255, 255, 255, 0.08);
          opacity: 0;
          transition: opacity 300ms ease;
        }
        
        .tn-ov--in .tn-ov-rule {
          opacity: 1;
          transition-delay: 250ms;
        }
      `}</style>

      <div className={cls} aria-hidden="true">
        <div className="tn-ov-vgn" />
        <span className="tn-ov-lbl">TONET GALLERY</span>
        <div className="tn-ov-rule" />
      </div>
    </>
  );
}
