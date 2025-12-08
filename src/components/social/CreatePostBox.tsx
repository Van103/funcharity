import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, Video, Sparkles } from "lucide-react";

interface CreatePostBoxProps {
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  onCreatePost?: () => void;
}

export function CreatePostBox({ profile, onCreatePost }: CreatePostBoxProps) {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="w-10 h-10 border-2 border-secondary/30">
          <AvatarImage src={profile?.avatar_url || ""} />
          <AvatarFallback className="bg-secondary/20">
            {profile?.full_name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <Input
          placeholder="Đăng bài để nhận từ 999 Happy Camly Coin trở lên nhé 🎉"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 bg-muted/50 border-none rounded-full px-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-secondary"
        />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 gap-2"
          >
            <Image className="w-5 h-5 text-success" />
            <span className="hidden sm:inline">Ảnh/Bài viết</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 gap-2"
          >
            <Video className="w-5 h-5 text-destructive" />
            <span className="hidden sm:inline">Video</span>
          </Button>
        </div>
        <Button 
          size="sm" 
          className="bg-gradient-to-r from-secondary to-secondary-light text-secondary-foreground gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Enjoy AI
        </Button>
      </div>
    </div>
  );
}
