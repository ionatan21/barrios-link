import { useEffect, useRef } from "react";
import "./MouseTrailBackground.css";

const MAX_PARTICLES = 46;
const PARTICLE_SPACING = 18;
const IDLE_FADE_DELAY = 70;

export default function MouseTrailBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { alpha: true });
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!context || prefersReducedMotion) {
      return undefined;
    }

    const pointer = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      previousX: window.innerWidth / 2,
      previousY: window.innerHeight / 2,
      lastMoveAt: 0,
      hasMoved: false,
    };
    const follower = { x: pointer.x, y: pointer.y };
    const particles = [];
    let animationFrame = 0;
    let pixelRatio = 1;

    const resize = () => {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.6);
      canvas.width = Math.ceil(window.innerWidth * pixelRatio);
      canvas.height = Math.ceil(window.innerHeight * pixelRatio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const addParticle = (x, y, speed) => {
      particles.unshift({
        x,
        y,
        age: 0,
        radius: Math.min(48 + speed * 0.14, 88),
      });

      if (particles.length > MAX_PARTICLES) {
        particles.length = MAX_PARTICLES;
      }
    };

    const handlePointerMove = (event) => {
      const dx = event.clientX - pointer.previousX;
      const dy = event.clientY - pointer.previousY;
      const speed = Math.hypot(dx, dy);

      const steps = Math.max(1, Math.ceil(speed / PARTICLE_SPACING));

      for (let step = 1; step <= steps; step += 1) {
        const progress = step / steps;
        addParticle(
          pointer.previousX + dx * progress,
          pointer.previousY + dy * progress,
          speed,
        );
      }

      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.previousX = event.clientX;
      pointer.previousY = event.clientY;
      pointer.lastMoveAt = performance.now();
      pointer.hasMoved = true;
    };

    const drawParticle = (particle) => {
      const progress = particle.age;
      const opacity = Math.max(0, 1 - progress);
      const radius = particle.radius * (0.72 + progress * 0.42);
      const gradient = context.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        radius,
      );

      gradient.addColorStop(0, `rgba(255, 140, 0, ${0.34 * opacity})`);
      gradient.addColorStop(0.45, `rgba(255, 140, 0, ${0.16 * opacity})`);
      gradient.addColorStop(0.82, `rgba(255, 140, 0, ${0.07 * opacity})`);
      gradient.addColorStop(1, "rgba(255, 140, 0, 0)");

      context.fillStyle = gradient;
      context.beginPath();
      context.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
      context.fill();
    };

    const render = () => {
      const now = performance.now();
      const timeSinceMove = now - pointer.lastMoveAt;
      const isMoving = pointer.hasMoved && timeSinceMove < IDLE_FADE_DELAY;
      const ageStep = isMoving ? 0.024 : 0.068;

      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      context.globalCompositeOperation = "lighter";

      if (isMoving) {
        follower.x += (pointer.x - follower.x) * 0.18;
        follower.y += (pointer.y - follower.y) * 0.18;
      }

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.age += ageStep + index * 0.0012;

        if (particle.age >= 1) {
          particles.splice(index, 1);
        } else {
          drawParticle(particle);
        }
      }

      context.globalCompositeOperation = "source-over";
      animationFrame = window.requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    animationFrame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="mouse-trail-background"
      aria-hidden="true"
    />
  );
}
