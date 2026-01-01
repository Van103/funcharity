import { useEffect, useRef, useState, useCallback } from 'react';
import { useCursor } from '@/contexts/CursorContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Position {
  x: number;
  y: number;
}

interface TargetElement {
  x: number;
  y: number;
  width: number;
  height: number;
}

const FlyingAngel = () => {
  const { cursorType, particlesEnabled } = useCursor();
  const [position, setPosition] = useState<Position>({ x: -100, y: -100 });
  const [targetPos, setTargetPos] = useState<Position>({ x: -100, y: -100 });
  const [isIdle, setIsIdle] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [wingPhase, setWingPhase] = useState(0);
  
  const mouseRef = useRef<Position>({ x: 0, y: 0 });
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const flyIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef(0);

  // Get random interactive element to fly to
  const getRandomTarget = useCallback((): TargetElement | null => {
    const selectors = [
      'button:not([disabled])',
      'a[href]',
      '[role="button"]',
      '.cursor-pointer',
      'nav a',
      '.card',
      '[data-angel-target]'
    ];
    
    const elements = document.querySelectorAll(selectors.join(', '));
    const visibleElements: Element[] = [];
    
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (
        rect.width > 0 &&
        rect.height > 0 &&
        rect.top > 50 &&
        rect.bottom < window.innerHeight - 50 &&
        rect.left > 50 &&
        rect.right < window.innerWidth - 50
      ) {
        visibleElements.push(el);
      }
    });
    
    if (visibleElements.length === 0) return null;
    
    const randomEl = visibleElements[Math.floor(Math.random() * visibleElements.length)];
    const rect = randomEl.getBoundingClientRect();
    
    return {
      x: rect.left + rect.width / 2,
      y: rect.top - 20, // Hover above the element
      width: rect.width,
      height: rect.height
    };
  }, []);

  // Start idle flying behavior
  const startIdleMode = useCallback(() => {
    setIsIdle(true);
    setIsFlying(true);
    
    const flyToRandomTarget = () => {
      const target = getRandomTarget();
      if (target) {
        setDirection(target.x > position.x ? 'right' : 'left');
        setTargetPos({ x: target.x, y: target.y });
      }
    };
    
    flyToRandomTarget();
    
    // Fly to new target every 3-5 seconds
    flyIntervalRef.current = setInterval(() => {
      flyToRandomTarget();
    }, 3000 + Math.random() * 2000);
  }, [getRandomTarget, position.x]);

  // Stop idle mode
  const stopIdleMode = useCallback(() => {
    setIsIdle(false);
    setIsFlying(false);
    if (flyIntervalRef.current) {
      clearInterval(flyIntervalRef.current);
      flyIntervalRef.current = null;
    }
  }, []);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      
      // Reset idle timer
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      
      // Stop idle mode when mouse moves
      if (isIdle) {
        stopIdleMode();
      }
      
      // Update direction based on movement
      setDirection(e.clientX > position.x ? 'right' : 'left');
      setTargetPos({ x: e.clientX, y: e.clientY });
      
      // Start idle mode after 3 seconds of no movement
      idleTimerRef.current = setTimeout(() => {
        startIdleMode();
      }, 3000);
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (flyIntervalRef.current) clearInterval(flyIntervalRef.current);
    };
  }, [isIdle, position.x, startIdleMode, stopIdleMode]);

  // Smooth animation loop
  useEffect(() => {
    const animate = (time: number) => {
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;
      
      // Wing flapping animation
      setWingPhase(prev => (prev + delta * 0.01) % (Math.PI * 2));
      
      // Smooth follow with easing
      setPosition(prev => {
        const dx = targetPos.x - prev.x;
        const dy = targetPos.y - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Slower when idle (graceful flying), faster when following mouse
        const speed = isIdle ? 0.02 : 0.08;
        
        return {
          x: prev.x + dx * speed,
          y: prev.y + dy * speed + Math.sin(time * 0.003) * (isIdle ? 3 : 1) // Gentle bobbing
        };
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetPos, isIdle]);

  // Only show for 'angel' cursor type and when particles are enabled
  if (cursorType !== 'angel' || !particlesEnabled) return null;

  const wingFlap = Math.sin(wingPhase) * 15;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed pointer-events-none z-[9998]"
        style={{
          left: position.x - 24,
          top: position.y - 24,
          transform: `scaleX(${direction === 'left' ? -1 : 1})`,
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          rotate: isIdle ? [0, -5, 5, 0] : 0
        }}
        transition={{ 
          duration: 0.3,
          rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        {/* Glow effect */}
        <div 
          className="absolute inset-0 rounded-full blur-xl opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(147,51,234,0.2) 50%, transparent 70%)',
            width: 64,
            height: 64,
            transform: 'translate(-8px, -8px)'
          }}
        />
        
        {/* Flying Angel SVG */}
        <svg 
          width="48" 
          height="48" 
          viewBox="0 0 64 64" 
          className="drop-shadow-lg"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.5))'
          }}
        >
          <defs>
            <linearGradient id="wingGradFly" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="50%" stopColor="rgba(200,180,255,0.8)" />
              <stop offset="100%" stopColor="rgba(147,51,234,0.6)" />
            </linearGradient>
            <linearGradient id="dressGradFly" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#9333EA" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="hairGradFly" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          
          {/* Left Wing */}
          <g style={{ transform: `rotate(${-wingFlap}deg)`, transformOrigin: '32px 28px' }}>
            <ellipse
              cx="16"
              cy="26"
              rx="14"
              ry="18"
              fill="url(#wingGradFly)"
              opacity="0.9"
            />
            <ellipse
              cx="12"
              cy="24"
              rx="8"
              ry="12"
              fill="rgba(255,255,255,0.5)"
            />
            {/* Wing sparkles */}
            <circle cx="10" cy="20" r="1.5" fill="#FFD700" opacity="0.8" />
            <circle cx="18" cy="28" r="1" fill="#FFD700" opacity="0.6" />
            <circle cx="14" cy="18" r="1" fill="#FFF" opacity="0.7" />
          </g>
          
          {/* Right Wing */}
          <g style={{ transform: `rotate(${wingFlap}deg)`, transformOrigin: '32px 28px' }}>
            <ellipse
              cx="48"
              cy="26"
              rx="14"
              ry="18"
              fill="url(#wingGradFly)"
              opacity="0.9"
            />
            <ellipse
              cx="52"
              cy="24"
              rx="8"
              ry="12"
              fill="rgba(255,255,255,0.5)"
            />
            {/* Wing sparkles */}
            <circle cx="54" cy="20" r="1.5" fill="#FFD700" opacity="0.8" />
            <circle cx="46" cy="28" r="1" fill="#FFD700" opacity="0.6" />
            <circle cx="50" cy="18" r="1" fill="#FFF" opacity="0.7" />
          </g>
          
          {/* Hair */}
          <ellipse cx="32" cy="22" rx="8" ry="6" fill="url(#hairGradFly)" />
          
          {/* Head */}
          <circle cx="32" cy="22" r="6" fill="#FFDAB9" />
          
          {/* Face */}
          <circle cx="30" cy="21" r="1" fill="#4A3728" /> {/* Left eye */}
          <circle cx="34" cy="21" r="1" fill="#4A3728" /> {/* Right eye */}
          <path d="M30 24 Q32 26 34 24" stroke="#E8A0A0" strokeWidth="0.8" fill="none" /> {/* Smile */}
          
          {/* Halo */}
          <ellipse 
            cx="32" 
            cy="12" 
            rx="6" 
            ry="2" 
            fill="none" 
            stroke="#FFD700" 
            strokeWidth="2"
            opacity="0.9"
          />
          
          {/* Body */}
          <ellipse cx="32" cy="34" rx="4" ry="3" fill="#FFDAB9" />
          
          {/* Dress */}
          <path
            d="M26 36 Q32 34 38 36 L40 50 Q32 52 24 50 Z"
            fill="url(#dressGradFly)"
          />
          
          {/* Arms */}
          <ellipse cx="24" cy="38" rx="2" ry="4" fill="#FFDAB9" transform="rotate(-20 24 38)" />
          <ellipse cx="40" cy="38" rx="2" ry="4" fill="#FFDAB9" transform="rotate(20 40 38)" />
          
          {/* Legs */}
          <ellipse cx="29" cy="54" rx="2" ry="5" fill="#FFDAB9" />
          <ellipse cx="35" cy="54" rx="2" ry="5" fill="#FFDAB9" />
          
          {/* Feet */}
          <ellipse cx="29" cy="58" rx="2.5" ry="1.5" fill="#F8B4D9" />
          <ellipse cx="35" cy="58" rx="2.5" ry="1.5" fill="#F8B4D9" />
        </svg>
        
        {/* Sparkle trail */}
        {isFlying && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)',
                  left: -10 - i * 8,
                  top: 20 + Math.sin(wingPhase + i) * 5,
                }}
                animate={{
                  opacity: [0.8, 0.3, 0.8],
                  scale: [1, 0.5, 1],
                }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  repeat: Infinity,
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default FlyingAngel;
