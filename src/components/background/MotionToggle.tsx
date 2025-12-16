import { useRef, useEffect, useCallback } from "react";
import { useMotion, BokehPreset, BOKEH_PRESETS } from "@/contexts/MotionContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Eye, EyeOff, Stars, Zap, Flame, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

const GOLD_COLORS = ['#F5C77A', '#FFD700', '#FFEAA7'];
const PURPLE_COLORS = ['#7A5AF8', '#8B7CF6', '#A78BFA'];

interface PreviewParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  driftY: number;
  twinklePhase: number;
  twinkleSpeed: number;
}

function BokehPreviewCanvas({ 
  particleCount, 
  speed, 
  enabled 
}: { 
  particleCount: number; 
  speed: number; 
  enabled: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<PreviewParticle[]>([]);
  const animationRef = useRef<number>();

  const createParticle = useCallback((width: number, height: number, fromBottom = false): PreviewParticle => {
    const isGold = Math.random() < 0.6;
    const colors = isGold ? GOLD_COLORS : PURPLE_COLORS;
    
    return {
      x: Math.random() * width,
      y: fromBottom ? height + 5 : Math.random() * height,
      size: 1.5 + Math.random() * 2.5,
      opacity: 0.4 + Math.random() * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      driftY: 0.3 + Math.random() * 0.5,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.03 + Math.random() * 0.04,
    };
  }, []);

  const initParticles = useCallback((width: number, height: number, count: number) => {
    const previewCount = Math.round(count * 0.4);
    particlesRef.current = Array.from({ length: previewCount }, () => 
      createParticle(width, height, false)
    );
  }, [createParticle]);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    initParticles(canvas.offsetWidth, canvas.offsetHeight, particleCount);

    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      particlesRef.current.forEach((p, i) => {
        p.y -= p.driftY * speed;
        p.twinklePhase += p.twinkleSpeed * speed;
        const currentOpacity = p.opacity * (0.5 + 0.5 * Math.sin(p.twinklePhase));

        if (p.y < -5) {
          particlesRef.current[i] = createParticle(canvas.offsetWidth, canvas.offsetHeight, true);
        }

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.globalAlpha = currentOpacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, particleCount, speed, initParticles, createParticle]);

  // Update particle count dynamically
  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const targetCount = Math.round(particleCount * 0.4);
    const currentCount = particlesRef.current.length;

    if (targetCount > currentCount) {
      for (let i = currentCount; i < targetCount; i++) {
        particlesRef.current.push(createParticle(canvas.offsetWidth, canvas.offsetHeight, false));
      }
    } else if (targetCount < currentCount) {
      particlesRef.current = particlesRef.current.slice(0, targetCount);
    }
  }, [particleCount, enabled, createParticle]);

  if (!enabled) {
    return (
      <div className="w-full h-28 rounded-xl bg-muted/50 flex items-center justify-center border border-border">
        <span className="text-muted-foreground text-sm">Đã tắt hiệu ứng</span>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-28 rounded-xl"
      style={{
        background: 'linear-gradient(135deg, hsl(252 85% 12%) 0%, hsl(252 60% 18%) 50%, hsl(252 50% 22%) 100%)',
        border: '1px solid hsl(38 86% 72% / 0.3)',
        boxShadow: 'inset 0 0 30px hsl(38 86% 72% / 0.1)',
      }}
    />
  );
}

const presetConfig: { key: Exclude<BokehPreset, 'custom'>; label: string; icon: React.ReactNode }[] = [
  { key: 'minimal', label: 'Minimal', icon: <Sparkles className="w-3 h-3" /> },
  { key: 'normal', label: 'Normal', icon: <Zap className="w-3 h-3" /> },
  { key: 'intense', label: 'Intense', icon: <Flame className="w-3 h-3" /> },
];

export function MotionToggle() {
  const { 
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
  } = useMotion();

  return (
    <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border">
      {/* Live Preview */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Live Preview</Label>
        <BokehPreviewCanvas 
          particleCount={bokehParticleCount} 
          speed={bokehSpeed} 
          enabled={bokehEnabled && !reduceMotion}
        />
      </div>

      {/* Background Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-secondary" />
          <Label htmlFor="bg-toggle" className="text-sm font-medium">
            Hiệu ứng nền
          </Label>
        </div>
        <Switch
          id="bg-toggle"
          checked={backgroundEnabled}
          onCheckedChange={setBackgroundEnabled}
        />
      </div>

      {/* Bokeh Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Stars className="w-4 h-4 text-secondary" />
          <Label htmlFor="bokeh-toggle" className="text-sm font-medium">
            Ánh sáng lấp lánh
          </Label>
        </div>
        <Switch
          id="bokeh-toggle"
          checked={bokehEnabled}
          onCheckedChange={setBokehEnabled}
        />
      </div>

      {/* Bokeh Settings (only show when bokeh is enabled) */}
      {bokehEnabled && !reduceMotion && (
        <div className="space-y-4 pt-2 border-t border-border/50">
          {/* Preset Selection */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Preset</Label>
            <div className="flex gap-1.5">
              {presetConfig.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setBokehPreset(key)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all",
                    bokehPreset === key 
                      ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md" 
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {icon}
                  {label}
                </button>
              ))}
              <button
                onClick={() => setBokehPreset('custom')}
                className={cn(
                  "flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all",
                  bokehPreset === 'custom' 
                    ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md" 
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                <Settings2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Particle Count Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs text-muted-foreground">Số lượng</Label>
              <span className="text-xs font-medium text-foreground">{bokehParticleCount}</span>
            </div>
            <Slider
              value={[bokehParticleCount]}
              onValueChange={([value]) => setBokehParticleCount(value)}
              min={10}
              max={150}
              step={5}
              className="bokeh-slider"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>10</span>
              <span>150</span>
            </div>
          </div>

          {/* Speed Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs text-muted-foreground">Tốc độ</Label>
              <span className="text-xs font-medium text-foreground">{bokehSpeed.toFixed(1)}x</span>
            </div>
            <Slider
              value={[bokehSpeed * 10]}
              onValueChange={([value]) => setBokehSpeed(value / 10)}
              min={1}
              max={20}
              step={1}
              className="bokeh-slider"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Chậm</span>
              <span>Nhanh</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Reduce Motion Toggle */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-2">
          {reduceMotion ? (
            <EyeOff className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Eye className="w-4 h-4 text-secondary" />
          )}
          <Label htmlFor="motion-toggle" className="text-sm font-medium">
            Giảm chuyển động
          </Label>
        </div>
        <Switch
          id="motion-toggle"
          checked={reduceMotion}
          onCheckedChange={setReduceMotion}
        />
      </div>
      
      <p className="text-xs text-muted-foreground">
        Điều chỉnh sliders để xem thay đổi realtime trong preview.
      </p>
    </div>
  );
}
