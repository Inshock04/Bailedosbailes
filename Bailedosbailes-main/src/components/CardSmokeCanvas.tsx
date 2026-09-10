import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  maxAlpha: number;
  color: string;
  rotation: number;
  vRot: number;
  life: number;
  maxLife: number;
}

export const CardSmokeCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 220);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 120);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width && entry.contentRect.height) {
          width = canvas.width = Math.round(entry.contentRect.width);
          height = canvas.height = Math.round(entry.contentRect.height);
        }
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const smokeColors = [
      'rgba(88, 28, 135, ',   // Deep purple/violet
      'rgba(185, 28, 28, ',   // Dark crimson
      'rgba(15, 7, 26, ',     // Dark shadowy mist
      'rgba(147, 51, 234, ',  // Neon purple glow
      'rgba(239, 68, 68, ',   // Blood red glow
    ];

    const particles: Particle[] = [];
    // Mobile: 4 particles. Desktop: 22 particles
    const maxParticles = isMobile ? 4 : 22;

    const createParticle = (initialRandomY = false): Particle => {
      const colorBase = smokeColors[Math.floor(Math.random() * smokeColors.length)];
      return {
        x: Math.random() * width,
        y: initialRandomY ? Math.random() * height : height + Math.random() * 15,
        radius: Math.random() * 18 + 14,
        vx: (Math.random() - 0.5) * 0.45,
        vy: -(Math.random() * 0.35 + 0.15),
        alpha: 0,
        maxAlpha: Math.random() * 0.22 + 0.08,
        color: colorBase,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.015,
        life: initialRandomY ? Math.random() * 100 : 0,
        maxLife: Math.random() * 140 + 100,
      };
    };

    // Seed initial particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(true));
    }

    // Mobile: throttle to ~30fps
    let lastFrame = 0;
    const frameBudget = isMobile ? 50 : 0;

    const render = (timestamp: number = 0) => {
      if (isMobile && timestamp - lastFrame < frameBudget) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      lastFrame = timestamp;

      ctx.clearRect(0, 0, width, height);

      // Add gentle bottom gradient baseline
      const baseGrad = ctx.createLinearGradient(0, height, 0, height - 35);
      baseGrad.addColorStop(0, 'rgba(127, 29, 29, 0.15)');
      baseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, height - 35, width, 35);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;
        p.life++;
        p.radius += 0.06; // Expands as it dissipates

        // Calculate fade-in and fade-out alpha curve
        const progress = p.life / p.maxLife;
        if (progress < 0.25) {
          p.alpha = (progress / 0.25) * p.maxAlpha;
        } else {
          p.alpha = (1 - (progress - 0.25) / 0.75) * p.maxAlpha;
        }

        if (p.life >= p.maxLife || p.y < -p.radius || p.x < -p.radius || p.x > width + p.radius) {
          particles[i] = createParticle(false);
          continue;
        }

        // Draw soft radial gradient smoke puff
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.radius);
        grad.addColorStop(0, `${p.color}${Math.max(0, p.alpha)})`);
        grad.addColorStop(0.55, `${p.color}${Math.max(0, p.alpha * 0.55)})`);
        grad.addColorStop(1, `${p.color}0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none select-none ${className}`}
      style={{ filter: window.matchMedia('(max-width: 768px)').matches ? 'none' : 'blur(1px)' }}
    />
  );
};
