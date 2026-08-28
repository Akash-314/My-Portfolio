import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface SpiderWebBackgroundProps {
  onSpiderSenseTrigger?: (active: boolean) => void;
}

export const SpiderWebBackground: React.FC<SpiderWebBackgroundProps> = ({ onSpiderSenseTrigger }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initWeb();
    };

    window.addEventListener('resize', handleResize);

    let nodes: Node[] = [];
    const nodeCount = Math.min(Math.floor((width * height) / 22000), 50);

    const initWeb = () => {
      nodes = [];
      const centerX = width / 2;
      const centerY = height * 0.38;
      const rings = 4;

      nodes.push({
        x: centerX,
        y: centerY,
        originX: centerX,
        originY: centerY,
        vx: 0,
        vy: 0,
        radius: 2.5,
        color: '#ef4444'
      });

      for (let r = 1; r <= rings; r++) {
        const radius = r * (Math.min(width, height) / (rings * 2.5));
        const pointsInRing = 6 + r * 2;
        for (let i = 0; i < pointsInRing; i++) {
          const angle = (i / pointsInRing) * Math.PI * 2;
          const nx = centerX + Math.cos(angle) * radius;
          const ny = centerY + Math.sin(angle) * radius;
          const isRed = (i + r) % 3 === 0;

          nodes.push({
            x: nx,
            y: ny,
            originX: nx,
            originY: ny,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            radius: isRed ? 2 : 1.5,
            color: isRed ? '#ef4444' : '#3b82f6'
          });
        }
      }

      for (let i = 0; i < nodeCount; i++) {
        const nx = Math.random() * width;
        const ny = Math.random() * height;
        nodes.push({
          x: nx,
          y: ny,
          originX: nx,
          originY: ny,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: 1.5,
          color: Math.random() > 0.5 ? '#ef4444' : '#3b82f6'
        });
      }
    };

    initWeb();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
      mouseRef.current.active = false;
      if (onSpiderSenseTrigger) onSpiderSenseTrigger(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    let spiderSenseActive = false;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const maxDistance = 140;
      let closeNodesCount = 0;

      nodes.forEach((node) => {
        if (!prefersReducedMotion) {
          node.x += node.vx;
          node.y += node.vy;

          const dxOrigin = node.originX - node.x;
          const dyOrigin = node.originY - node.y;
          node.x += dxOrigin * 0.02;
          node.y += dyOrigin * 0.02;

          const dxMouse = mx - node.x;
          const dyMouse = my - node.y;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

          if (distMouse < maxDistance) {
            closeNodesCount++;
            const force = (maxDistance - distMouse) / maxDistance;
            node.x -= (dxMouse / distMouse) * force * 10;
            node.y -= (dyMouse / distMouse) * force * 10;
          }
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = 0.5;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      const isSensingNow = closeNodesCount > 4;
      if (isSensingNow !== spiderSenseActive) {
        spiderSenseActive = isSensingNow;
        if (onSpiderSenseTrigger) {
          onSpiderSenseTrigger(isSensingNow);
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxConnectDist = 120;
          if (dist < maxConnectDist) {
            const alpha = (1 - dist / maxConnectDist) * 0.14;

            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = (i + j) % 2 === 0 ? `rgba(239, 68, 68, ${alpha})` : `rgba(59, 130, 246, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [onSpiderSenseTrigger]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-60"
    />
  );
};
