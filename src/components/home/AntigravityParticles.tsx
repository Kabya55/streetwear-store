'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  isAccent: boolean;
  angle: number;
  speed: number;
}

export default function AntigravityParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let isDark = document.documentElement.classList.contains('dark');

    // Watch for theme class changes on <html>
    const themeObserver = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains('dark');
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    const particles: Particle[] = [];
    const mouse = {
      x: -9999,
      y: -9999,
      radius: 140,
    };

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      initParticles();
    };

    const initParticles = () => {
      particles.length = 0;
      // Responsive particle count
      const count = Math.min(Math.floor((width * height) / 14000), 85);

      for (let i = 0; i < count; i++) {
        const isAccent = Math.random() < 0.22; // 22% red accent particles
        const baseRadius = isAccent ? Math.random() * 2 + 2 : Math.random() * 1.8 + 1.2;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: -Math.random() * 0.4 - 0.15, // Gentle upward anti-gravity drift
          radius: baseRadius,
          baseRadius,
          isAccent,
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.02 + 0.008,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    // Click impulse (anti-gravity burst)
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      particles.forEach((p) => {
        const dx = p.x - clickX;
        const dy = p.y - clickY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 0) {
          const force = (200 - dist) / 20;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      });
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connecting lines between close particles
      const maxDist = 110;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (isDark ? 0.12 : 0.08);
            if (p1.isAccent || p2.isAccent) {
              ctx.strokeStyle = `rgba(229, 9, 20, ${alpha * 1.5})`;
            } else {
              ctx.strokeStyle = isDark
                ? `rgba(255, 255, 255, ${alpha})`
                : `rgba(20, 20, 25, ${alpha})`;
            }
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      particles.forEach((p) => {
        // Natural anti-gravity wave motion
        p.angle += p.speed;
        p.x += p.vx + Math.cos(p.angle) * 0.25;
        p.y += p.vy + Math.sin(p.angle) * 0.2;

        // Friction towards baseline speed
        p.vx *= 0.98;
        if (Math.abs(p.vx) < 0.15) p.vx = (Math.random() - 0.5) * 0.4;

        // Mouse repelling interaction
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          p.x += Math.cos(angle) * force * 4.5;
          p.y += Math.sin(angle) * force * 4.5;
          p.radius = p.baseRadius * 1.3;
        } else {
          p.radius += (p.baseRadius - p.radius) * 0.1;
        }

        // Screen boundary wrap (continuous liftoff)
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.y > height + 10) p.y = -10;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        if (p.isAccent) {
          // Streetwear Red Accent particle
          ctx.fillStyle = isDark
            ? 'rgba(229, 9, 20, 0.85)'
            : 'rgba(229, 9, 20, 0.75)';
          ctx.shadowColor = 'rgba(229, 9, 20, 0.4)';
          ctx.shadowBlur = 8;
        } else {
          // Neutral particles
          ctx.fillStyle = isDark
            ? 'rgba(255, 255, 255, 0.5)'
            : 'rgba(17, 24, 39, 0.35)';
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }

        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleClick);

    handleResize();
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      themeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto w-full h-full z-0 cursor-default"
      aria-hidden="true"
    />
  );
}
