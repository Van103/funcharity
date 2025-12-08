import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, UserPlus, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface FriendRequest {
  id: string;
  userName: string;
  avatar?: string;
  mutualFriends: number;
  verified?: boolean;
}

const mockRequests: FriendRequest[] = [
  { id: "1", userName: "Anh Elgon", mutualFriends: 25, verified: true },
  { id: "2", userName: "Na Trần", mutualFriends: 2, verified: true },
  { id: "3", userName: "Nông Liên", mutualFriends: 20, verified: true },
  { id: "4", userName: "Trần Tâm", mutualFriends: 20, verified: true },
];

const mockSuggestions: FriendRequest[] = [
  { id: "5", userName: "Khôi Phan", mutualFriends: 26, verified: true },
  { id: "6", userName: "Thu Thanh Hoàng", mutualFriends: 22, verified: true },
  { id: "7", userName: "Phạm Hằng", mutualFriends: 2, verified: true },
  { id: "8", userName: "Trang Huyền", mutualFriends: 11 },
];

export function FriendRequestsSection() {
  return (
    <div className="space-y-6">
      {/* Friend Requests */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Lời mời kết bạn</h3>
          <button className="text-sm text-secondary hover:underline flex items-center gap-1">
            Xem tất cả <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {mockRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="shrink-0 w-40 p-3 rounded-xl bg-muted/30 border border-border/50"
            >
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-16 h-16 border-2 border-secondary/30 mb-2">
                  <AvatarImage src={request.avatar} />
                  <AvatarFallback className="bg-primary/10 text-lg">
                    {request.userName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-medium text-sm truncate max-w-full">
                    {request.userName}
                  </span>
                  {request.verified && <span className="text-secondary">💜</span>}
                </div>
                <span className="text-xs text-muted-foreground mb-3">
                  {request.mutualFriends} bạn chung
                </span>
                <div className="flex flex-col gap-2 w-full">
                  <Button size="sm" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    Xác nhận
                  </Button>
                  <Button size="sm" variant="outline" className="w-full">
                    Xóa
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* People You May Know */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Những người bạn có thể biết</h3>
          <button className="text-sm text-secondary hover:underline flex items-center gap-1">
            Xem tất cả <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {mockSuggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="shrink-0 w-40 p-3 rounded-xl bg-muted/30 border border-border/50"
            >
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-16 h-16 border-2 border-secondary/30 mb-2">
                  <AvatarImage src={suggestion.avatar} />
                  <AvatarFallback className="bg-primary/10 text-lg">
                    {suggestion.userName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-medium text-sm truncate max-w-full">
                    {suggestion.userName}
                  </span>
                  {suggestion.verified && <span className="text-secondary">💜</span>}
                </div>
                <span className="text-xs text-muted-foreground mb-3">
                  {suggestion.mutualFriends} bạn chung
                </span>
                <Button size="sm" variant="outline" className="w-full">
                  <UserPlus className="w-3 h-3 mr-1" />
                  Thêm bạn bè
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
