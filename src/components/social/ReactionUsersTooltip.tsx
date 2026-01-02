import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { REACTIONS } from "./FeedReactionPicker";

interface ReactionUser {
  user_id: string;
  reaction_type: string;
  full_name: string | null;
}

interface ReactionUsersTooltipProps {
  postId: string;
  children: React.ReactNode;
}

export function ReactionUsersTooltip({ postId, children }: ReactionUsersTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Fetch reaction users with profiles
  const { data: reactionUsers = [], isLoading } = useQuery({
    queryKey: ["reaction-users", postId],
    queryFn: async () => {
      const { data: reactions, error } = await supabase
        .from("feed_reactions")
        .select("user_id, reaction_type")
        .eq("feed_post_id", postId)
        .limit(20);

      if (error || !reactions || reactions.length === 0) return [];

      const userIds = [...new Set(reactions.map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      return reactions.map((r) => ({
        user_id: r.user_id,
        reaction_type: r.reaction_type,
        full_name: profiles?.find((p) => p.user_id === r.user_id)?.full_name || "Người dùng",
      })) as ReactionUser[];
    },
    enabled: isHovered,
    staleTime: 30000,
  });

  // Group users by reaction type
  const groupedByType = reactionUsers.reduce((acc, user) => {
    if (!acc[user.reaction_type]) {
      acc[user.reaction_type] = [];
    }
    acc[user.reaction_type].push(user.full_name || "Người dùng");
    return acc;
  }, {} as Record<string, string[]>);

  const displayNames = reactionUsers.slice(0, 10).map((u) => u.full_name || "Người dùng");
  const remainingCount = reactionUsers.length > 10 ? reactionUsers.length - 10 : 0;

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 z-50"
          >
            <div className="bg-foreground/90 text-background text-xs rounded-lg px-3 py-2 shadow-lg min-w-[160px] max-w-[280px]">
              {isLoading ? (
                <div className="text-center py-1">Đang tải...</div>
              ) : reactionUsers.length === 0 ? (
                <div className="text-center py-1">Chưa có ai thích</div>
              ) : (
                <div className="space-y-1.5">
                  {/* Grouped by reaction type */}
                  {Object.entries(groupedByType).map(([type, names]) => {
                    const reaction = REACTIONS.find((r) => r.type === type);
                    return (
                      <div key={type} className="flex items-start gap-1.5">
                        <span className="text-sm flex-shrink-0">{reaction?.emoji || "👍"}</span>
                        <div className="flex-1 leading-relaxed">
                          {names.slice(0, 5).join(", ")}
                          {names.length > 5 && (
                            <span className="text-background/70">
                              {" "}và {names.length - 5} người khác
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Total remaining */}
                  {remainingCount > 0 && (
                    <div className="text-background/70 text-[10px] pt-1 border-t border-background/20">
                      và {remainingCount} người khác...
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Arrow */}
            <div className="absolute left-4 -bottom-1 w-2 h-2 bg-foreground/90 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
