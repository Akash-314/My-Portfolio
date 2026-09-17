import React, { useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import './TargetCursor.css';

export interface TargetCursorProps {
  targetSelector?: string;
  spinDuration?: number;
  hideDefaultCursor?: boolean;
  hoverDuration?: number;
  parallaxOn?: boolean;
  cursorColor?: string;
  cursorColorOnTarget?: string;
}

export const TargetCursor: React.FC<TargetCursorProps> = ({
  targetSelector = '.cursor-target',
  spinDuration = 3,
  hideDefaultCursor = true,
  hoverDuration = 0.18,
  parallaxOn = false,
  cursorColor = '#0f172a',
  cursorColorOnTarget = '#dc2626',
}) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const rotatorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const cornersRef = useRef<HTMLDivElement[]>([]);
  const spinTl = useRef<gsap.core.Timeline | null>(null);

  const activeTargetRef = useRef<HTMLElement | null>(null);
  const isLockedRef = useRef(false);
  const mousePosRef = useRef({ x: -100, y: -100 });
  const isVisibleRef = useRef(false);

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const hasTouchScreen =
      'ontouchstart' in window ||
      (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) ||
      window.matchMedia('(pointer: coarse)').matches;
    const isSmallScreen = window.innerWidth <= 768;
    return hasTouchScreen || isSmallScreen;
  }, []);

  const cornerSize = 12;
  const borderWidth = 2;

  // Symmetrical 32px x 32px ambient square coordinates
  const ambientPositions = useMemo(
    () => [
      { x: -16, y: -16 }, // Top-Left
      { x: 4, y: -16 },  // Top-Right
      { x: 4, y: 4 },    // Bottom-Right
      { x: -16, y: 4 },  // Bottom-Left
    ],
    []
  );

  useEffect(() => {
    if (isMobile || !cursorRef.current || !rotatorRef.current) return;

    const cursor = cursorRef.current;
    const rotator = rotatorRef.current;
    const dot = dotRef.current;
    const corners = Array.from(
      rotator.querySelectorAll<HTMLDivElement>('.target-cursor-corner')
    );
    cornersRef.current = corners;

    if (hideDefaultCursor) {
      document.body.classList.add('target-cursor-active');
    }

    // Initialize root cursor wrapper (NEVER rotates)
    gsap.set(cursor, {
      x: -100,
      y: -100,
      opacity: 0,
    });

    // Initialize ambient corners
    corners.forEach((corner, i) => {
      gsap.set(corner, {
        x: ambientPositions[i].x,
        y: ambientPositions[i].y,
        borderColor: cursorColor,
      });
    });

    // Ambient spin on rotator only
    const startAmbientSpin = () => {
      if (spinTl.current) spinTl.current.kill();
      gsap.killTweensOf(rotator, 'rotation');
      spinTl.current = gsap
        .timeline({ repeat: -1 })
        .to(rotator, { rotation: '+=360', duration: spinDuration, ease: 'none' });
    };

    startAmbientSpin();

    // High performance cursor position setter
    const setCursorX = gsap.quickTo(cursor, 'x', { duration: 0.03, ease: 'power2.out' });
    const setCursorY = gsap.quickTo(cursor, 'y', { duration: 0.03, ease: 'power2.out' });

    // Lock to target
    const lockToTarget = (target: HTMLElement) => {
      activeTargetRef.current = target;
      isLockedRef.current = true;

      // STOP ambient rotation immediately and force rotation to 0
      if (spinTl.current) {
        spinTl.current.kill();
        spinTl.current = null;
      }
      gsap.killTweensOf(rotator);
      gsap.set(rotator, { rotation: 0 });

      // Transition to Spider-Man Crimson
      gsap.to(corners, {
        borderColor: cursorColorOnTarget,
        duration: 0.15,
        ease: 'power2.out',
      });
      if (dot) {
        gsap.to(dot, {
          backgroundColor: cursorColorOnTarget,
          duration: 0.15,
          ease: 'power2.out',
        });
      }

      // Initial smooth expansion to target corners
      const rect = target.getBoundingClientRect();
      const curX = mousePosRef.current.x;
      const curY = mousePosRef.current.y;

      const targetPoints = [
        { x: rect.left - borderWidth - curX, y: rect.top - borderWidth - curY },
        { x: rect.right + borderWidth - cornerSize - curX, y: rect.top - borderWidth - curY },
        { x: rect.right + borderWidth - cornerSize - curX, y: rect.bottom + borderWidth - cornerSize - curY },
        { x: rect.left - borderWidth - curX, y: rect.bottom + borderWidth - cornerSize - curY },
      ];

      corners.forEach((corner, i) => {
        gsap.to(corner, {
          x: targetPoints[i].x,
          y: targetPoints[i].y,
          duration: hoverDuration,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });
    };

    // Unlock from target and return to ambient
    const unlockFromTarget = () => {
      if (!isLockedRef.current) return;
      activeTargetRef.current = null;
      isLockedRef.current = false;

      // Ensure rotator is strictly at 0 while retracting
      gsap.killTweensOf(rotator);
      gsap.set(rotator, { rotation: 0 });

      // Revert colors
      gsap.to(corners, {
        borderColor: cursorColor,
        duration: 0.18,
        ease: 'power2.out',
      });
      if (dot) {
        gsap.to(dot, {
          backgroundColor: '#dc2626',
          duration: 0.18,
          ease: 'power2.out',
        });
      }

      // Smoothly animate corners back to ambient square
      corners.forEach((corner, i) => {
        gsap.to(corner, {
          x: ambientPositions[i].x,
          y: ambientPositions[i].y,
          duration: 0.2,
          ease: 'power3.out',
          overwrite: 'auto',
          onComplete: () => {
            // Once all 4 corners are back in ambient rest, resume ambient spin
            if (i === 0 && !isLockedRef.current) {
              startAmbientSpin();
            }
          },
        });
      });
    };

    // Real-time animation ticker: keeps corners 100% synchronized with target bounding rect
    const onTick = () => {
      const target = activeTargetRef.current;
      if (!target || !isLockedRef.current) return;

      if (!target.isConnected) {
        unlockFromTarget();
        return;
      }

      const rect = target.getBoundingClientRect();
      if (
        rect.width === 0 ||
        rect.height === 0 ||
        rect.bottom < -50 ||
        rect.top > window.innerHeight + 50
      ) {
        unlockFromTarget();
        return;
      }

      // Root cursor position
      const curX = gsap.getProperty(cursor, 'x') as number;
      const curY = gsap.getProperty(cursor, 'y') as number;

      // Ensure rotator is strictly unrotated during active lock
      gsap.set(rotator, { rotation: 0 });

      // Subtle micro-parallax if enabled
      let px = 0;
      let py = 0;
      if (parallaxOn) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        px = (curX - centerX) * 0.02;
        py = (curY - centerY) * 0.02;
      }

      // Corner positions relative to mouse position
      const targetPoints = [
        { x: rect.left - borderWidth - curX + px, y: rect.top - borderWidth - curY + py },
        { x: rect.right + borderWidth - cornerSize - curX + px, y: rect.top - borderWidth - curY + py },
        { x: rect.right + borderWidth - cornerSize - curX + px, y: rect.bottom + borderWidth - cornerSize - curY + py },
        { x: rect.left - borderWidth - curX + px, y: rect.bottom + borderWidth - cornerSize - curY + py },
      ];

      // Update positions frame-by-frame for exact scroll & tilt synchronization
      corners.forEach((corner, i) => {
        gsap.set(corner, {
          x: targetPoints[i].x,
          y: targetPoints[i].y,
        });
      });
    };

    gsap.ticker.add(onTick);

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        gsap.to(cursor, { opacity: 1, duration: 0.12 });
      }

      setCursorX(e.clientX);
      setCursorY(e.clientY);

      // Identify target under pointer
      const directTarget = e.target as Element | null;
      const targetElement = directTarget?.closest?.(targetSelector) as HTMLElement | null;

      if (targetElement) {
        if (activeTargetRef.current !== targetElement) {
          lockToTarget(targetElement);
        }
      } else {
        if (isLockedRef.current) {
          unlockFromTarget();
        }
      }
    };

    // Scroll handler: re-verify target engagement
    const handleScroll = () => {
      if (!isVisibleRef.current) return;
      const { x, y } = mousePosRef.current;
      const elementAtPoint = document.elementFromPoint(x, y);
      const targetElement = elementAtPoint?.closest?.(targetSelector) as HTMLElement | null;

      if (targetElement) {
        if (activeTargetRef.current !== targetElement) {
          lockToTarget(targetElement);
        }
      } else {
        if (isLockedRef.current) {
          unlockFromTarget();
        }
      }
    };

    // Click feedback
    const handleMouseDown = () => {
      if (dot) gsap.to(dot, { scale: 0.7, duration: 0.12 });
      gsap.to(cursor, { scale: 0.92, duration: 0.12 });
    };

    const handleMouseUp = () => {
      if (dot) gsap.to(dot, { scale: 1, duration: 0.15 });
      gsap.to(cursor, { scale: 1, duration: 0.15 });
    };

    // Window edge handlers
    const handleMouseLeaveDoc = () => {
      isVisibleRef.current = false;
      gsap.to(cursor, { opacity: 0, duration: 0.12 });
      if (isLockedRef.current) unlockFromTarget();
    };

    const handleMouseEnterDoc = () => {
      isVisibleRef.current = true;
      gsap.to(cursor, { opacity: 1, duration: 0.12 });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeaveDoc);
    document.addEventListener('mouseenter', handleMouseEnterDoc);

    return () => {
      gsap.ticker.remove(onTick);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeaveDoc);
      document.removeEventListener('mouseenter', handleMouseEnterDoc);

      spinTl.current?.kill();
      gsap.killTweensOf(rotator);
      document.body.classList.remove('target-cursor-active');
    };
  }, [
    targetSelector,
    spinDuration,
    hideDefaultCursor,
    hoverDuration,
    cursorColor,
    cursorColorOnTarget,
    isMobile,
    ambientPositions,
  ]);

  if (isMobile || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div ref={cursorRef} className="target-cursor-wrapper" aria-hidden="true">
      {/* Center Spider-Sense Target Core Dot */}
      <div
        ref={dotRef}
        className="target-cursor-dot"
        style={{ backgroundColor: '#dc2626' }}
      />
      {/* Rotator container: ONLY rotates in ambient mode, strictly locked to 0 on target */}
      <div ref={rotatorRef} className="target-cursor-rotator">
        <div className="target-cursor-corner corner-tl" style={{ borderColor: cursorColor }} />
        <div className="target-cursor-corner corner-tr" style={{ borderColor: cursorColor }} />
        <div className="target-cursor-corner corner-br" style={{ borderColor: cursorColor }} />
        <div className="target-cursor-corner corner-bl" style={{ borderColor: cursorColor }} />
      </div>
    </div>,
    document.body
  );
};

export default TargetCursor;
