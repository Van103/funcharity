import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Heart,
  Sparkles,
  Globe,
  Sprout,
  Gamepad2,
  Crown,
  ChevronRight,
  Gift,
  ExternalLink,
  Users,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import funProfileLogo from "@/assets/fun-profile-logo.webp";
import funFarmLogo from "@/assets/fun-farm-logo.png";
import funPlanetLogo from "@/assets/fun-planet-logo.png";
import funPlayLogo from "@/assets/fun-play-logo.png";

// Ecosystem platforms
const ECOSYSTEM_PLATFORMS = [
  { 
    id: "charity", 
    name: "FUN Charity", 
    icon: Heart, 
    color: "from-pink-500 to-rose-500",
    url: "/social",
    description: "Từ thiện minh bạch"
  },
  { 
    id: "farm", 
    name: "FUN Farm", 
    icon: Sprout, 
    logo: funFarmLogo,
    color: "from-emerald-500 to-green-500",
    url: "https://funfarm.life/feed",
    description: "Nông trại vui vẻ"
  },
  { 
    id: "planet", 
    name: "FUN Planet", 
    icon: Globe, 
    logo: funPlanetLogo,
    color: "from-blue-500 to-cyan-500",
    url: "https://planet.fun.rich/",
    description: "Khám phá vũ trụ"
  },
  { 
    id: "play", 
    name: "FUN Play", 
    icon: Gamepad2, 
    logo: funPlayLogo,
    color: "from-purple-500 to-violet-500",
    url: "https://play.fun.rich/",
    description: "Game & Giải trí"
  },
  { 
    id: "profile", 
    name: "FUN Profile", 
    icon: Crown, 
    logo: funProfileLogo,
    color: "from-amber-500 to-yellow-500",
    url: "https://fun.rich/",
    description: "Hồ sơ FUN ID"
  },
];

// Mock ecosystem friends data
const ECOSYSTEM_FRIENDS = [
  // From Fun Farm
  {
    id: "farm-1",
    name: "Nông Dân Vui Vẻ",
    avatar: "🧑‍🌾",
    platform: "farm",
    badges: ["top_farmer", "eco_friendly"],
    bio: "Yêu cây cối, thích làm vườn! 🌱",
    level: 42,
    isOnline: true,
    mutualFriends: 12,
  },
  {
    id: "farm-2", 
    name: "Chị Hai Lúa",
    avatar: "👩‍🌾",
    platform: "farm",
    badges: ["harvest_master"],
    bio: "Mùa màng bội thu! 🌾",
    level: 38,
    isOnline: true,
    mutualFriends: 8,
  },
  {
    id: "farm-3",
    name: "Bác Nông Nghiệp",
    avatar: "👨‍🌾",
    platform: "farm",
    badges: ["veteran_farmer"],
    bio: "30 năm kinh nghiệm canh tác 🚜",
    level: 65,
    isOnline: false,
    mutualFriends: 5,
  },
  // From Fun Planet
  {
    id: "planet-1",
    name: "Nhà Thám Hiểm Sao",
    avatar: "🧑‍🚀",
    platform: "planet",
    badges: ["explorer", "pioneer"],
    bio: "Bay xa hơn, khám phá nhiều hơn! 🚀",
    level: 55,
    isOnline: true,
    mutualFriends: 15,
  },
  {
    id: "planet-2",
    name: "Captain Galaxy",
    avatar: "👨‍🚀",
    platform: "planet",
    badges: ["commander"],
    bio: "Đội trưởng phi đội Alpha 🌌",
    level: 78,
    isOnline: false,
    mutualFriends: 20,
  },
  {
    id: "planet-3",
    name: "Star Seeker",
    avatar: "👩‍🚀",
    platform: "planet",
    badges: ["scientist"],
    bio: "Nghiên cứu các vì sao ⭐",
    level: 45,
    isOnline: true,
    mutualFriends: 7,
  },
  // From Fun Play
  {
    id: "play-1",
    name: "Pro Gamer VN",
    avatar: "🎮",
    platform: "play",
    badges: ["esports_pro", "streamer"],
    bio: "Top 1 rank mùa này! 🏆",
    level: 99,
    isOnline: true,
    mutualFriends: 45,
  },
  {
    id: "play-2",
    name: "Game Master",
    avatar: "🕹️",
    platform: "play",
    badges: ["achievement_hunter"],
    bio: "100% hoàn thành mọi game 🎯",
    level: 88,
    isOnline: true,
    mutualFriends: 32,
  },
  // From Fun Charity
  {
    id: "charity-1",
    name: "Thiên Sứ Nhỏ",
    avatar: "👼",
    platform: "charity",
    badges: ["donor_gold", "volunteer_hero"],
    bio: "Lan tỏa yêu thương mỗi ngày 💕",
    level: 50,
    isOnline: true,
    mutualFriends: 28,
  },
  {
    id: "charity-2",
    name: "Mạnh Thường Quân",
    avatar: "🤝",
    platform: "charity",
    badges: ["donor_diamond", "verified_ngo"],
    bio: "Cùng nhau xây dựng cộng đồng 🏠",
    level: 72,
    isOnline: false,
    mutualFriends: 55,
  },
  // From Fun Profile
  {
    id: "profile-1",
    name: "FUN Ambassador",
    avatar: "🌟",
    platform: "profile",
    badges: ["early_adopter", "community_leader"],
    bio: "Đại sứ FUN Ecosystem chính thức ✨",
    level: 100,
    isOnline: true,
    mutualFriends: 120,
  },
  {
    id: "profile-2",
    name: "NFT Collector",
    avatar: "🎨",
    platform: "profile",
    badges: ["nft_whale", "art_lover"],
    bio: "Sưu tầm NFT độc đáo 🖼️",
    level: 68,
    isOnline: true,
    mutualFriends: 18,
  },
];

