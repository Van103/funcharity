import { useEffect, useRef, useState, useCallback } from 'react';
import { useMotion } from '@/contexts/MotionContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

const CustomCursor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const { reduceMotion } = useMotion();
  const [isVisible, setIsVisible] = useState(false);

  const createParticle = useCallback((x: number, y: number): Particle => {
    return {
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 2 + 1,
      life: 1,
      maxLife: 60 + Math.random() * 30,
      size: 4 + Math.random() * 4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
    };
  }, []);

  const drawDiamond = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    rotation: number,
    alpha: number
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.6, 0);
    ctx.lineTo(0, size);
    ctx.lineTo(-size * 0.6, 0);
    ctx.closePath();
    
    const gradient = ctx.createLinearGradient(-size, -size, size, size);
    gradient.addColorStop(0, `rgba(201, 162, 61, ${alpha})`);
    gradient.addColorStop(0.5, `rgba(255, 215, 100, ${alpha})`);
    gradient.addColorStop(1, `rgba(201, 162, 61, ${alpha * 0.7})`);
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
    
    ctx.restore();
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate mouse movement distance
    const dx = mouseRef.current.x - lastMouseRef.current.x;
    const dy = mouseRef.current.y - lastMouseRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Spawn particles based on movement
    if (distance > 5 && !reduceMotion) {
      const particleCount = Math.min(Math.floor(distance / 10), 3);
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(
          createParticle(
            mouseRef.current.x + (Math.random() - 0.5) * 10,
            mouseRef.current.y + (Math.random() - 0.5) * 10
          )
        );
      }
    }

    lastMouseRef.current = { ...mouseRef.current };

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.05; // gravity
      particle.rotation += particle.rotationSpeed;
      particle.life -= 1 / particle.maxLife;

      if (particle.life > 0) {
        const alpha = particle.life * 0.8;
        drawDiamond(ctx, particle.x, particle.y, particle.size, particle.rotation, alpha);
        return true;
      }
      return false;
    });

    // Limit particles for performance
    if (particlesRef.current.length > 50) {
      particlesRef.current = particlesRef.current.slice(-50);
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [createParticle, drawDiamond, reduceMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  if (reduceMotion) return null;

  return (
    <>
      <style>{`
        body {
          cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cg fill='none'%3E%3C!-- Body --%3E%3Cellipse cx='16' cy='18' rx='5' ry='7' fill='%236B21A8'/%3E%3C!-- Head --%3E%3Ccircle cx='16' cy='9' r='5' fill='%239333EA'/%3E%3C!-- Halo --%3E%3Cellipse cx='16' cy='3' rx='4' ry='1' stroke='%23C9A23D' stroke-width='1.5' fill='none'/%3E%3C!-- Left Wing --%3E%3Cpath d='M11 14 C6 10 4 14 6 18 C8 22 11 20 11 18' fill='%23A855F7' opacity='0.9'/%3E%3C!-- Right Wing --%3E%3Cpath d='M21 14 C26 10 28 14 26 18 C24 22 21 20 21 18' fill='%23A855F7' opacity='0.9'/%3E%3C!-- Eyes --%3E%3Ccircle cx='14' cy='8' r='1' fill='white'/%3E%3Ccircle cx='18' cy='8' r='1' fill='white'/%3E%3C!-- Smile --%3E%3Cpath d='M14 11 Q16 13 18 11' stroke='%23C9A23D' stroke-width='1' fill='none' stroke-linecap='round'/%3E%3C/g%3E%3C/svg%3E") 16 16, auto;
        }
        
        a, button, [role="button"], input, textarea, select, [tabindex]:not([tabindex="-1"]) {
          cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cg fill='none'%3E%3C!-- Body --%3E%3Cellipse cx='16' cy='18' rx='5' ry='7' fill='%23C9A23D'/%3E%3C!-- Head --%3E%3Ccircle cx='16' cy='9' r='5' fill='%23D4AF37'/%3E%3C!-- Halo --%3E%3Cellipse cx='16' cy='3' rx='4' ry='1' stroke='%23FFD700' stroke-width='1.5' fill='none'/%3E%3C!-- Left Wing --%3E%3Cpath d='M11 14 C6 10 4 14 6 18 C8 22 11 20 11 18' fill='%23F5D742' opacity='0.9'/%3E%3C!-- Right Wing --%3E%3Cpath d='M21 14 C26 10 28 14 26 18 C24 22 21 20 21 18' fill='%23F5D742' opacity='0.9'/%3E%3C!-- Eyes --%3E%3Ccircle cx='14' cy='8' r='1' fill='white'/%3E%3Ccircle cx='18' cy='8' r='1' fill='white'/%3E%3C!-- Smile --%3E%3Cpath d='M14 11 Q16 13 18 11' stroke='%236B21A8' stroke-width='1' fill='none' stroke-linecap='round'/%3E%3C/g%3E%3C/svg%3E") 16 16, pointer;
        }
      `}</style>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9999]"
        style={{ opacity: isVisible ? 1 : 0 }}
      />
    </>
  );
};

export default CustomCursor;
