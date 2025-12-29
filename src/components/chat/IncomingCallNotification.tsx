import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, PhoneOff, Video } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useCallback } from "react";

interface IncomingCallNotificationProps {
  callerName: string;
  callerAvatar: string | null;
  callType: "video" | "audio";
  onAnswer: () => void;
  onDecline: () => void;
}

// Messenger-style incoming ringtone class with proper pattern
class MessengerIncomingRingtone {
  private audioContext: AudioContext | null = null;
  private isPlaying = false;
  private timeoutIds: NodeJS.Timeout[] = [];
  private oscillators: OscillatorNode[] = [];

  private createRingBurst(startTime: number) {
    if (!this.audioContext) return;
    
    // Create the characteristic "brrring" trill sound
    const baseFreq = 523.25; // C5 - slightly higher for incoming
    const trillFreq = 659.25; // E5
    
    // Main trill oscillator
    const osc1 = this.audioContext.createOscillator();
    const gain1 = this.audioContext.createGain();
    osc1.type = 'sine';
    
    // Rapid frequency alternation for trill effect
    const trillSpeed = 12; // alternations per second
    const duration = 0.5;
    
    for (let i = 0; i < duration * trillSpeed * 2; i++) {
      const t = startTime + (i / (trillSpeed * 2));
      osc1.frequency.setValueAtTime(i % 2 === 0 ? baseFreq : trillFreq, t);
    }
    
    gain1.gain.setValueAtTime(0, startTime);
    gain1.gain.linearRampToValueAtTime(0.2, startTime + 0.03);
    gain1.gain.setValueAtTime(0.2, startTime + duration - 0.03);
    gain1.gain.linearRampToValueAtTime(0, startTime + duration);
    
    osc1.connect(gain1);
    gain1.connect(this.audioContext.destination);
    osc1.start(startTime);
    osc1.stop(startTime + duration);
    
    this.oscillators.push(osc1);
    
    // Add harmonic overtone for richer sound
    const osc2 = this.audioContext.createOscillator();
    const gain2 = this.audioContext.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq * 2, startTime); // Octave higher
    
    gain2.gain.setValueAtTime(0, startTime);
    gain2.gain.linearRampToValueAtTime(0.05, startTime + 0.03);
    gain2.gain.setValueAtTime(0.05, startTime + duration - 0.03);
    gain2.gain.linearRampToValueAtTime(0, startTime + duration);
    
    osc2.connect(gain2);
    gain2.connect(this.audioContext.destination);
    osc2.start(startTime);
    osc2.stop(startTime + duration);
    
    this.oscillators.push(osc2);
  }

  private playPattern() {
    if (!this.isPlaying) return;
    
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    const now = this.audioContext.currentTime;
    
    // Pattern: ring - short pause - ring - long pause (repeat)
    this.createRingBurst(now);
    this.createRingBurst(now + 0.7);
    
    // Schedule next pattern
    if (this.isPlaying) {
      const timeoutId = setTimeout(() => {
        this.playPattern();
      }, 3000);
      this.timeoutIds.push(timeoutId);
    }
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    console.log("Starting incoming ringtone...");
    this.playPattern();
  }

  stop() {
    console.log("Stopping incoming ringtone...");
    this.isPlaying = false;
    
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.timeoutIds = [];
    
    this.oscillators.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    this.oscillators = [];
    
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }
}

// Vibration pattern like Messenger (ring-ring pause ring-ring)
const vibratePattern = () => {
  if ('vibrate' in navigator) {
    // Pattern: vibrate, pause, vibrate, longer pause, repeat
    const pattern = [
      300, 100, 300, // First ring-ring
      500, // Pause
      300, 100, 300, // Second ring-ring
      1500 // Long pause before repeat
    ];
    
    navigator.vibrate(pattern);
  }
};

const stopVibration = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(0);
  }
};

// Create singleton instance
const incomingRingtone = new MessengerIncomingRingtone();

export function IncomingCallNotification({
  callerName,
  callerAvatar,
  callType,
  onAnswer,
  onDecline
}: IncomingCallNotificationProps) {
  const vibrationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopRingtone = useCallback(() => {
    incomingRingtone.stop();
    
    stopVibration();
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current);
      vibrationIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Start ringtone
    incomingRingtone.start();
    
    // Start vibration pattern (repeating)
    vibratePattern();
    vibrationIntervalRef.current = setInterval(() => {
      vibratePattern();
    }, 3000); // Match ringtone pattern
    
    return () => {
      stopRingtone();
    };
  }, [stopRingtone]);

  const handleAnswer = () => {
    stopRingtone();
    onAnswer();
  };

  const handleDecline = () => {
    stopRingtone();
    onDecline();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -100, scale: 0.9 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-4">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Avatar className="w-14 h-14 border-2 border-primary/30">
                  <AvatarImage src={callerAvatar || ""} />
                  <AvatarFallback className="bg-primary/20 text-primary text-lg">
                    {callerName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              
              <div className="flex-1">
                <p className="font-semibold text-foreground text-lg">{callerName}</p>
                <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                  {callType === "video" ? (
                    <>
                      <Video className="w-4 h-4" />
                      Cuộc gọi video đến...
                    </>
                  ) : (
                    <>
                      <Phone className="w-4 h-4" />
                      Cuộc gọi thoại đến...
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="p-4 flex items-center justify-center gap-6 bg-card">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDecline}
              className="w-14 h-14 rounded-full bg-destructive hover:bg-destructive/90 flex items-center justify-center shadow-lg transition-colors"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                scale: [1, 1.15, 1],
                boxShadow: [
                  "0 0 0 0 rgba(34, 197, 94, 0.4)",
                  "0 0 0 15px rgba(34, 197, 94, 0)",
                  "0 0 0 0 rgba(34, 197, 94, 0)"
                ]
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              onClick={handleAnswer}
              className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg transition-colors"
            >
              <Phone className="w-6 h-6 text-white" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
