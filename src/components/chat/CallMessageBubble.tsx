import { Phone, Video, PhoneMissed, PhoneOff, PhoneIncoming, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface CallMessageBubbleProps {
  content: string;
  isCurrentUser: boolean;
  onCallback?: (type: "video" | "audio") => void;
}

// Helper to parse call message content
const parseCallMessage = (content: string) => {
  const isVideo = content.toLowerCase().includes("video");
  const isCompleted = content.includes("📞");
  const isMissed = content.includes("📵");
  const isDeclined = content.includes("❌");
  
  // Extract duration if present
  const durationMatch = content.match(/(\d+)\s*phút\s*(\d+)\s*giây|(\d+)\s*giây/);
  let duration = "";
  if (durationMatch) {
    if (durationMatch[1] && durationMatch[2]) {
      duration = `${durationMatch[1]}:${durationMatch[2].padStart(2, '0')}`;
    } else if (durationMatch[3]) {
      duration = `0:${durationMatch[3].padStart(2, '0')}`;
    }
  }

  return {
    isVideo,
    isCompleted,
    isMissed,
    isDeclined,
    duration
  };
};

export function CallMessageBubble({ content, isCurrentUser, onCallback }: CallMessageBubbleProps) {
  const { isVideo, isCompleted, isMissed, isDeclined, duration } = parseCallMessage(content);
  
  const getIcon = () => {
    if (isCompleted) {
      return isVideo ? (
        <Video className="w-5 h-5" />
      ) : (
        <Phone className="w-5 h-5" />
      );
    }
    if (isMissed) {
      return <PhoneMissed className="w-5 h-5" />;
    }
    if (isDeclined) {
      return <PhoneOff className="w-5 h-5" />;
    }
    return <PhoneIncoming className="w-5 h-5" />;
  };

  const getStatusColor = () => {
    if (isCompleted) return "text-green-500";
    if (isMissed) return "text-orange-500";
    if (isDeclined) return "text-red-500";
    return "text-muted-foreground";
  };

  const getStatusText = () => {
    if (isCompleted) return `Cuộc gọi ${isVideo ? "video" : "thoại"}`;
    if (isMissed) return `Cuộc gọi nhỡ`;
    if (isDeclined) return `Cuộc gọi bị từ chối`;
    return "Cuộc gọi";
  };

  const showCallback = (isMissed || isDeclined) && !isCurrentUser;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${
        isCurrentUser
          ? 'bg-primary/10 border border-primary/20'
          : 'bg-muted/50 border border-border'
      }`}
    >
      {/* Icon */}
      <div className={`p-2 rounded-full ${
        isCompleted ? 'bg-green-500/10' : 
        isMissed ? 'bg-orange-500/10' : 
        isDeclined ? 'bg-red-500/10' : 
        'bg-muted'
      }`}>
        <span className={getStatusColor()}>
          {getIcon()}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${getStatusColor()}`}>
          {getStatusText()}
        </p>
        {duration && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <Clock className="w-3 h-3" />
            <span>{duration}</span>
          </div>
        )}
      </div>

      {/* Callback button */}
      {showCallback && onCallback && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-3 gap-1.5 text-primary border-primary/30 hover:bg-primary/10"
          onClick={() => onCallback(isVideo ? "video" : "audio")}
        >
          {isVideo ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
          <span className="text-xs">Gọi lại</span>
        </Button>
      )}
    </motion.div>
  );
}

// Helper to check if a message is a call message
export function isCallMessage(content: string): boolean {
  return (
    content.includes("📞 Cuộc gọi") ||
    content.includes("📵 Cuộc gọi") ||
    content.includes("❌ Cuộc gọi")
  );
}
