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
  parallaxOn = true,
  cursorColor = '#0f172a',
  cursorColorOnTarget = '#dc2626',
}) => {
  const cursorRef = useRef<HTMLDivElement>(null);
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

  // Ambient rest coordinates relative to cursor center (32px x 32px square)
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
    if (isMobile || !cursorRef.current) return;

    const cursor = cursorRef.current;
    const dot = dotRef.current;
    const corners = Array.from(
      cursor.querySelectorAll<HTMLDivElement>('.target-cursor-corner')
    );
    cornersRef.current = corners;

    if (hideDefaultCursor) {
      document.body.classList.add('target-cursor-active');
    }

    // Initialize cursor wrapper offscreen
    gsap.set(cursor, {
      x: -100,
      y: -100,
      opacity: 0,
      scale: 1,
    });

    // Initialize ambient corners
    corners.forEach((corner, i) => {
      gsap.set(corner, {
        x: ambientPositions[i].x,
        y: ambientPositions[i].y,
        borderColor: cursorColor,
      });
    });

    // Continuous ambient rotation timeline
    const startSpin = () => {
      if (spinTl.current) spinTl.current.kill();
      spinTl.current = gsap
        .timeline({ repeat: -1 })
        .to(cursor, { rotation: '+=360', duration: spinDuration, ease: 'none' });
    };

    startSpin();

    // GSAP quickTo setters for ultra-fast, lag-free cursor tracking
    const setCursorX = gsap.quickTo(cursor, 'x', { duration: 0.05, ease: 'power2.out' });
    const setCursorY = gsap.quickTo(cursor, 'y', { duration: 0.05, ease: 'power2.out' });

    // Lock to target
    const lockToTarget = (target: HTMLElement) => {
      activeTargetRef.current = target;
      isLockedRef.current = true;

      // Pause rotation cleanly and reset to 0
      spinTl.current?.pause();
      gsap.to(cursor, { rotation: 0, duration: 0.15, ease: 'power2.out' });

      // Transition colors to Spider-Man Crimson
      gsap.to(corners, {
        borderColor: cursorColorOnTarget,
        duration: 0.15,
        ease: 'power2.out',
      });
      if (dot) {
        gsap.to(dot, {
          backgroundColor: cursorColorOnTarget,
          scale: 1.1,
          duration: 0.15,
          ease: 'power2.out',
        });
      }

      // Initial smooth snap to target corners
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

      // Revert colors
      gsap.to(corners, {
        borderColor: cursorColor,
        duration: 0.2,
        ease: 'power2.out',
      });
      if (dot) {
        gsap.to(dot, {
          backgroundColor: '#dc2626',
          scale: 1,
          duration: 0.2,
          ease: 'power2.out',
        });
      }

      // Smoothly animate corners back to ambient square
      corners.forEach((corner, i) => {
        gsap.to(corner, {
          x: ambientPositions[i].x,
          y: ambientPositions[i].y,
          duration: 0.22,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      });

      // Resume ambient rotation
      const currentRot = (gsap.getProperty(cursor, 'rotation') as number) || 0;
      spinTl.current?.resume();
      gsap.to(cursor, {
        rotation: currentRot + 360,
        duration: spinDuration,
        ease: 'none',
      });
    };

    // Real-time animation ticker for continuous synchronization (handles scroll, tilt, layout shifts)
    const onTick = () => {
      const target = activeTargetRef.current;
      if (!target || !isLockedRef.current) return;

      // Check if target is still connected to document
      if (!target.isConnected) {
        unlockFromTarget();
        return;
      }

      const rect = target.getBoundingClientRect();
      // If target has zero size or scrolled completely offscreen
      if (
        rect.width === 0 ||
        rect.height === 0 ||
        rect.bottom < -100 ||
        rect.top > window.innerHeight + 100
      ) {
        unlockFromTarget();
        return;
      }

      // Current cursor position
      const curX = gsap.getProperty(cursor, 'x') as number;
      const curY = gsap.getProperty(cursor, 'y') as number;

      // Subtle parallax response to mouse position within target
      let parallaxX = 0;
      let parallaxY = 0;
      if (parallaxOn) {
        const targetCenterX = rect.left + rect.width / 2;
        const targetCenterY = rect.top + rect.height / 2;
        parallaxX = (curX - targetCenterX) * 0.035;
        parallaxY = (curY - targetCenterY) * 0.035;
      }

      // Calculate target corner coordinates relative to cursor wrapper
      const targetPoints = [
        {
          x: rect.left - borderWidth - curX + parallaxX,
          y: rect.top - borderWidth - curY + parallaxY,
        },
        {
          x: rect.right + borderWidth - cornerSize - curX + parallaxX,
          y: rect.top - borderWidth - curY + parallaxY,
        },
        {
          x: rect.right + borderWidth - cornerSize - curX + parallaxX,
          y: rect.bottom + borderWidth - cornerSize - curY + parallaxY,
        },
        {
          x: rect.left - borderWidth - curX + parallaxX,
          y: rect.bottom + borderWidth - cornerSize - curY + parallaxY,
        },
      ];

      // Instantly track during active lock to guarantee 100% scroll and tilt synchronization
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
        gsap.to(cursor, { opacity: 1, duration: 0.15 });
      }

      setCursorX(e.clientX);
      setCursorY(e.clientY);

      // Check element under mouse to determine target engagement
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

    // Scroll handler: update target engagement and keep lock intact
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

    // Mouse click feedback
    const handleMouseDown = () => {
      if (dot) gsap.to(dot, { scale: 0.7, duration: 0.15 });
      gsap.to(cursor, { scale: 0.92, duration: 0.12 });
    };

    const handleMouseUp = () => {
      if (dot) gsap.to(dot, { scale: isLockedRef.current ? 1.1 : 1, duration: 0.18 });
      gsap.to(cursor, { scale: 1, duration: 0.18 });
    };

    // Window boundaries: hide cursor when cursor leaves browser
    const handleMouseLeaveDoc = () => {
      isVisibleRef.current = false;
      gsap.to(cursor, { opacity: 0, duration: 0.15 });
      if (isLockedRef.current) unlockFromTarget();
    };

    const handleMouseEnterDoc = () => {
      isVisibleRef.current = true;
      gsap.to(cursor, { opacity: 1, duration: 0.15 });
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
      document.body.classList.remove('target-cursor-active');
    };
  }, [
    targetSelector,
    spinDuration,
    hideDefaultCursor,
    hoverDuration,
    parallaxOn,
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
      {/* 4 Optical Targeting Corner Brackets */}
      <div className="target-cursor-corner corner-tl" style={{ borderColor: cursorColor }} />
      <div className="target-cursor-corner corner-tr" style={{ borderColor: cursorColor }} />
      <div className="target-cursor-corner corner-br" style={{ borderColor: cursorColor }} />
      <div className="target-cursor-corner corner-bl" style={{ borderColor: cursorColor }} />
    </div>,
    document.body
  );
};

export default TargetCursor;
