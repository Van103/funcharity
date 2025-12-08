import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Verified,
  Coins,
  Image as ImageIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface SocialFeedCardProps {
  post: {
    id: string;
    author: {
      name: string;
      avatar?: string;
      isVerified?: boolean;
    };
    content: string;
    images?: string[];
    createdAt: Date;
    likes: number;
    comments: number;
    shares: number;
    funReward?: number;
  };
}

export function SocialFeedCard({ post }: SocialFeedCardProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
  };

  return (
    <div className="glass-card p-4">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post.author.avatar} />
          <AvatarFallback className="bg-primary/20 text-primary">
            {post.author.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm">{post.author.name}</span>
            {post.author.isVerified && (
              <Verified className="w-4 h-4 text-secondary fill-secondary" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: vi })}
          </p>
        </div>

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>

      {/* FUN Reward Badge */}
      {post.funReward && (
        <Badge variant="secondary" className="mb-3 gap-1">
          <Coins className="w-3 h-3" />
          +{post.funReward} $FUN
        </Badge>
      )}

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className={`grid gap-2 mb-3 ${
          post.images.length === 1 ? 'grid-cols-1' : 
          post.images.length === 2 ? 'grid-cols-2' : 
          'grid-cols-2'
        }`}>
          {post.images.slice(0, 4).map((image, index) => (
            <div 
              key={index} 
              className={`relative rounded-xl overflow-hidden bg-muted aspect-video ${
                post.images!.length === 3 && index === 0 ? 'col-span-2' : ''
              }`}
            >
              <img 
                src={image} 
                alt="" 
                className="w-full h-full object-cover"
              />
              {post.images!.length > 4 && index === 3 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">+{post.images!.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`gap-1.5 ${liked ? 'text-destructive' : ''}`}
          onClick={handleLike}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          <span>{likesCount}</span>
        </Button>

        <Button variant="ghost" size="sm" className="gap-1.5">
          <MessageCircle className="w-4 h-4" />
          <span>{post.comments}</span>
        </Button>

        <Button variant="ghost" size="sm" className="gap-1.5">
          <Share2 className="w-4 h-4" />
          <span>{post.shares}</span>
        </Button>
      </div>
    </div>
  );
}