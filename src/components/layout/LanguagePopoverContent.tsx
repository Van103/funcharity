import { useLanguage, LANGUAGE_OPTIONS } from "@/contexts/LanguageContext";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function LanguagePopoverContent() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="space-y-1 py-1">
      {LANGUAGE_OPTIONS.map((option) => (
        <button
          key={option.code}
          onClick={() => setLanguage(option.code)}
          className={cn(
            "w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative",
            "hover:bg-primary/20 hover:text-primary focus:bg-primary/20 focus:text-primary",
            language === option.code && "bg-primary/15 text-primary font-medium"
          )}
        >
          {/* Cute angel pointing to selected item */}
          {language === option.code && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute -left-1 text-lg"
              style={{ filter: "drop-shadow(0 0 4px rgba(168, 85, 247, 0.5))" }}
            >
              👼
            </motion.span>
          )}
          
          {/* Flag emoji - 20-24px size */}
          <span className="text-[22px] leading-none ml-4">{option.flag}</span>
          
          {/* Language names */}
          <div className="flex-1 flex items-center gap-2 text-left">
            <span className="text-sm font-medium">{option.nativeName}</span>
            {option.nativeName !== option.name && (
              <span className="text-xs text-muted-foreground">{option.name}</span>
            )}
          </div>
          
          {/* Checkmark for selected */}
          {language === option.code && (
            <Check className="h-4 w-4 text-primary flex-shrink-0" />
          )}
        </button>
      ))}
    </div>
  );
}