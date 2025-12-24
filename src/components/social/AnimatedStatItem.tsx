import { useState, useEffect, useRef } from "react";
import { useCountAnimation } from "@/hooks/useCountAnimation";
import { useLanguage } from "@/contexts/LanguageContext";
import { MiniSparkline } from "./MiniSparkline";
import { cn } from "@/lib/utils";

interface AnimatedStatItemProps {
  labelKey: string;
  value: number;
  isCurrency?: boolean;
}

// Format number for display
const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// Format currency for display
const formatCurrency = (amount: number): string => {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B ₫`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M ₫`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K ₫`;
  }
  return `${amount} ₫`;
};

// Generate sparkline data based on current value with some variation
const generateSparklineData = (currentValue: number, seed: string): number[] => {
  const points = 7;
  const data: number[] = [];
  
  // Use seed to create consistent but varied data
  let seedNum = 0;
  for (let i = 0; i < seed.length; i++) {
    seedNum += seed.charCodeAt(i);
  }
  
  for (let i = 0; i < points; i++) {
    // Create a pseudo-random but deterministic variation
    const variation = Math.sin(seedNum * (i + 1) * 0.5) * 0.3;
    const progress = i / (points - 1);
    // Trend upward towards current value
    const baseValue = currentValue * (0.7 + progress * 0.3);
    data.push(Math.max(0, baseValue * (1 + variation)));
  }
  
  // Ensure last value is the current value
  data[data.length - 1] = currentValue;
  
  return data;
};

export function AnimatedStatItem({ labelKey, value, isCurrency = false }: AnimatedStatItemProps) {
  const { t } = useLanguage();
  const animatedValue = useCountAnimation(value, 800);
  const [isUpdating, setIsUpdating] = useState(false);
  const previousValue = useRef(value);
  const [sparklineData, setSparklineData] = useState<number[]>([]);

  // Detect value changes and trigger pulse effect
  useEffect(() => {
    if (previousValue.current !== value && previousValue.current !== 0) {
      setIsUpdating(true);
      
      // Update sparkline with new data point
      setSparklineData(prev => {
        const newData = [...prev.slice(-6), value];
        return newData;
      });
      
      const timer = setTimeout(() => {
        setIsUpdating(false);
      }, 1500);
      
      previousValue.current = value;
      return () => clearTimeout(timer);
    } else if (previousValue.current === 0 && value > 0) {
      // Initial load
      setSparklineData(generateSparklineData(value, labelKey));
      previousValue.current = value;
    }
  }, [value, labelKey]);

  // Initialize sparkline data on mount
  useEffect(() => {
    if (value > 0 && sparklineData.length === 0) {
      setSparklineData(generateSparklineData(value, labelKey));
    }
  }, [value, labelKey, sparklineData.length]);

  return (
    <div 
      className={cn(
        "flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-white/95 transition-all duration-300",
        isUpdating && "animate-pulse"
      )}
      style={{ 
        boxShadow: isUpdating 
          ? '0 0 20px 4px rgba(34, 197, 94, 0.6), 0 0 8px 2px rgba(34, 197, 94, 0.4)'
          : '0 0 12px 2px rgba(255, 215, 0, 0.5), 0 0 4px 1px rgba(255, 215, 0, 0.3)',
        border: isUpdating 
          ? '2px solid rgba(34, 197, 94, 0.8)'
          : '2px solid rgba(255, 215, 0, 0.6)',
        transform: isUpdating ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      <span className="font-bold whitespace-nowrap" style={{ color: '#4C1D95', fontSize: '15px' }}>
        {t(labelKey)}
      </span>
      
      <div className="flex items-center gap-2">
        {/* Mini Sparkline */}
        {sparklineData.length > 1 && (
          <MiniSparkline 
            data={sparklineData} 
            width={36} 
            height={14}
            color="#9333ea"
          />
        )}
        
        {/* Value with update indicator */}
        <div className="relative">
          <span 
            className={cn(
              "font-bold whitespace-nowrap tabular-nums transition-all duration-300",
              isUpdating && "text-green-600"
            )} 
            style={{ color: isUpdating ? '#16a34a' : '#4C1D95', fontSize: '15px' }}
          >
            {isCurrency ? formatCurrency(animatedValue) : formatNumber(animatedValue)}
          </span>
          
          {/* Update flash indicator */}
          {isUpdating && (
            <span className="absolute -right-1 -top-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
