import React, { useEffect, useRef } from 'react';

export const FuturisticBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Smooth lerp mouse tracking
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      active: false,
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    // Particle nodes configuration with silky smooth speeds
    const particleCount = Math.min(Math.floor((width * height) / 20000), 70);
    const particles = [];

    const colors = [
      'rgba(34, 211, 238, ',   // cyan
      'rgba(56, 189, 248, ',   // sky blue
      'rgba(129, 140, 248, ',  // indigo
      'rgba(168, 85, 247, ',   // purple
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 1.5 + 0.8,
        colorPrefix: colors[Math.floor(Math.random() * colors.length)],
        baseAlpha: Math.random() * 0.35 + 0.15,
        pulseSpeed: Math.random() * 0.012 + 0.004,
        pulseAngle: Math.random() * Math.PI * 2,
      });
    }

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Draw constellation connections
      const maxDistance = 140;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.14;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw mouse interaction attraction
      if (mouse.active) {
        const mouseRadius = 180;
        for (let i = 0; i < particles.length; i++) {
          const dx = mouse.x - particles[i].x;
          const dy = mouse.y - particles[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseRadius) {
            const alpha = (1 - dist / mouseRadius) * 0.2;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();

            // Silky smooth gentle magnetic drift
            particles[i].x += dx * 0.0012;
            particles[i].y += dy * 0.0012;
          }
        }
      }

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        // Soft boundary wrapping
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Gentle sine pulsing
        p.pulseAngle += p.pulseSpeed;
        const currentAlpha = p.baseAlpha + Math.sin(p.pulseAngle) * 0.12;

        // Core particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorPrefix}${Math.max(0.05, currentAlpha)})`;
        ctx.fill();

        // Subtle glowing aura
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorPrefix}${Math.max(0.01, currentAlpha * 0.2)})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      id="futuristic-background"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black"
    >
      {/* Dynamic Smooth Canvas Particle Network */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-75" />

      {/* Deep Ambient Glow Orbs */}
      <div className="absolute -top-40 -left-40 w-[650px] h-[650px] bg-cyan-950/25 rounded-full blur-[170px] animate-float-slow pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[700px] h-[700px] bg-indigo-950/20 rounded-full blur-[190px] animate-float-slow pointer-events-none" style={{ animationDelay: '-5s' }} />
      <div className="absolute -bottom-40 left-1/4 w-[650px] h-[650px] bg-blue-950/20 rounded-full blur-[180px] animate-float-slow pointer-events-none" style={{ animationDelay: '-9s' }} />

      {/* Robot Backdrop Soft Ambient Cyan Halo Glow */}
      <div className="absolute top-1/4 right-5 sm:right-20 lg:right-[15%] w-[480px] h-[480px] bg-cyan-500/10 rounded-full blur-[140px] animate-pulse pointer-events-none" style={{ animationDuration: '7s' }} />

      {/* Top-Left Animated Subtle HUD Technical Rings */}
      <div className="absolute -top-32 -left-32 w-96 h-96 opacity-30 text-cyan-400 pointer-events-none">
        <svg className="w-full h-full animate-spin-slow" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 8" />
          <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="0.3" opacity="0.5" />
          <line x1="100" y1="5" x2="100" y2="22" stroke="currentColor" strokeWidth="0.8" />
          <line x1="100" y1="178" x2="100" y2="195" stroke="currentColor" strokeWidth="0.8" />
          <line x1="5" y1="100" x2="22" y2="100" stroke="currentColor" strokeWidth="0.8" />
          <line x1="178" y1="100" x2="195" y2="100" stroke="currentColor" strokeWidth="0.8" />
        </svg>
        <svg className="absolute inset-0 w-full h-full animate-spin-reverse-slow opacity-50" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="0.4" strokeDasharray="10 14" />
        </svg>
      </div>

      {/* Bottom-Right Animated Subtle HUD Technical Rings */}
      <div className="absolute -bottom-48 -right-48 w-[34rem] h-[34rem] opacity-25 text-cyan-400 pointer-events-none">
        <svg className="w-full h-full animate-spin-slow" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="0.6" />
          <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.4" strokeDasharray="5 9" />
          <circle cx="100" cy="100" r="65" stroke="currentColor" strokeWidth="0.3" strokeDasharray="18 12" />
        </svg>
      </div>
    </div>
  );
};


