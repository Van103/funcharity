import { useState } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Users,
  Clock,
  Verified,
  AlertTriangle,
  Gift,
  Zap,
  HandHeart,
} from "lucide-react";
import { FeedPost, useFeedReaction } from "@/hooks/useFeedPosts";
import { cn } from "@/lib/utils";

interface FeedPostCardProps {
  post: FeedPost;
  onShowMatches?: (postId: string) => void;
}

const urgencyConfig = {
  critical: {
    label: "Cấp Bách",
    className: "bg-destructive text-destructive-foreground animate-pulse",
    icon: AlertTriangle,
  },
  high: {
    label: "Cao",
    className: "bg-warning text-warning-foreground",
    icon: AlertTriangle,
  },
  medium: {
    label: "Trung Bình",
    className: "bg-secondary text-secondary-foreground",
    icon: Clock,
  },
  low: {
    label: "Thấp",
    className: "bg-muted text-muted-foreground",
    icon: Clock,
  },
};

const postTypeConfig = {
  need: {
    label: "Cần Hỗ Trợ",
    icon: HandHeart,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  supply: {
    label: "Sẵn Sàng Hỗ Trợ",
    icon: Gift,
    className: "bg-success/10 text-success border-success/20",
  },
  update: {
    label: "Cập Nhật",
    icon: Zap,
    className: "bg-primary/10 text-primary border-primary/20",
  },
  story: {
    label: "Câu Chuyện",
    icon: Heart,
    className: "bg-secondary/10 text-secondary border-secondary/20",
  },
};

const reactionEmojis = [
  { type: "like", emoji: "👍", label: "Thích" },
  { type: "love", emoji: "❤️", label: "Yêu thích" },
  { type: "support", emoji: "🙏", label: "Ủng hộ" },
  { type: "pray", emoji: "🤲", label: "Cầu nguyện" },
  { type: "celebrate", emoji: "🎉", label: "Chúc mừng" },
];

export function FeedPostCard({ post, onShowMatches }: FeedPostCardProps) {
  const [showReactions, setShowReactions] = useState(false);
  const { addReaction } = useFeedReaction(post.id);

  const postType = postTypeConfig[post.post_type];
  const PostTypeIcon = postType.icon;
  
  const urgency = post.urgency ? urgencyConfig[post.urgency] : null;
  const UrgencyIcon = urgency?.icon;

  const handleReaction = (type: string) => {
    addReaction.mutate(type);
    setShowReactions(false);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 luxury-border"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar className="w-12 h-12 border-2 border-secondary/20">
          <AvatarImage src={post.profiles?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10">
            {post.profiles?.full_name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold truncate">
              {post.profiles?.full_name || "Người dùng ẩn danh"}
            </span>
            {post.profiles?.is_verified && (
              <Verified className="w-4 h-4 text-secondary flex-shrink-0" />
            )}
            {post.profiles?.reputation_score && post.profiles.reputation_score > 0 && (
              <Badge variant="outline" className="text-xs">
                ⭐ {post.profiles.reputation_score}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {formatDistanceToNow(new Date(post.created_at), {
                addSuffix: true,
                locale: vi,
              })}
            </span>
            {post.location && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {post.location}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Post Type Badge */}
        <Badge className={cn("flex items-center gap-1", postType.className)}>
          <PostTypeIcon className="w-3 h-3" />
          {postType.label}
        </Badge>
      </div>

      {/* Urgency & Category for need/supply posts */}
      {(post.post_type === "need" || post.post_type === "supply") && (
        <div className="flex flex-wrap gap-2 mb-3">
          {urgency && (
            <Badge className={urgency.className}>
              {UrgencyIcon && <UrgencyIcon className="w-3 h-3 mr-1" />}
              {urgency.label}
            </Badge>
          )}
          {post.category && (
            <Badge variant="secondary" className="capitalize">
              {post.category.replace("_", " ")}
            </Badge>
          )}
          {post.beneficiaries_count > 0 && (
            <Badge variant="outline">
              <Users className="w-3 h-3 mr-1" />
              {post.beneficiaries_count} người thụ hưởng
            </Badge>
          )}
        </div>
      )}

      {/* Title */}
      {post.title && (
        <h3 className="font-display font-semibold text-lg mb-2">{post.title}</h3>
      )}

      {/* Content */}
      {post.content && (
        <p className="text-foreground/90 whitespace-pre-wrap mb-4">{post.content}</p>
      )}

      {/* Media */}
      {post.media_urls && post.media_urls.length > 0 && (
        <div
          className={cn(
            "grid gap-2 mb-4 rounded-xl overflow-hidden",
            post.media_urls.length === 1 && "grid-cols-1",
            post.media_urls.length === 2 && "grid-cols-2",
            post.media_urls.length >= 3 && "grid-cols-2"
          )}
        >
          {post.media_urls.slice(0, 4).map((url, index) => (
            <div
              key={index}
              className={cn(
                "relative aspect-video",
                post.media_urls.length === 3 && index === 0 && "col-span-2"
              )}
            >
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover"
              />
              {post.media_urls.length > 4 && index === 3 && (
                <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
                  <span className="text-background text-2xl font-bold">
                    +{post.media_urls.length - 4}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Campaign Link */}
      {post.campaigns && (
        <Link
          to={`/campaigns/${post.campaign_id}`}
          className="block mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            {post.campaigns.cover_image_url && (
              <img
                src={post.campaigns.cover_image_url}
                alt=""
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Chiến dịch liên quan</p>
              <p className="font-semibold">{post.campaigns.title}</p>
            </div>
          </div>
        </Link>
      )}

      {/* Target Amount Progress for need posts */}
      {post.post_type === "need" && post.target_amount > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-muted/50">
          <div className="flex justify-between text-sm mb-2">
            <span>Đã nhận: {post.fulfilled_amount?.toLocaleString() || 0}₫</span>
            <span className="text-muted-foreground">
              Mục tiêu: {post.target_amount.toLocaleString()}₫
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
              style={{
                width: `${Math.min(100, ((post.fulfilled_amount || 0) / post.target_amount) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div className="flex items-center gap-1">
          {/* Reaction Button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
            >
              <Heart className="w-4 h-4" />
              {post.reactions_count || 0}
            </Button>

            {/* Reaction Picker */}
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute bottom-full left-0 mb-2 p-2 rounded-full bg-card border border-border shadow-lg flex gap-1"
                onMouseEnter={() => setShowReactions(true)}
                onMouseLeave={() => setShowReactions(false)}
              >
                {reactionEmojis.map(({ type, emoji, label }) => (
                  <button
                    key={type}
                    onClick={() => handleReaction(type)}
                    className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center text-xl transition-transform hover:scale-125"
                    title={label}
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <Button variant="ghost" size="sm" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            {post.comments_count || 0}
          </Button>

          <Button variant="ghost" size="sm">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Match Button for need posts */}
        {post.post_type === "need" && !post.is_matched && onShowMatches && (
          <Button
            variant="hero"
            size="sm"
            onClick={() => onShowMatches(post.id)}
          >
            <Zap className="w-4 h-4 mr-1" />
            Tìm Kết Nối
          </Button>
        )}

        {post.is_matched && (
          <Badge variant="success">
            <Verified className="w-3 h-3 mr-1" />
            Đã Kết Nối
          </Badge>
        )}
      </div>
    </motion.article>
  );
}
