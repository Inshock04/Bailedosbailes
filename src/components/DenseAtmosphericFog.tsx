import React, { useEffect, useRef, useState } from 'react';

export const DenseAtmosphericFog: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 768px)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    const handleViewportChange = () => setIsMobile(mediaQuery.matches);
    handleViewportChange();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleViewportChange);
      return () => mediaQuery.removeEventListener('change', handleViewportChange);
    }

    mediaQuery.addListener(handleViewportChange);
    return () => mediaQuery.removeListener(handleViewportChange);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    // On mobile, use quarter-resolution canvas for better GPU perf
    const dpr = isMobile ? 0.35 : 1;

    let animationFrameId: number;
    let width = (canvas.width = Math.round(window.innerWidth * dpr));
    let height = (canvas.height = Math.round(window.innerHeight * dpr));

    // Scale the canvas display to full size via CSS
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = Math.round(window.innerWidth * dpr);
      height = canvas.height = Math.round(window.innerHeight * dpr);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Fog puff particle class for rich, dense, volumetric rolling mist
    interface FogCloud {
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
      growth: number;
      layer: number; // 0: ground dense fog, 1: mid-level atmospheric mist, 2: street level crimson-tinged fog
    }

    const fogClouds: FogCloud[] = [];
    // Mobile: 6 particles. Desktop: ~24-38 particles
    const count = isMobile
      ? 6
      : Math.min(38, Math.max(24, Math.floor(window.innerWidth / 35)));

    const fogColors = [
      'rgba(18, 10, 28, ',    // Deep haunted violet-black shadow
      'rgba(35, 18, 50, ',    // Eerie night mist
      'rgba(65, 20, 35, ',    // Blood-moon tint mist
      'rgba(45, 25, 60, ',    // Atmospheric lavender smoke
      'rgba(15, 8, 22, ',     // Ground heavy smog
      'rgba(75, 15, 25, ',    // Crimson atmospheric haze
    ];

    const createCloud = (initialSpread = false): FogCloud => {
      const layer = Math.random() < 0.55 ? 0 : Math.random() < 0.85 ? 1 : 2;
      const color = fogColors[Math.floor(Math.random() * fogColors.length)];

      let yBase = height * 0.78; // Default: low ground street fog
      let radius = Math.random() * 90 + 75;
      let maxAlpha = Math.random() * 0.28 + 0.16;

      if (isMobile) {
        // Mobile: slightly larger particles to compensate for fewer count
        radius *= 1.3;
        maxAlpha *= 0.8;
      }

      if (layer === 0) {
        // Heavy low street fog
        yBase = height * 0.72 + Math.random() * (height * 0.3);
        radius = (Math.random() * 140 + 100) * (isMobile ? 1.2 : 1);
        maxAlpha = (Math.random() * 0.35 + 0.22) * (isMobile ? 0.7 : 1);
      } else if (layer === 1) {
        // Mid hotel facade rolling fog
        yBase = height * 0.48 + Math.random() * (height * 0.35);
        radius = (Math.random() * 110 + 85) * (isMobile ? 1.2 : 1);
        maxAlpha = (Math.random() * 0.22 + 0.12) * (isMobile ? 0.7 : 1);
      } else {
        // High atmospheric wisps
        yBase = height * 0.25 + Math.random() * (height * 0.3);
        radius = (Math.random() * 80 + 60) * (isMobile ? 1.2 : 1);
        maxAlpha = (Math.random() * 0.15 + 0.08) * (isMobile ? 0.7 : 1);
      }

      const vx = Math.random() * 0.45 + 0.22; // Drift from left to right

      return {
        x: initialSpread ? Math.random() * (width + 300) - 150 : -radius - 50,
        y: yBase + (Math.random() - 0.5) * 40,
        radius,
        vx: vx * (isMobile ? 0.7 : 1),
        vy: (Math.random() - 0.5) * 0.08,
        alpha: initialSpread ? Math.random() * maxAlpha : 0,
        maxAlpha,
        color,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.003,
        growth: (Math.random() - 0.5) * 0.03,
        layer,
      };
    };

    // Initialize cloud particles
    for (let i = 0; i < count; i++) {
      fogClouds.push(createCloud(true));
    }

    let time = 0;
    // Mobile: throttle to ~30fps instead of 60fps
    let lastFrame = 0;
    const frameBudget = isMobile ? 50 : 0; // ~20fps on mobile

    const render = (timestamp: number = 0) => {
      // Frame throttling on mobile
      if (isMobile && timestamp - lastFrame < frameBudget) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      lastFrame = timestamp;

      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Layer A: Constant dense ground gradient mist (The street level fog bed)
      const streetGrad = ctx.createLinearGradient(0, height, 0, height * 0.62);
      streetGrad.addColorStop(0, 'rgba(8, 4, 14, 0.75)');
      streetGrad.addColorStop(0.35, 'rgba(24, 10, 32, 0.45)');
      streetGrad.addColorStop(0.7, 'rgba(40, 10, 20, 0.2)');
      streetGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = streetGrad;
      ctx.fillRect(0, height * 0.62, width, height * 0.38);

      // Layer B: Subtle red-tinted ground glow from hotel marquee neon
      const neonFogGlow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.85,
        20,
        width * 0.5,
        height * 0.85,
        width * 0.6
      );
      neonFogGlow.addColorStop(0, 'rgba(180, 20, 40, 0.14)');
      neonFogGlow.addColorStop(0.6, 'rgba(100, 15, 40, 0.06)');
      neonFogGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = neonFogGlow;
      ctx.fillRect(0, height * 0.5, width, height * 0.5);

      // Layer C: Volumetric Rolling Clouds
      for (let i = 0; i < fogClouds.length; i++) {
        const cloud = fogClouds[i];

        cloud.x += cloud.vx;
        cloud.y += cloud.vy + Math.sin(time + i) * 0.12;
        cloud.rotation += cloud.vRot;
        cloud.radius += cloud.growth;

        // Fade in when entering from left, fade out when leaving to right
        if (cloud.x < width * 0.2) {
          const inProgress = Math.max(0, (cloud.x + cloud.radius) / (width * 0.2 + cloud.radius));
          cloud.alpha = inProgress * cloud.maxAlpha;
        } else if (cloud.x > width * 0.75) {
          const outProgress = Math.max(0, (width + cloud.radius - cloud.x) / (width * 0.25 + cloud.radius));
          cloud.alpha = outProgress * cloud.maxAlpha;
        } else {
          cloud.alpha = cloud.maxAlpha;
        }

        // Recycle cloud when fully moved past screen
        if (cloud.x - cloud.radius > width + 80) {
          fogClouds[i] = createCloud(false);
          continue;
        }

        // Draw soft feathered volumetric cloud puff
        ctx.save();
        ctx.translate(cloud.x, cloud.y);
        ctx.rotate(cloud.rotation);

        const radGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, cloud.radius);
        radGrad.addColorStop(0, `${cloud.color}${Math.max(0, cloud.alpha)})`);
        radGrad.addColorStop(0.4, `${cloud.color}${Math.max(0, cloud.alpha * 0.75)})`);
        radGrad.addColorStop(0.75, `${cloud.color}${Math.max(0, cloud.alpha * 0.35)})`);
        radGrad.addColorStop(1, `${cloud.color}0)`);

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(0, 0, cloud.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile]);

  if (isMobile) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden select-none">
      {/* Heavy atmospheric fog canvas layer — NO blur on mobile for GPU performance */}
      <canvas
        ref={canvasRef}
        className="w-full h-full pointer-events-none"
        style={{ filter: 'blur(3px)' }}
      />

      {/* Slow horizontal CSS drifting fog wave 1 */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-48 sm:h-64 pointer-events-none opacity-40 bg-gradient-to-t from-[#06030c]/90 via-[#260f38]/30 to-transparent animate-pulse" 
        style={{ animationDuration: '7s' }}
      />
    </div>
  );
};
