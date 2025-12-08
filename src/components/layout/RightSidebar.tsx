import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Diamond,
  UserPlus,
  Send,
  Search,
  Crown,
} from "lucide-react";

// Mock data
const topRanking = [
  { id: 1, name: "Camly Duong", score: "8C", avatar: null },
  { id: 2, name: "Elon Musk", score: "7C", avatar: null },
  { id: 3, name: "Lê Minh Trí", score: "2C", avatar: null },
  { id: 4, name: "Nguyễn Văn A", score: "1.5C", avatar: null },
  { id: 5, name: "Trần Thị B", score: "1C", avatar: null },
];

const suggestedFriends = [
  { id: 1, name: "Khai Phan", balance: "500 FUN", avatar: null },
  { id: 2, name: "Thu Thảo", balance: "1,200 FUN", avatar: null },
  { id: 3, name: "Minh Khoa", balance: "800 FUN", avatar: null },
];

const recentChats = [
  { id: 1, name: "Camly", message: "Sinh nhật vui vẻ! 🎂", time: "2m", avatar: null },
  { id: 2, name: "FUN Support", message: "Cảm ơn bạn đã quyên góp!", time: "1h", avatar: null },
];

interface RightSidebarProps {
  className?: string;
}

export function RightSidebar({ className }: RightSidebarProps) {
  const [chatMessage, setChatMessage] = useState("");

  return (
    <aside className={cn(
      "w-72 bg-card flex flex-col border-l border-border",
      className
    )}>
      {/* Top Ranking */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Diamond className="w-5 h-5 text-secondary" />
          <h3 className="font-semibold">Top Ranking</h3>
        </div>
        <div className="space-y-2">
          {topRanking.map((user, index) => (
            <div 
              key={user.id} 
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg",
                index === 0 && "bg-secondary/10"
              )}
            >
              <span className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                index === 0 ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {index + 1}
              </span>
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
              </div>
              <div className="flex items-center gap-1">
                <Diamond className="w-3 h-3 text-secondary" />
                <span className="text-xs font-bold text-secondary">{user.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Super App Wallet - Friends */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Crown className="w-5 h-5 text-secondary" />
          <h3 className="font-semibold">Kết Bạn</h3>
        </div>
        <div className="space-y-2">
          {suggestedFriends.map((friend) => (
            <div key={friend.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Avatar className="w-10 h-10">
                <AvatarImage src={friend.avatar || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {friend.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{friend.name}</p>
                <p className="text-xs text-muted-foreground">{friend.balance}</p>
              </div>
              <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Panel */}
      <div className="flex-1 flex flex-col p-4">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-semibold">Tin Nhắn</h3>
          <span className="text-xs bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full">2</span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm kiếm..." 
            className="pl-8 h-9 text-sm"
          />
        </div>

        {/* Chat list */}
        <div className="flex-1 space-y-1 overflow-y-auto">
          {recentChats.map((chat) => (
            <button 
              key={chat.id}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={chat.avatar || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {chat.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-card" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{chat.name}</p>
                <p className="text-xs text-muted-foreground truncate">{chat.message}</p>
              </div>
              <span className="text-xs text-muted-foreground">{chat.time}</span>
            </button>
          ))}
        </div>

        {/* Message input */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-border">
          <Input 
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Nhắn tin..."
            className="h-9 text-sm"
          />
          <Button variant="secondary" size="icon" className="h-9 w-9 shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}