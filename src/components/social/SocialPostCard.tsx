import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MoreHorizontal,
  Heart,
  MessageCircle,
  Share2,
  Gift,
  Send,
  Image as ImageIcon,
  Smile,
  Coins,
} from "lucide-react";
import { motion } from "framer-motion";

interface MediaItem {
  url: string;
  type: "image" | "video";
}

interface SocialPost {
  id: string;
  user: {
    name: string;
    avatar?: string;
    verified?: boolean;
    location?: string;
  };
  content: string;
  media?: MediaItem[];
  earnAmount?: string;
  createdAt: string;
  reactions: {
    total: number;
    types: string[];
  };
  comments: number;
  shares: number;
}

interface SocialPostCardProps {
  post: SocialPost;
}

export function SocialPostCard({ post }: SocialPostCardProps) {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-secondary/30">
              <AvatarImage src={post.user.avatar} />
              <AvatarFallback className="bg-secondary/20">
                {post.user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{post.user.name}</span>
                {post.user.verified && <span className="text-secondary">💜</span>}
                {post.user.location && (
                  <>
                    <span className="text-muted-foreground text-sm">cùng với</span>
                    <span className="text-secondary text-sm font-medium">{post.user.location}</span>
                  </>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{post.createdAt}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {post.earnAmount && (
              <Badge variant="outline" className="text-secondary border-secondary/30 gap-1">
                <Coins className="w-3 h-3" />
                Đã EARN {post.earnAmount}
              </Badge>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {post.content}
        </div>
      </div>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className="relative">
          {post.media.length === 1 ? (
            post.media[0].type === "video" ? (
              <video
                src={post.media[0].url}
                controls
                className="w-full max-h-[500px] object-cover"
              />
            ) : (
              <img
                src={post.media[0].url}
                alt=""
                className="w-full max-h-[500px] object-cover"
              />
            )
          ) : (
            <div className={`grid gap-1 ${
              post.media.length === 2 ? "grid-cols-2" :
              post.media.length === 3 ? "grid-cols-2" :
              "grid-cols-2"
            }`}>
              {post.media.slice(0, 4).map((item, i) => (
                <div 
                  key={i}
                  className={`relative ${
                    post.media!.length === 3 && i === 0 ? "row-span-2" : ""
                  }`}
                >
                  {item.type === "video" ? (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover aspect-square"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt=""
                      className="w-full h-full object-cover aspect-square"
                    />
                  )}
                  {i === 3 && post.media!.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        +{post.media!.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            {post.reactions.types.map((type, i) => (
              <span key={i} className="text-base">{type}</span>
            ))}
          </div>
          <span>{post.reactions.total.toLocaleString()} người đã bày tỏ cảm xúc</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{post.comments.toLocaleString()} Bình luận</span>
          <span>{post.shares.toLocaleString()} lượt chia sẻ</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-2 border-t border-border flex items-center justify-around">
        <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground hover:text-secondary">
          <Heart className="w-5 h-5" />
          Thương thương
        </Button>
        <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground hover:text-foreground">
          <span className="text-lg">😊</span>
          Nhong nhác
        </Button>
        <Button 
          variant="ghost" 
          className="flex-1 gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => setShowCommentInput(!showCommentInput)}
        >
          <MessageCircle className="w-5 h-5" />
          Bình luận
        </Button>
        <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground hover:text-foreground">
          <Gift className="w-5 h-5" />
          Tặng
        </Button>
        <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground hover:text-foreground">
          <Share2 className="w-5 h-5" />
          Chia sẻ
        </Button>
      </div>

      {/* Comments Section */}
      {showCommentInput && (
        <div className="px-4 py-3 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <span>Xem thêm bình luận</span>
          </div>

          {/* Sample comment */}
          <div className="flex gap-2 mb-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/10 text-xs">L</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-muted/50 rounded-2xl px-3 py-2">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-sm">Lê Minh Trí</span>
                  <span className="text-secondary">💜</span>
                </div>
                <p className="text-sm">Dạ biết ơn lời dạy của Cha và của chị q!!! 🥰🥰</p>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground px-2">
                <span>1 ngày</span>
                <button className="hover:underline">Thích</button>
                <button className="hover:underline">Phản hồi</button>
              </div>
            </div>
          </div>

          {/* Comment input */}
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-secondary/20 text-xs">U</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-full px-3 py-2">
              <Input
                placeholder="Viết bình luận..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="border-none bg-transparent p-0 h-auto focus-visible:ring-0 text-sm"
              />
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Smile className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Gift className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
