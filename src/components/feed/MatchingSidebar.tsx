import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Zap,
  MapPin,
  Star,
  Check,
  X,
  Loader2,
  Sparkles,
  Target,
  Users,
  TrendingUp,
} from "lucide-react";
import { useFeedMatches, useFeedPosts } from "@/hooks/useFeedPosts";
import { cn } from "@/lib/utils";

interface MatchingSidebarProps {
  selectedNeedId: string | null;
  onClose: () => void;
}

interface MatchResult {
  need_post_id: string;
  supply_post_id: string;
  match_score: number;
  geo_score: number;
  category_score: number;
  urgency_score: number;
  reputation_score: number;
}

export function MatchingSidebar({ selectedNeedId, onClose }: MatchingSidebarProps) {
  const { data: matches, isLoading } = useFeedMatches(selectedNeedId || undefined);
  const { data: supplyPosts } = useFeedPosts("supply");

  const getSupplyPost = (supplyId: string) => {
    return supplyPosts?.find((p) => p.id === supplyId);
  };

  return (
    <AnimatePresence>
      {selectedNeedId && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed right-0 top-0 h-full w-full max-w-md bg-card/95 backdrop-blur-xl border-l border-border shadow-2xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-secondary/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-bold">Smart Matching</h3>
                  <p className="text-xs text-muted-foreground">
                    Kết nối thông minh dựa trên AI
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Matching Criteria Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Khu vực</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-secondary" />
                <span>Danh mục</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-warning" />
                <span>Mức độ khẩn</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-success" />
                <span>Uy tín</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 h-[calc(100vh-200px)] overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Đang tìm kết nối phù hợp...</p>
              </div>
            ) : matches && matches.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Tìm thấy <span className="font-bold text-foreground">{matches.length}</span> kết nối tiềm năng
                </p>

                {matches.map((match: MatchResult, index: number) => {
                  const supply = getSupplyPost(match.supply_post_id);
                  if (!supply) return null;

                  return (
                    <motion.div
                      key={match.supply_post_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-card p-4 luxury-border"
                    >
                      {/* Match Score */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                              match.match_score >= 80
                                ? "bg-success/20 text-success"
                                : match.match_score >= 60
                                ? "bg-secondary/20 text-secondary"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {Math.round(match.match_score)}
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Điểm phù hợp</p>
                            <Progress
                              value={match.match_score}
                              className="h-1.5 w-20"
                            />
                          </div>
                        </div>
                        {match.match_score >= 80 && (
                          <Badge variant="success" className="gap-1">
                            <Sparkles className="w-3 h-3" />
                            Tốt nhất
                          </Badge>
                        )}
                      </div>

                      {/* Supplier Info */}
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={supply.profiles?.avatar_url || undefined} />
                          <AvatarFallback>
                            {supply.profiles?.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">
                            {supply.profiles?.full_name || "Người hỗ trợ"}
                          </p>
                          {supply.location && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {supply.location}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Supply Post Content */}
                      {supply.title && (
                        <h4 className="font-semibold text-sm mb-1">{supply.title}</h4>
                      )}
                      {supply.content && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {supply.content}
                        </p>
                      )}

                      {/* Score Breakdown */}
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">
                            <MapPin className="w-3 h-3 mx-auto" />
                          </div>
                          <p className="text-sm font-bold">{match.geo_score}</p>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">
                            <Target className="w-3 h-3 mx-auto" />
                          </div>
                          <p className="text-sm font-bold">{match.category_score}</p>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">
                            <TrendingUp className="w-3 h-3 mx-auto" />
                          </div>
                          <p className="text-sm font-bold">{match.urgency_score}</p>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">
                            <Star className="w-3 h-3 mx-auto" />
                          </div>
                          <p className="text-sm font-bold">{match.reputation_score}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <X className="w-4 h-4 mr-1" />
                          Bỏ qua
                        </Button>
                        <Button variant="hero" size="sm" className="flex-1">
                          <Check className="w-4 h-4 mr-1" />
                          Kết nối
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-semibold mb-1">Chưa tìm thấy kết nối</p>
                <p className="text-sm text-muted-foreground">
                  Hiện chưa có nguồn lực phù hợp với nhu cầu này.
                  <br />
                  Hãy thử lại sau!
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
