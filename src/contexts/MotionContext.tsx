import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type BokehPreset = 'minimal' | 'normal' | 'intense' | 'custom';

export const BOKEH_PRESETS: Record<Exclude<BokehPreset, 'custom'>, { particleCount: number; speed: number }> = {
  minimal: { particleCount: 20, speed: 0.3 },
  normal: { particleCount: 50, speed: 1.0 },
  intense: { particleCount: 100, speed: 1.5 },
};

interface MotionContextType {
  reduceMotion: boolean;
  setReduceMotion: (value: boolean) => void;
  backgroundEnabled: boolean;
  setBackgroundEnabled: (value: boolean) => void;
  bokehEnabled: boolean;
  setBokehEnabled: (value: boolean) => void;
  bokehPreset: BokehPreset;
  setBokehPreset: (preset: BokehPreset) => void;
  bokehParticleCount: number;
  setBokehParticleCount: (count: number) => void;
  bokehSpeed: number;
  setBokehSpeed: (speed: number) => void;
}

const MotionContext = createContext<MotionContextType | undefined>(undefined);

export function MotionProvider({ children }: { children: ReactNode }) {
  const [reduceMotion, setReduceMotionState] = useState(() => {
    const saved = localStorage.getItem("reduce-motion");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const [backgroundEnabled, setBackgroundEnabledState] = useState(() => {
    const saved = localStorage.getItem("background-enabled");
    return saved !== null ? saved === "true" : true;
  });

  const [bokehEnabled, setBokehEnabledState] = useState(() => {
    const saved = localStorage.getItem("bokeh-enabled");
    return saved !== null ? saved === "true" : true;
  });

  const [bokehPreset, setBokehPresetState] = useState<BokehPreset>(() => {
    const saved = localStorage.getItem("bokeh-preset");
    return (saved as BokehPreset) || 'normal';
  });

  const [bokehParticleCount, setBokehParticleCountState] = useState(() => {
    const saved = localStorage.getItem("bokeh-particle-count");
    return saved !== null ? parseInt(saved, 10) : BOKEH_PRESETS.normal.particleCount;
  });

  const [bokehSpeed, setBokehSpeedState] = useState(() => {
    const saved = localStorage.getItem("bokeh-speed");
    return saved !== null ? parseFloat(saved) : BOKEH_PRESETS.normal.speed;
  });

  const setReduceMotion = (value: boolean) => {
    setReduceMotionState(value);
    localStorage.setItem("reduce-motion", String(value));
  };

  const setBackgroundEnabled = (value: boolean) => {
    setBackgroundEnabledState(value);
    localStorage.setItem("background-enabled", String(value));
  };

  const setBokehEnabled = (value: boolean) => {
    setBokehEnabledState(value);
    localStorage.setItem("bokeh-enabled", String(value));
  };

  const setBokehPreset = (preset: BokehPreset) => {
    setBokehPresetState(preset);
    localStorage.setItem("bokeh-preset", preset);
    
    if (preset !== 'custom') {
      const config = BOKEH_PRESETS[preset];
      setBokehParticleCountState(config.particleCount);
      setBokehSpeedState(config.speed);
      localStorage.setItem("bokeh-particle-count", String(config.particleCount));
      localStorage.setItem("bokeh-speed", String(config.speed));
    }
  };

  const setBokehParticleCount = (count: number) => {
    setBokehParticleCountState(count);
    localStorage.setItem("bokeh-particle-count", String(count));
    
    // Auto-switch to custom if values don't match any preset
    const matchingPreset = Object.entries(BOKEH_PRESETS).find(
      ([_, config]) => config.particleCount === count && config.speed === bokehSpeed
    );
    if (!matchingPreset && bokehPreset !== 'custom') {
      setBokehPresetState('custom');
      localStorage.setItem("bokeh-preset", 'custom');
    }
  };

  const setBokehSpeed = (speed: number) => {
    setBokehSpeedState(speed);
    localStorage.setItem("bokeh-speed", String(speed));
    
    // Auto-switch to custom if values don't match any preset
    const matchingPreset = Object.entries(BOKEH_PRESETS).find(
      ([_, config]) => config.particleCount === bokehParticleCount && config.speed === speed
    );
    if (!matchingPreset && bokehPreset !== 'custom') {
      setBokehPresetState('custom');
      localStorage.setItem("bokeh-preset", 'custom');
    }
  };

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => {
      if (localStorage.getItem("reduce-motion") === null) {
        setReduceMotionState(e.matches);
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Pause animations when tab is hidden
  useEffect(() => {
    const handleVisibility = () => {
      document.documentElement.classList.toggle("tab-hidden", document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return (
    <MotionContext.Provider value={{ 
      reduceMotion, 
      setReduceMotion, 
      backgroundEnabled, 
      setBackgroundEnabled,
      bokehEnabled,
      setBokehEnabled,
      bokehPreset,
      setBokehPreset,
      bokehParticleCount,
      setBokehParticleCount,
      bokehSpeed,
      setBokehSpeed,
    }}>
      {children}
    </MotionContext.Provider>
  );
}

export function useMotion() {
  const context = useContext(MotionContext);
  if (!context) {
    throw new Error("useMotion must be used within a MotionProvider");
  }
  return context;
}
