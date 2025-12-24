import { useMemo } from "react";

interface MiniSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showDot?: boolean;
}

export function MiniSparkline({ 
  data, 
  width = 40, 
  height = 16, 
  color = "#FFD700",
  showDot = true 
}: MiniSparklineProps) {
  const path = useMemo(() => {
    if (data.length < 2) return "";
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 2) - 1;
      return { x, y };
    });
    
    // Create smooth curve using quadratic bezier
    let d = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;
      d += ` Q ${prev.x + (curr.x - prev.x) * 0.5} ${prev.y}, ${cpX} ${(prev.y + curr.y) / 2}`;
    }
    
    // Finish with the last point
    const last = points[points.length - 1];
    d += ` L ${last.x} ${last.y}`;
    
    return d;
  }, [data, width, height]);

  const lastPoint = useMemo(() => {
    if (data.length < 2) return null;
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const lastValue = data[data.length - 1];
    
    return {
      x: width,
      y: height - ((lastValue - min) / range) * (height - 2) - 1
    };
  }, [data, width, height]);

  const trend = useMemo(() => {
    if (data.length < 2) return "neutral";
    const first = data[0];
    const last = data[data.length - 1];
    if (last > first) return "up";
    if (last < first) return "down";
    return "neutral";
  }, [data]);

  const trendColor = trend === "up" ? "#22c55e" : trend === "down" ? "#ef4444" : color;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Gradient definition */}
      <defs>
        <linearGradient id={`sparkline-gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={trendColor} stopOpacity="1" />
        </linearGradient>
      </defs>
      
      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={`url(#sparkline-gradient-${color.replace('#', '')})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* End dot with glow */}
      {showDot && lastPoint && (
        <>
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r="3"
            fill={trendColor}
            className="animate-pulse"
          />
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r="2"
            fill="white"
          />
        </>
      )}
    </svg>
  );
}
