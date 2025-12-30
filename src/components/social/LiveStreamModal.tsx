import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Users, 
  MessageCircle,
  Heart,
  Share2,
  X,
  RotateCcw,
  Palette,
  Sparkles,
  Download,
  Send
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface LiveStreamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
}

interface LiveReaction {
  id: string;
  emoji: string;
  x: number;
}

// Available filters
const FILTERS = [
  { id: 'none', name: 'Không', filter: '' },
  { id: 'warm', name: 'Ấm áp', filter: 'sepia(0.3) saturate(1.4) brightness(1.1)' },
  { id: 'cool', name: 'Mát mẻ', filter: 'saturate(1.2) hue-rotate(20deg) brightness(1.05)' },
  { id: 'vintage', name: 'Vintage', filter: 'sepia(0.5) contrast(1.1) brightness(0.9)' },
  { id: 'dramatic', name: 'Kịch tính', filter: 'contrast(1.3) saturate(1.2)' },
  { id: 'bright', name: 'Sáng', filter: 'brightness(1.3) contrast(1.1)' },
  { id: 'bw', name: 'Đen trắng', filter: 'grayscale(1) contrast(1.2)' },
  { id: 'pink', name: 'Hồng', filter: 'hue-rotate(-20deg) saturate(1.5) brightness(1.1)' },
  { id: 'ocean', name: 'Đại dương', filter: 'hue-rotate(180deg) saturate(0.8) brightness(1.1)' },
  { id: 'sunset', name: 'Hoàng hôn', filter: 'sepia(0.4) saturate(1.6) hue-rotate(-10deg)' },
];

// Available stickers
const STICKERS = [
  { id: 'crown', emoji: '👑', position: 'top' },
  { id: 'heart', emoji: '❤️', position: 'bottom-right' },
  { id: 'star', emoji: '⭐', position: 'top-right' },
  { id: 'fire', emoji: '🔥', position: 'bottom-left' },
  { id: 'sparkle', emoji: '✨', position: 'top-left' },
  { id: 'glasses', emoji: '😎', position: 'center' },
  { id: 'party', emoji: '🎉', position: 'top' },
  { id: 'butterfly', emoji: '🦋', position: 'top-right' },
  { id: 'rainbow', emoji: '🌈', position: 'top' },
  { id: 'kiss', emoji: '💋', position: 'bottom-right' },
  { id: 'angel', emoji: '😇', position: 'top' },
  { id: 'devil', emoji: '😈', position: 'top-left' },
];

