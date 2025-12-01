import { useEffect, useRef } from 'react';

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
  gravity: number;
  life: number;
  drag: number;
}

export function useConfetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);

  useEffect(() => {
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (canvasRef.current) {
        document.body.removeChild(canvasRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const createParticles = (count: number, originX: number, originY: number) => {
    // Neobrutalistic colors: bright cyan, pink, lime, yellow
    const colors = ['#00D9FF', '#FF006E', '#CCFF00', '#FFD60A'];
    const particles: ConfettiParticle[] = [];

    for (let i = 0; i < count; i++) {
      // Wider spread angle for better coverage
      const angle = Math.random() * Math.PI * 2;
      // Increased velocity range for more dynamic movement
      const velocity = Math.random() * 15 + 8;
      
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - Math.random() * 8,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        gravity: 0.4 + Math.random() * 0.3,
        life: 1,
        drag: 0.98, // Air resistance for more natural movement
      });
    }

    return particles;
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particlesRef.current = particlesRef.current.filter((particle) => {
      // Apply drag for more natural deceleration
      particle.vx *= particle.drag;
      particle.vy *= particle.drag;
      
      // Update particle position
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += particle.gravity;
      particle.rotation += particle.rotationSpeed;
      
      // Slower fade out for longer visibility
      particle.life -= 0.008;

      if (particle.life <= 0 || particle.y > canvas.height + 50) {
        return false;
      }

      // Draw particle
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate((particle.rotation * Math.PI) / 180);
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      
      // Draw rectangle confetti
      ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
      
      ctx.restore();

      return true;
    });

    if (particlesRef.current.length > 0) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  };

  const triggerConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Increased particle counts for more dramatic effect
    // Create multiple bursts from different positions for better coverage
    const burst1 = createParticles(120, canvas.width * 0.2, canvas.height * 0.3);
    const burst2 = createParticles(120, canvas.width * 0.8, canvas.height * 0.3);
    const burst3 = createParticles(80, canvas.width * 0.5, canvas.height * 0.2);
    const burst4 = createParticles(60, canvas.width * 0.35, canvas.height * 0.25);
    const burst5 = createParticles(60, canvas.width * 0.65, canvas.height * 0.25);

    particlesRef.current = [...particlesRef.current, ...burst1, ...burst2, ...burst3, ...burst4, ...burst5];

    if (animationFrameRef.current === null) {
      animate();
    }
  };

  return { triggerConfetti };
}
