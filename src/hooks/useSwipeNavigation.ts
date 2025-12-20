import { useRef, useCallback, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface SwipeConfig {
  threshold?: number;
  routes?: string[];
  enabled?: boolean;
}

interface SwipeState {
  isSwipping: boolean;
  direction: "left" | "right" | null;
  progress: number;
}

export function useSwipeNavigation({
  threshold = 80,
  routes = ["/social", "/campaigns", "/profiles", "/messages"],
  enabled = true,
}: SwipeConfig = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [swipeState, setSwipeState] = useState<SwipeState>({
    isSwipping: false,
    direction: null,
    progress: 0,
  });
  
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const currentRouteIndex = routes.indexOf(location.pathname);
  const canSwipeLeft = currentRouteIndex < routes.length - 1 && currentRouteIndex !== -1;
  const canSwipeRight = currentRouteIndex > 0;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    
    // Don't intercept swipes that start near edges (for browser back gesture)
    const touch = e.touches[0];
    if (touch.clientX < 20 || touch.clientX > window.innerWidth - 20) return;
    
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    currentX.current = touch.clientX;
    isHorizontalSwipe.current = null;
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    
    const touch = e.touches[0];
    const diffX = touch.clientX - startX.current;
    const diffY = touch.clientY - startY.current;
    
    // Determine if this is a horizontal or vertical swipe
    if (isHorizontalSwipe.current === null && (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)) {
      isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY);
    }
    
    // Only handle horizontal swipes
    if (!isHorizontalSwipe.current) return;
    
    currentX.current = touch.clientX;
    
    const direction = diffX > 0 ? "right" : "left";
    const canSwipe = direction === "left" ? canSwipeLeft : canSwipeRight;
    
    if (!canSwipe) return;
    
    const progress = Math.min(Math.abs(diffX) / threshold, 1);
    
    setSwipeState({
      isSwipping: true,
      direction,
      progress,
    });
  }, [enabled, threshold, canSwipeLeft, canSwipeRight]);

  const handleTouchEnd = useCallback(() => {
    if (!enabled || !swipeState.isSwipping) {
      setSwipeState({ isSwipping: false, direction: null, progress: 0 });
      return;
    }
    
    const diffX = currentX.current - startX.current;
    
    if (Math.abs(diffX) >= threshold) {
      const direction = diffX > 0 ? "right" : "left";
      
      if (direction === "left" && canSwipeLeft) {
        navigate(routes[currentRouteIndex + 1]);
      } else if (direction === "right" && canSwipeRight) {
        navigate(routes[currentRouteIndex - 1]);
      }
    }
    
    setSwipeState({ isSwipping: false, direction: null, progress: 0 });
    isHorizontalSwipe.current = null;
  }, [enabled, swipeState.isSwipping, threshold, canSwipeLeft, canSwipeRight, navigate, routes, currentRouteIndex]);

  useEffect(() => {
    if (!enabled) return;
    
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    swipeState,
    canSwipeLeft,
    canSwipeRight,
    currentRouteIndex,
    routes,
  };
}