export function LiveStreamModal({ open, onOpenChange, profile }: LiveStreamModalProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [viewerCount, setViewerCount] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [reactions, setReactions] = useState<LiveReaction[]>([]);
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  // Filter & Sticker states
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [activeStickers, setActiveStickers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showStickers, setShowStickers] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const viewerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startCameraPreview = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: 1280, height: 720 },
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Camera access error:", error);
      toast.error("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.");
    }
  }, [facingMode]);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (viewerIntervalRef.current) {
      clearInterval(viewerIntervalRef.current);
    }
    if (chatIntervalRef.current) {
      clearInterval(chatIntervalRef.current);
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    recordedChunksRef.current = [];
    
    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setShowSaveDialog(true);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Không thể ghi hình. Trình duyệt có thể không hỗ trợ.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  // Start camera preview
  useEffect(() => {
    if (open) {
      startCameraPreview();
    }
    return () => {
      stopStream();
      if (isRecording) {
        stopRecording();
      }
    };
  }, [open, startCameraPreview, stopStream, isRecording, stopRecording]);

  // Handle camera switch
  useEffect(() => {
    if (open && streamRef.current) {
      stopStream();
      startCameraPreview();
    }
  }, [facingMode]);

  // Simulate viewers and chat when streaming
  useEffect(() => {
    if (!isStreaming) return;

    viewerIntervalRef.current = setInterval(() => {
      setViewerCount(prev => Math.max(1, prev + Math.floor(Math.random() * 5) - 2));
    }, 3000);

    const demoUsers = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'User123'];
    const demoMessages = [
      'Xin chào! 👋',
      'Live hay quá! ❤️',
      'Chào mọi người!',
      'Đang xem nè 👀',
      '🔥🔥🔥',
      'Tuyệt vời!',
      'Ủng hộ bạn nè 💪',
      'Chất lượng tốt quá!',
      'Cố lên nhé ❤️',
    ];

    chatIntervalRef.current = setInterval(() => {
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        user: demoUsers[Math.floor(Math.random() * demoUsers.length)],
        text: demoMessages[Math.floor(Math.random() * demoMessages.length)],
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev.slice(-30), newMsg]);
    }, 4000);

    return () => {
      if (viewerIntervalRef.current) clearInterval(viewerIntervalRef.current);
      if (chatIntervalRef.current) clearInterval(chatIntervalRef.current);
    };
  }, [isStreaming]);

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const startStreaming = () => {
    if (!streamTitle.trim()) {
      toast.error("Vui lòng nhập tiêu đề cho buổi phát trực tiếp");
      return;
    }
    setIsStreaming(true);
    setViewerCount(1);
    startRecording();
    toast.success("Bắt đầu phát trực tiếp!");
  };

  const stopStreaming = () => {
    setIsStreaming(false);
    setViewerCount(0);
    stopRecording();
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const msg: ChatMessage = {
        id: Date.now().toString(),
        user: profile?.full_name || "Bạn",
        text: newMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, msg]);
      setNewMessage("");
    }
  };

  const addReaction = (emoji: string) => {
    const reaction: LiveReaction = {
      id: Date.now().toString() + Math.random(),
      emoji,
      x: Math.random() * 60 + 20
    };
    setReactions(prev => [...prev, reaction]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== reaction.id));
    }, 2500);
  };

  const toggleSticker = (stickerId: string) => {
    setActiveStickers(prev => 
      prev.includes(stickerId) 
        ? prev.filter(id => id !== stickerId)
        : [...prev, stickerId]
    );
  };

  const handleClose = () => {
    if (isStreaming) {
      stopStreaming();
    } else {
      stopStream();
      onOpenChange(false);
    }
  };

  const handleSaveToFeed = () => {
    if (recordedVideoUrl) {
      toast.success('Video đã được lưu! Bạn có thể đăng lên bảng tin.');
      // Here you would typically upload the video to storage and create a post
      setShowSaveDialog(false);
      setRecordedVideoUrl(null);
      onOpenChange(false);
    }
  };

  const handleDownloadVideo = () => {
    if (recordedVideoUrl) {
      const a = document.createElement('a');
      a.href = recordedVideoUrl;
      a.download = `live-stream-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Đang tải video...');
    }
  };

  const handleDiscardVideo = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(null);
    }
    setShowSaveDialog(false);
    onOpenChange(false);
  };

  const getCurrentFilter = () => {
    return FILTERS.find(f => f.id === selectedFilter)?.filter || '';
  };

  const getStickerPosition = (position: string) => {
    switch (position) {
      case 'top': return 'top-16 left-1/2 -translate-x-1/2';
      case 'top-left': return 'top-16 left-4';
      case 'top-right': return 'top-16 right-4';
      case 'bottom-left': return 'bottom-32 left-4';
      case 'bottom-right': return 'bottom-32 right-4';
      case 'center': return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      default: return 'top-16 left-4';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden bg-black">
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/70 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-white/50">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {profile?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-medium text-sm">{profile?.full_name || "Bạn"}</p>
                  {isStreaming && (
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs animate-pulse">
                        LIVE
                      </Badge>
                      <span className="text-white/80 text-xs flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {viewerCount}
                      </span>
                      {isRecording && (
                        <span className="text-red-400 text-xs flex items-center gap-1">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          REC
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Video Preview with Filter */}
          <div className="flex-1 relative bg-black overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ 
                transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                filter: getCurrentFilter()
              }}
            />
            
            {/* Active Stickers */}
            {activeStickers.map(stickerId => {
              const sticker = STICKERS.find(s => s.id === stickerId);
              if (!sticker) return null;
              return (
                <motion.div 
                  key={stickerId}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute ${getStickerPosition(sticker.position)} text-4xl md:text-6xl pointer-events-none`}
                  style={{ 
                    animation: 'bounce 2s infinite',
                    textShadow: '0 4px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  {sticker.emoji}
                </motion.div>
              );
            })}

            {/* Floating Reactions */}
            <AnimatePresence>
              {reactions.map(reaction => (
                <motion.div
                  key={reaction.id}
                  initial={{ bottom: 120, opacity: 1, scale: 1 }}
                  animate={{ bottom: 500, opacity: 0, scale: 1.5 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2.5, ease: 'easeOut' }}
                  className="absolute text-3xl pointer-events-none z-30"
                  style={{ left: `${reaction.x}%` }}
                >
                  {reaction.emoji}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center text-white">
                  <VideoOff className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p className="text-sm opacity-70">Camera đã tắt</p>
                </div>
              </div>
            )}
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-32 left-0 right-0 bg-black/90 p-4 backdrop-blur-sm z-30"
              >
                <p className="text-white text-sm mb-3 font-medium flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Bộ lọc màu
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {FILTERS.map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedFilter(filter.id)}
                      className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all ${
                        selectedFilter === filter.id
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary-foreground'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {filter.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sticker Panel */}
          <AnimatePresence>
            {showStickers && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-32 left-0 right-0 bg-black/90 p-4 backdrop-blur-sm z-30"
              >
                <p className="text-white text-sm mb-3 font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Sticker
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {STICKERS.map(sticker => (
                    <button
                      key={sticker.id}
                      onClick={() => toggleSticker(sticker.id)}
                      className={`flex-shrink-0 w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                        activeStickers.includes(sticker.id)
                          ? 'bg-primary ring-2 ring-primary-foreground scale-110'
                          : 'bg-white/20 hover:bg-white/30 hover:scale-105'
                      }`}
                    >
                      {sticker.emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stream Title Input (before streaming) */}
          {!isStreaming && (
            <div className="absolute bottom-28 left-4 right-4 z-20">
              <Input
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                placeholder="Hãy mô tả video trực tiếp của bạn..."
                className="bg-black/50 border-white/30 text-white placeholder:text-white/60 focus:border-primary"
              />
            </div>
          )}

          {/* Live Chat (during streaming) */}
          {isStreaming && (
            <div className="absolute bottom-28 left-4 right-4 z-20">
              <ScrollArea className="h-32 mb-2">
                <div className="space-y-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-2 bg-black/50 rounded-lg px-3 py-2">
                      <span className="text-primary text-sm font-medium">{msg.user}</span>
                      <span className="text-white text-sm">{msg.text}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Viết bình luận..."
                  className="flex-1 bg-black/50 border-white/30 text-white placeholder:text-white/60 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={sendMessage}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Reaction buttons when streaming */}
          {isStreaming && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
              {['❤️', '😂', '😮', '😢', '👏', '🔥'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => addReaction(emoji)}
                  className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-xl hover:scale-125 hover:bg-black/70 transition-all"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full ${isVideoEnabled ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}
                  onClick={toggleVideo}
                >
                  {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full ${isAudioEnabled ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}
                  onClick={toggleAudio}
                >
                  {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-white/20 text-white"
                  onClick={switchCamera}
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full text-white ${showFilters ? 'bg-primary' : 'bg-white/20'}`}
                  onClick={() => { setShowFilters(!showFilters); setShowStickers(false); }}
                >
                  <Palette className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full text-white ${showStickers ? 'bg-primary' : 'bg-white/20'}`}
                  onClick={() => { setShowStickers(!showStickers); setShowFilters(false); }}
                >
                  <Sparkles className="w-5 h-5" />
                </Button>
              </div>

              {isStreaming ? (
                <Button
                  onClick={stopStreaming}
                  className="bg-red-500 hover:bg-red-600 text-white px-6"
                >
                  Kết thúc
                </Button>
              ) : (
                <Button
                  onClick={startStreaming}
                  className="bg-red-500 hover:bg-red-600 text-white px-6"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Phát trực tiếp
                </Button>
              )}

              {isStreaming && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-white/20 text-white"
                    onClick={() => addReaction('❤️')}
                  >
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-white/20 text-white"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Video Dialog */}
        {showSaveDialog && recordedVideoUrl && (
          <div className="absolute inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl"
            >
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                Lưu video Live Stream
              </h3>
              <p className="text-muted-foreground text-sm">
                Bạn muốn làm gì với video live stream vừa kết thúc?
              </p>
              
              <video 
                src={recordedVideoUrl} 
                controls 
                className="w-full rounded-xl aspect-video bg-black"
              />

              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleSaveToFeed}
                  className="w-full gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Đăng lên bảng tin
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleDownloadVideo}
                  className="w-full gap-2"
                >
                  <Download className="w-4 h-4" />
                  Tải về thiết bị
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleDiscardVideo}
                  className="w-full text-muted-foreground hover:text-destructive"
                >
                  Hủy bỏ video
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