// Badge display mapping
const BADGE_DISPLAY: Record<string, { emoji: string; label: string; color: string }> = {
  top_farmer: { emoji: "🥇", label: "Top Nông Dân", color: "bg-emerald-100 text-emerald-700" },
  eco_friendly: { emoji: "🌿", label: "Thân Thiện", color: "bg-green-100 text-green-700" },
  harvest_master: { emoji: "🌾", label: "Vua Thu Hoạch", color: "bg-amber-100 text-amber-700" },
  veteran_farmer: { emoji: "🚜", label: "Lão Nông", color: "bg-orange-100 text-orange-700" },
  explorer: { emoji: "🔭", label: "Thám Hiểm", color: "bg-blue-100 text-blue-700" },
  pioneer: { emoji: "🚀", label: "Tiên Phong", color: "bg-indigo-100 text-indigo-700" },
  commander: { emoji: "⭐", label: "Chỉ Huy", color: "bg-purple-100 text-purple-700" },
  scientist: { emoji: "🔬", label: "Nhà Khoa Học", color: "bg-cyan-100 text-cyan-700" },
  esports_pro: { emoji: "🏆", label: "Pro Player", color: "bg-yellow-100 text-yellow-700" },
  streamer: { emoji: "📺", label: "Streamer", color: "bg-red-100 text-red-700" },
  achievement_hunter: { emoji: "🎯", label: "Achievement", color: "bg-pink-100 text-pink-700" },
  donor_gold: { emoji: "💛", label: "Nhà Hảo Tâm", color: "bg-yellow-100 text-yellow-700" },
  donor_diamond: { emoji: "💎", label: "Kim Cương", color: "bg-sky-100 text-sky-700" },
  volunteer_hero: { emoji: "🦸", label: "Anh Hùng", color: "bg-rose-100 text-rose-700" },
  verified_ngo: { emoji: "✅", label: "Xác Thực", color: "bg-teal-100 text-teal-700" },
  early_adopter: { emoji: "🌟", label: "Tiên Phong", color: "bg-amber-100 text-amber-700" },
  community_leader: { emoji: "👑", label: "Thủ Lĩnh", color: "bg-purple-100 text-purple-700" },
  nft_whale: { emoji: "🐋", label: "NFT Whale", color: "bg-blue-100 text-blue-700" },
  art_lover: { emoji: "🎨", label: "Nghệ Thuật", color: "bg-pink-100 text-pink-700" },
};

