import React, { useEffect, useRef } from 'react';
import { SPIDER_EFFECTS_CONFIG } from '../../config/spiderEffectsConfig';

interface WebNode {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
}

interface TargetAnchor {
  x: number;
  y: number;
  rect: DOMRect;
}

export const GlobalWebNetwork: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check touch and reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0);

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Initialize sparse nodes
    const nodeCount = isTouch
      ? SPIDER_EFFECTS_CONFIG.WEB_NODE_COUNT_MOBILE
      : SPIDER_EFFECTS_CONFIG.WEB_NODE_COUNT_DESKTOP;

    const nodes: WebNode[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      nodes.push({
        x,
        y,
        originX: x,
        originY: y,
        vx: (Math.random() - 0.5) * SPIDER_EFFECTS_CONFIG.WEB_DRIFT_SPEED,
        vy: (Math.random() - 0.5) * SPIDER_EFFECTS_CONFIG.WEB_DRIFT_SPEED,
        radius: Math.random() * 1.2 + 1,
        baseAlpha: Math.random() * 0.15 + 0.1
      });
    }

    // Cache interactive target anchors periodically (every 1.5s to prevent per-frame getBoundingClientRect)
    let cachedAnchors: TargetAnchor[] = [];
    const updateTargetAnchors = () => {
      const elements = document.querySelectorAll(
        '[data-web-target], .spydyy-card, [data-interactive]'
      );
      const anchors: TargetAnchor[] = [];
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Only consider elements currently visible in viewport
        if (
          rect.bottom > 0 &&
          rect.top < window.innerHeight &&
          rect.right > 0 &&
          rect.left < window.innerWidth
        ) {
          anchors.push({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            rect
          });
        }
      });
      cachedAnchors = anchors;
    };

    updateTargetAnchors();
    const anchorInterval = setInterval(updateTargetAnchors, 1200);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      updateTargetAnchors();
    };

    const handlePointerMove = (e: PointerEvent) => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
      cursorRef.current.active = true;
    };

    const handlePointerLeave = () => {
      cursorRef.current.active = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave, { passive: true });

    // Main animation loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cursor = cursorRef.current;
      const {
        WEB_CONNECTION_DISTANCE,
        WEB_REACTION_RADIUS,
        WEB_REACTION_STRENGTH,
        WEB_LINE_MAX_DISTANCE,
        WEB_LINE_CURVE_FACTOR
      } = SPIDER_EFFECTS_CONFIG;

      // 1. Update and draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (!prefersReducedMotion) {
          // Slow ambient drift
          node.originX += node.vx;
          node.originY += node.vy;

          if (node.originX < 0 || node.originX > width) node.vx *= -1;
          if (node.originY < 0 || node.originY > height) node.vy *= -1;

          // Cursor displacement calculation
          let targetX = node.originX;
          let targetY = node.originY;

          if (cursor.active && !isTouch) {
            const dx = cursor.x - node.originX;
            const dy = cursor.y - node.originY;
            const dist = Math.hypot(dx, dy);

            if (dist < WEB_REACTION_RADIUS) {
              const pull = (1 - dist / WEB_REACTION_RADIUS) * WEB_REACTION_STRENGTH;
              targetX += (dx / dist) * pull;
              targetY += (dy / dist) * pull;
            }
          }

          // Smooth lerp
          node.x += (targetX - node.x) * 0.08;
          node.y += (targetY - node.y) * 0.08;
        }

        // Draw node
        let nodeAlpha = node.baseAlpha;
        if (cursor.active && !isTouch) {
          const distToCursor = Math.hypot(cursor.x - node.x, cursor.y - node.y);
          if (distToCursor < WEB_REACTION_RADIUS) {
            nodeAlpha += (1 - distToCursor / WEB_REACTION_RADIUS) * 0.35;
          }
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(185, 28, 28, ${Math.min(nodeAlpha, 0.7)})`;
        ctx.fill();
      }

      // 2. Draw connecting web lines between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.hypot(dx, dy);

          if (dist < WEB_CONNECTION_DISTANCE) {
            let lineAlpha = (1 - dist / WEB_CONNECTION_DISTANCE) * 0.12;

            // Brighten lines near cursor
            if (cursor.active && !isTouch) {
              const midX = (n1.x + n2.x) / 2;
              const midY = (n1.y + n2.y) / 2;
              const distToCursor = Math.hypot(cursor.x - midX, cursor.y - midY);
              if (distToCursor < WEB_REACTION_RADIUS) {
                lineAlpha += (1 - distToCursor / WEB_REACTION_RADIUS) * 0.18;
              }
            }

            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(156, 163, 175, ${Math.min(lineAlpha, 0.35)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // 3. Web-line cursor connection to nearest interactive element
      if (cursor.active && !isTouch && !prefersReducedMotion && cachedAnchors.length > 0) {
        let nearestAnchor: TargetAnchor | null = null;
        let nearestDist = Infinity;
        let attachX = 0;
        let attachY = 0;

        for (let i = 0; i < cachedAnchors.length; i++) {
          const anchor = cachedAnchors[i];
          const rect = anchor.rect;

          // Clamp cursor to find closest point on rectangle boundary
          const closestX = Math.max(rect.left, Math.min(cursor.x, rect.right));
          const closestY = Math.max(rect.top, Math.min(cursor.y, rect.bottom));
          const edgeDist = Math.hypot(cursor.x - closestX, cursor.y - closestY);

          if (edgeDist < nearestDist && edgeDist < WEB_LINE_MAX_DISTANCE && edgeDist > 5) {
            nearestDist = edgeDist;
            nearestAnchor = anchor;
            attachX = closestX;
            attachY = closestY;
          }
        }

        if (nearestAnchor && nearestDist < WEB_LINE_MAX_DISTANCE) {
          const progress = 1 - nearestDist / WEB_LINE_MAX_DISTANCE;
          const alpha = progress * 0.45;

          // Draw thin curved web strand with subtle sag
          const midX = (attachX + cursor.x) / 2;
          const midY = (attachY + cursor.y) / 2;
          const perpX = -(cursor.y - attachY) * WEB_LINE_CURVE_FACTOR;
          const perpY = (cursor.x - attachX) * WEB_LINE_CURVE_FACTOR;
          const ctrlX = midX + perpX;
          const ctrlY = midY + perpY;

          // Outer strand
          ctx.beginPath();
          ctx.moveTo(attachX, attachY);
          ctx.quadraticCurveTo(ctrlX, ctrlY, cursor.x, cursor.y);
          ctx.strokeStyle = `rgba(185, 28, 28, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Tiny anchor node
          ctx.beginPath();
          ctx.arc(attachX, attachY, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(185, 28, 28, ${alpha * 1.2})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(anchorInterval);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1] select-none"
      aria-hidden="true"
    />
  );
};
