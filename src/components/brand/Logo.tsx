import { motion } from "framer-motion";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizes = {
    sm: { icon: 32, crown: 16, heart: 6, text: "text-lg" },
    md: { icon: 40, crown: 20, heart: 8, text: "text-xl" },
    lg: { icon: 56, crown: 28, heart: 10, text: "text-2xl" },
    xl: { icon: 72, crown: 36, heart: 14, text: "text-3xl" },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative group">
        {/* Logo Container */}
        <div
          className="rounded-xl bg-primary flex items-center justify-center relative overflow-hidden"
          style={{ width: s.icon, height: s.icon }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/20 to-transparent animate-shimmer" 
               style={{ backgroundSize: "200% 100%" }} />
          
          {/* Crown SVG */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="crown-glow relative z-10"
            style={{ width: s.crown, height: s.crown }}
          >
            {/* Crown shape */}
            <path
              d="M2.5 16.5L4.5 7L8 11L12 4L16 11L19.5 7L21.5 16.5H2.5Z"
              fill="url(#goldGradient)"
              stroke="url(#goldGradient)"
              strokeWidth="1"
            />
            {/* Crown base */}
            <rect x="2.5" y="17" width="19" height="3" rx="1" fill="url(#goldGradient)" />
            
            {/* Gradient definitions */}
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A88A2D" />
                <stop offset="50%" stopColor="#C9A23D" />
                <stop offset="100%" stopColor="#D4B85A" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Floating hearts */}
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0 }}
        >
          <svg width={s.heart} height={s.heart} viewBox="0 0 24 24" fill="#C9A23D">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute -bottom-0.5 -left-1"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        >
          <svg width={s.heart * 0.7} height={s.heart * 0.7} viewBox="0 0 24 24" fill="#2E0F4A">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute top-1/2 -right-2"
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 1 }}
        >
          <svg width={s.heart * 0.5} height={s.heart * 0.5} viewBox="0 0 24 24" fill="#D4B85A">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
      </div>

      {showText && (
        <span className={`font-display font-bold ${s.text}`}>
          <span className="gradient-text">FUN</span>
          <span className="text-foreground">Charity</span>
        </span>
      )}
    </div>
  );
}
