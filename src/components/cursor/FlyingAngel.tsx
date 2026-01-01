import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useCursor } from '@/contexts/CursorContext';
import { motion } from 'framer-motion';

// Danh sách các tiên nữ
const FAIRY_IMAGES = [
  '/cursors/fairy-pink.png',
  '/cursors/fairy-yellow.png', 
  '/cursors/fairy-purple.png',
];

interface Position {
  x: number;
  y: number;
}

const FlyingAngel = () => {
  const { cursorType, particlesEnabled } = useCursor();
  
  // Random chọn 1 tiên nữ khi component mount
  const selectedFairy = useMemo(() => {
    return FAIRY_IMAGES[Math.floor(Math.random() * FAIRY_IMAGES.length)];
  }, []);
  
  const [position, setPosition] = useState<Position>({ x: -100, y: -100 });
  const [targetPos, setTargetPos] = useState<Position>({ x: -100, y: -100 });
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [wingPhase, setWingPhase] = useState(0);
  
  const animationRef = useRef<number>();
  const lastTimeRef = useRef(0);

  // Check if this is an angel cursor type
  const isAngelCursor = cursorType.startsWith('angel');

  // Cursor hiding is now handled by CursorContext

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setDirection(e.clientX > position.x ? 'right' : 'left');
      setTargetPos({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [position.x]);

  // Smooth animation loop
  useEffect(() => {
    const animate = (time: number) => {
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;
      
      // Wing flapping animation
      setWingPhase(prev => (prev + delta * 0.015) % (Math.PI * 2));
      
      // Smooth follow cursor
      setPosition(prev => {
        const dx = targetPos.x - prev.x;
        const dy = targetPos.y - prev.y;
        
        // Tốc độ theo sát chuột
        const speed = 0.6;
        
        const newX = prev.x + dx * speed;
        const newY = prev.y + dy * speed;
        
        return { x: newX, y: newY };
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetPos]);

  // Only show for angel cursor types and when particles are enabled
  if (!isAngelCursor) return null;

  const wingFlap = Math.sin(wingPhase) * 12;

  return (
    <motion.div
      className="fixed pointer-events-none z-[9999]"
      style={{
        left: position.x - 40,
        top: position.y - 25,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        style={{
          width: 70,
          height: 70,
          transform: `scaleX(${direction === 'left' ? -1 : 1})`,
        }}
        animate={{
          rotate: [wingFlap * 0.12, -wingFlap * 0.12],
          y: [0, -2, 0, 2, 0],
        }}
        transition={{
          rotate: { 
            duration: 0.1, 
            repeat: Infinity,
            ease: "easeInOut"
          },
          y: { duration: 0.2, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <motion.img 
          src={selectedFairy}
          alt="Fairy Cursor"
          className="w-full h-full object-contain"
          animate={{
            scaleY: [1, 1.01, 1, 0.99, 1],
            scaleX: [1, 1 + Math.abs(wingFlap) * 0.002, 1],
          }}
          transition={{
            scaleY: { 
              duration: 0.12, 
              repeat: Infinity, 
              ease: "easeInOut" 
            },
            scaleX: {
              duration: 0.1,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          draggable={false}
        />
      </motion.div>
    </motion.div>
  );
};

export default FlyingAngel;
