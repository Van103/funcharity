import { useState, useRef, useCallback, ReactNode, useEffect } from "react";
import { motion, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { RefreshCw, ArrowDown, Check } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
}

type RefreshState = "idle" | "pulling" | "ready" | "refreshing" | "complete";

export function PullToRefresh({ 
  onRefresh, 
  children, 
  threshold = 100 
}: PullToRefreshProps) {
  const [state, setState] = useState<RefreshState>("idle");
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  // Smooth spring animation for pull distance
  const springConfig = { damping: 30, stiffness: 400, mass: 0.8 };
  const animatedY = useSpring(0, springConfig);
  
  // Transform for indicator scale and rotation
  const progress = Math.min(pullDistance / threshold, 1);
  const indicatorScale = useTransform(animatedY, [0, threshold], [0.6, 1]);
  const indicatorOpacity = useTransform(animatedY, [0, 20, threshold], [0, 1, 1]);

  useEffect(() => {
    if (state === "refreshing") {
      animatedY.set(threshold);
    } else if (state === "complete" || state === "idle") {
      animatedY.set(0);
    } else {
      animatedY.set(pullDistance);
    }
  }, [pullDistance, state, animatedY, threshold]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only allow pull-to-refresh when scrolled to top
    if (containerRef.current && containerRef.current.scrollTop <= 0 && state === "idle") {
      startY.current = e.touches[0].clientY;
      currentY.current = e.touches[0].clientY;
      setState("pulling");
    }
  }, [state]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (state !== "pulling" && state !== "ready") return;
    
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    
    if (diff > 0) {
      // Apply exponential resistance for more natural feel
      const resistance = Math.pow(0.9, diff / 100);
      const distance = diff * resistance * 0.5;
      const clampedDistance = Math.min(distance, threshold * 1.5);
      
      setPullDistance(clampedDistance);
      
      // Update state based on threshold
      if (clampedDistance >= threshold && state !== "ready") {
        setState("ready");
        // Haptic feedback simulation via slight vibration
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      } else if (clampedDistance < threshold && state === "ready") {
        setState("pulling");
      }
    }
  }, [state, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (state === "ready") {
      setState("refreshing");
      
      try {
        await onRefresh();
        setState("complete");
        // Show complete state briefly
        await new Promise(resolve => setTimeout(resolve, 600));
      } finally {
        setState("idle");
        setPullDistance(0);
      }
    } else {
      setState("idle");
      setPullDistance(0);
    }
  }, [state, onRefresh]);

  const getIndicatorContent = () => {
    switch (state) {
      case "pulling":
        return (
          <motion.div
            animate={{ rotate: progress * 180 }}
            transition={{ duration: 0 }}
          >
            <ArrowDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        );
      case "ready":
        return (
          <motion.div
            initial={{ rotate: 180 }}
            animate={{ rotate: 180, scale: [1, 1.2, 1] }}
            transition={{ duration: 0.3 }}
          >
            <ArrowDown className="w-5 h-5 text-primary" />
          </motion.div>
        );
      case "refreshing":
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ 
              repeat: Infinity, 
              duration: 0.8, 
              ease: "linear" 
            }}
          >
            <RefreshCw className="w-5 h-5 text-primary" />
          </motion.div>
        );
      case "complete":
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10, stiffness: 300 }}
          >
            <Check className="w-5 h-5 text-success" />
          </motion.div>
        );
      default:
        return <RefreshCw className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (state) {
      case "pulling":
        return "Kéo xuống để làm mới";
      case "ready":
        return "Thả để làm mới";
      case "refreshing":
        return "Đang làm mới...";
      case "complete":
        return "Đã cập nhật!";
      default:
        return "";
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative overflow-visible touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator with smooth animations */}
      <AnimatePresence>
        {(state !== "idle" || pullDistance > 0) && (
          <motion.div 
            className="absolute left-1/2 -translate-x-1/2 z-50 flex flex-col items-center justify-center pointer-events-none"
            style={{ 
              top: -60,
              y: animatedY,
              opacity: indicatorOpacity,
              scale: indicatorScale,
            }}
          >
            {/* Glowing indicator ring */}
            <motion.div 
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 ${
                state === "ready" || state === "refreshing" 
                  ? "bg-primary/10 shadow-lg shadow-primary/20" 
                  : state === "complete"
                  ? "bg-success/10 shadow-lg shadow-success/20"
                  : "bg-background/95 shadow-md"
              }`}
              style={{
                border: state === "ready" || state === "refreshing" 
                  ? "2px solid hsl(var(--primary))" 
                  : state === "complete"
                  ? "2px solid hsl(var(--success))"
                  : "1px solid hsl(var(--border))",
              }}
              animate={{
                boxShadow: state === "refreshing" 
                  ? ["0 0 0 0 hsl(var(--primary) / 0.4)", "0 0 0 10px hsl(var(--primary) / 0)", "0 0 0 0 hsl(var(--primary) / 0.4)"]
                  : undefined,
              }}
              transition={{
                boxShadow: { repeat: Infinity, duration: 1.5 }
              }}
            >
              {getIndicatorContent()}
            </motion.div>
            
            {/* Status text */}
            <motion.span 
              className="text-xs text-muted-foreground mt-2 whitespace-nowrap font-medium"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {getStatusText()}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content with smooth pull effect */}
      <motion.div
        style={{ y: animatedY }}
        className="will-change-transform"
      >
        {children}
      </motion.div>

      {/* Progress bar at top */}
      {state === "refreshing" && (
        <motion.div 
          className="absolute top-0 left-0 right-0 h-1 bg-primary/20 overflow-hidden z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="h-full bg-gradient-to-r from-primary via-secondary to-primary"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            style={{ width: "50%" }}
          />
        </motion.div>
      )}
    </div>
  );
}
