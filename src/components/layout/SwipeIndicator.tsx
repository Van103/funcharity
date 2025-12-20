import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { useLanguage } from "@/contexts/LanguageContext";

const routeLabels: Record<string, string> = {
  "/social": "nav.home",
  "/campaigns": "nav.campaigns", 
  "/profiles": "nav.communityProfiles",
  "/messages": "menu.chat",
};

export function SwipeIndicator() {
  const { swipeState, canSwipeLeft, canSwipeRight, routes, currentRouteIndex } = useSwipeNavigation();
  const { t } = useLanguage();

  const getNextRoute = () => {
    if (swipeState.direction === "left" && canSwipeLeft) {
      return routes[currentRouteIndex + 1];
    }
    if (swipeState.direction === "right" && canSwipeRight) {
      return routes[currentRouteIndex - 1];
    }
    return null;
  };

  const nextRoute = getNextRoute();
  const nextLabel = nextRoute ? routeLabels[nextRoute] : null;

  return (
    <AnimatePresence>
      {swipeState.isSwipping && swipeState.progress > 0.2 && nextLabel && (
        <>
          {/* Left edge indicator (swipe right to go back) */}
          {swipeState.direction === "right" && canSwipeRight && (
            <motion.div
              className="fixed left-0 top-1/2 -translate-y-1/2 z-[100] flex items-center"
              initial={{ x: -60, opacity: 0 }}
              animate={{ 
                x: swipeState.progress * 30 - 40, 
                opacity: swipeState.progress 
              }}
              exit={{ x: -60, opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <div className={`flex items-center gap-2 px-4 py-3 rounded-r-2xl transition-colors ${
                swipeState.progress >= 1 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                  : "bg-background/95 text-foreground border border-border shadow-lg"
              }`}>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium whitespace-nowrap">
                  {t(nextLabel)}
                </span>
              </div>
            </motion.div>
          )}

          {/* Right edge indicator (swipe left to go forward) */}
          {swipeState.direction === "left" && canSwipeLeft && (
            <motion.div
              className="fixed right-0 top-1/2 -translate-y-1/2 z-[100] flex items-center"
              initial={{ x: 60, opacity: 0 }}
              animate={{ 
                x: -swipeState.progress * 30 + 40, 
                opacity: swipeState.progress 
              }}
              exit={{ x: 60, opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <div className={`flex items-center gap-2 px-4 py-3 rounded-l-2xl transition-colors ${
                swipeState.progress >= 1 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                  : "bg-background/95 text-foreground border border-border shadow-lg"
              }`}>
                <span className="text-sm font-medium whitespace-nowrap">
                  {t(nextLabel)}
                </span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </motion.div>
          )}

          {/* Page dots indicator */}
          <motion.div 
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2 rounded-full bg-background/95 border border-border shadow-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            {routes.map((route, index) => (
              <motion.div
                key={route}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentRouteIndex 
                    ? "bg-primary" 
                    : "bg-muted-foreground/30"
                }`}
                animate={{
                  scale: index === currentRouteIndex ? 1.2 : 1,
                }}
              />
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