// Get platform info
const getPlatformInfo = (platformId: string) => {
  return ECOSYSTEM_PLATFORMS.find(p => p.id === platformId) || ECOSYSTEM_PLATFORMS[0];
};

interface EcosystemFriendsSectionProps {
  showCompact?: boolean;
}

export function EcosystemFriendsSection({ showCompact = false }: EcosystemFriendsSectionProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<typeof ECOSYSTEM_FRIENDS[0] | null>(null);
  const [addedFriends, setAddedFriends] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const filteredFriends = selectedPlatform 
    ? ECOSYSTEM_FRIENDS.filter(f => f.platform === selectedPlatform)
    : ECOSYSTEM_FRIENDS;

  const displayFriends = showCompact ? filteredFriends.slice(0, 6) : filteredFriends;

  const handleAddFriend = (friendId: string, friendName: string) => {
    setAddedFriends(prev => new Set([...prev, friendId]));
    toast({
      title: "🎉 Đã gửi lời mời kết bạn!",
      description: `Lời mời đã được gửi đến ${friendName}`,
    });
  };

  const handleInviteToCampaign = (friend: typeof ECOSYSTEM_FRIENDS[0]) => {
    setSelectedFriend(friend);
    setInviteDialogOpen(true);
  };

  const confirmInvite = () => {
    if (selectedFriend) {
      toast({
        title: "💝 Đã mời tham gia!",
        description: `${selectedFriend.name} sẽ nhận được lời mời donate cùng bạn!`,
      });
    }
    setInviteDialogOpen(false);
    setSelectedFriend(null);
  };

  return (
    <>
      <div className="mobile-card p-3 sm:p-4 bg-gradient-to-br from-purple-50/80 via-pink-50/60 to-amber-50/80 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-amber-900/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm sm:text-base">
                🌈 Cộng Đồng FUN Ecosystem
              </h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Kết nối bạn bè từ Fun Farm, Planet, Play & hơn thế nữa!
              </p>
            </div>
          </div>
          <Link to="/friends" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
            Xem tất cả
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* FUN ID Login Hint */}
        <div className="mb-3 p-2.5 rounded-xl bg-gradient-to-r from-amber-100/80 to-yellow-100/80 dark:from-amber-900/30 dark:to-yellow-900/30 border border-amber-200/50 dark:border-amber-700/50">
          <div className="flex items-center gap-2">
            <img src={funProfileLogo} alt="FUN Profile" className="w-6 h-6 rounded-full" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                🔐 Đăng nhập bằng FUN ID
              </p>
              <p className="text-[10px] text-amber-600 dark:text-amber-300 truncate">
                Xem bạn bè từ tất cả dự án FUN Ecosystem!
              </p>
            </div>
            <Button size="sm" variant="secondary" className="h-7 text-xs bg-amber-500 hover:bg-amber-600 text-white border-0">
              Kết nối
            </Button>
          </div>
        </div>

        {/* Platform Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
          <button
            onClick={() => setSelectedPlatform(null)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all no-tap-highlight",
              !selectedPlatform 
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Tất cả ✨
          </button>
          {ECOSYSTEM_PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id === selectedPlatform ? null : platform.id)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 no-tap-highlight",
                selectedPlatform === platform.id
                  ? `bg-gradient-to-r ${platform.color} text-white shadow-md`
                  : "bg-white/80 dark:bg-white/10 text-foreground hover:bg-white dark:hover:bg-white/20 border border-border"
              )}
            >
              {platform.logo ? (
                <img src={platform.logo} alt="" className="w-4 h-4 rounded-full" />
              ) : (
                <platform.icon className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{platform.name.replace("FUN ", "")}</span>
            </button>
          ))}
        </div>

        {/* Friends Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
          <AnimatePresence mode="popLayout">
            {displayFriends.map((friend, index) => {
              const platform = getPlatformInfo(friend.platform);
              const isAdded = addedFriends.has(friend.id);
              
              return (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative bg-white dark:bg-white/5 rounded-xl p-3 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  {/* Online indicator */}
                  {friend.isOnline && (
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white dark:border-background animate-pulse" />
                  )}

                  {/* Avatar */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`p-0.5 rounded-full bg-gradient-to-br ${platform.color} mb-2`}>
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white dark:bg-background flex items-center justify-center text-2xl sm:text-3xl">
                        {friend.avatar}
                      </div>
                    </div>
                    
                    {/* Name & Platform */}
                    <h4 className="font-semibold text-foreground text-xs sm:text-sm line-clamp-1">
                      {friend.name}
                    </h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      {platform.logo ? (
                        <img src={platform.logo} alt="" className="w-3 h-3 rounded-full" />
                      ) : (
                        <platform.icon className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {platform.name.replace("FUN ", "")}
                      </span>
                    </div>

                    {/* Level Badge */}
                    <Badge variant="outline" className="mt-1.5 text-[10px] px-1.5 py-0 h-4">
                      Lv.{friend.level}
                    </Badge>

                    {/* Badges */}
                    <div className="flex flex-wrap justify-center gap-1 mt-1.5">
                      {friend.badges.slice(0, 2).map((badge) => {
                        const badgeInfo = BADGE_DISPLAY[badge];
                        if (!badgeInfo) return null;
                        return (
                          <span 
                            key={badge} 
                            className={`text-[10px] px-1.5 py-0.5 rounded-full ${badgeInfo.color}`}
                            title={badgeInfo.label}
                          >
                            {badgeInfo.emoji}
                          </span>
                        );
                      })}
                    </div>

                    {/* Mutual Friends */}
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {friend.mutualFriends} bạn chung
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 mt-2 w-full">
                      <Button
                        size="sm"
                        variant={isAdded ? "secondary" : "default"}
                        className={cn(
                          "flex-1 h-7 text-[10px] sm:text-xs gap-1",
                          isAdded && "bg-green-100 text-green-700 hover:bg-green-100"
                        )}
                        onClick={() => handleAddFriend(friend.id, friend.name)}
                        disabled={isAdded}
                      >
                        {isAdded ? (
                          <>✓ Đã gửi</>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3" />
                            Kết bạn
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0"
                        onClick={() => handleInviteToCampaign(friend)}
                        title="Mời donate cùng"
                      >
                        <Gift className="w-3 h-3 text-pink-500" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* View More Button */}
        {showCompact && filteredFriends.length > 6 && (
          <div className="mt-3 text-center">
            <Link to="/friends">
              <Button variant="outline" size="sm" className="text-xs gap-1">
                Xem thêm {filteredFriends.length - 6} người bạn
                <ChevronRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        )}

        {/* Platform Links */}
        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-[10px] text-muted-foreground text-center mb-2">
            🚀 Khám phá thêm các dự án trong FUN Ecosystem
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            {ECOSYSTEM_PLATFORMS.slice(1).map((platform) => (
              <a
                key={platform.id}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/80 dark:bg-white/10 border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all text-xs text-muted-foreground hover:text-foreground no-tap-highlight"
              >
                {platform.logo ? (
                  <img src={platform.logo} alt="" className="w-4 h-4 rounded-full" />
                ) : (
                  <platform.icon className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">{platform.name}</span>
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Invite to Campaign Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-pink-500" />
              Mời bạn cùng Donate! 💝
            </DialogTitle>
            <DialogDescription>
              {selectedFriend && (
                <div className="flex items-center gap-3 mt-3 p-3 rounded-xl bg-muted/50">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-2xl">
                    {selectedFriend.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{selectedFriend.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {getPlatformInfo(selectedFriend.platform).name}
                    </p>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Gửi lời mời đến <strong>{selectedFriend?.name}</strong> để cùng nhau đóng góp cho các chiến dịch từ thiện trên FUN Charity! 🎉
            </p>
            <div className="p-3 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border border-pink-200/50 dark:border-pink-700/50">
              <p className="text-xs text-pink-700 dark:text-pink-300">
                💡 <strong>Tip:</strong> Khi cùng donate, cả hai sẽ nhận được badge đặc biệt "Đôi Bạn Hảo Tâm"!
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Để sau
            </Button>
            <Button onClick={confirmInvite} className="gap-1">
              <Heart className="w-4 h-4" />
              Gửi lời mời
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
