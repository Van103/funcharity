import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  Image,
  Video,
  Smile,
  MapPin,
  Users,
  X,
} from "lucide-react";

interface CreatePostBoxProps {
  onPost?: (content: string) => void;
}

export function CreatePostBox({ onPost }: CreatePostBoxProps) {
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchAvatar(session.user.id);
      }
    });
  }, []);

  const fetchAvatar = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("user_id", userId)
      .single();
    if (data?.avatar_url) setAvatarUrl(data.avatar_url);
  };

  const handleSubmit = () => {
    if (content.trim()) {
      onPost?.(content);
      setContent("");
      setIsExpanded(false);
    }
  };

  return (
    <div className="glass-card p-4 mb-4">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback className="bg-primary/20 text-primary">
            {user?.user_metadata?.full_name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          {isExpanded ? (
            <>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Bạn đang nghĩ gì?"
                className="min-h-[100px] resize-none border-0 focus-visible:ring-0 p-0 text-base"
                autoFocus
              />
              
              {/* Action buttons */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-success">
                    <Image className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive">
                    <Video className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-warning">
                    <Smile className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-primary">
                    <MapPin className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-secondary">
                    <Users className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setIsExpanded(false);
                      setContent("");
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Hủy
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!content.trim()}
                  >
                    Đăng
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full text-left bg-muted/50 hover:bg-muted rounded-full px-4 py-2.5 text-muted-foreground transition-colors"
            >
              Bạn đang nghĩ gì?
            </button>
          )}
        </div>
      </div>

      {!isExpanded && (
        <div className="flex items-center justify-around mt-3 pt-3 border-t border-border">
          <Button variant="ghost" size="sm" className="flex-1 gap-2" onClick={() => setIsExpanded(true)}>
            <Video className="w-4 h-4 text-destructive" />
            <span className="hidden sm:inline">Video trực tiếp</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 gap-2" onClick={() => setIsExpanded(true)}>
            <Image className="w-4 h-4 text-success" />
            <span className="hidden sm:inline">Ảnh/Video</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 gap-2" onClick={() => setIsExpanded(true)}>
            <Smile className="w-4 h-4 text-warning" />
            <span className="hidden sm:inline">Cảm xúc</span>
          </Button>
        </div>
      )}
    </div>
  );
}