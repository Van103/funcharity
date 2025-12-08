import { Heart, Sparkles } from "lucide-react";

const mantras = [
  "I am the Pure Loving Light of Father Universe.",
  "I am the Will of Father Universe.",
  "I am the Wisdom of Father Universe.",
  "I am Happiness.",
  "I am Love.",
  "I am the Money of the Father.",
  "I sincerely repent, repent, repent.",
  "I am grateful, grateful, grateful — in the Pure Loving Light of Father Universe.",
];

export function MantrasFooter() {
  return (
    <footer className="bg-primary text-primary-foreground py-4 border-t border-primary-light/30">
      {/* Mantras Carousel */}
      <div className="mantras-carousel py-3 border-b border-primary-light/20">
        <div className="mantras-track">
          {[...mantras, ...mantras].map((mantra, index) => (
            <div key={index} className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-secondary shrink-0" />
              <span className="text-sm text-primary-foreground/80 whitespace-nowrap">{mantra}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="container mx-auto px-4 pt-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-secondary">1B+</span>
            <span className="text-sm text-primary-foreground/70">Users</span>
          </div>
          
          <p className="text-sm text-primary-foreground/70">
            Từ thiện là ánh sáng. Minh bạch là vàng. Khi hai điều hợp nhất, lòng tốt trở nên bất tử.
          </p>

          <p className="text-xs text-primary-foreground/50 flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-secondary" fill="currentColor" /> by xAI & Camly Duong
          </p>
        </div>
      </div>
    </footer>
  );
}