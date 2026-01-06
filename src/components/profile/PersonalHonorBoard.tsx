import { motion } from "framer-motion";
import { Users, Trophy, Heart, UserPlus, FileText, Video, Award, Coins, Gift } from "lucide-react";
import { usePersonalStats } from "@/hooks/usePersonalStats";
import { useCountAnimation } from "@/hooks/useCountAnimation";

interface PersonalHonorBoardProps {
  userId: string | null;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(".", ",") + "M";
  }
  if (num >= 1000) {
    return num.toLocaleString("vi-VN");
  }
  return num.toString();
};

interface StatCellProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  delay: number;
}

const StatCell = ({ icon, label, value, delay }: StatCellProps) => {
  const numericValue = typeof value === "number" ? value : 0;
  const animatedValue = useCountAnimation(numericValue, 2000);
  const displayValue = typeof value === "string" ? value : formatNumber(animatedValue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      className="metal-gold-border flex items-center gap-2 px-3 py-2 min-w-[120px]"
    >
      <div className="text-purple-600 flex-shrink-0">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[9px] uppercase tracking-wide text-purple-500 font-medium">
          {label}
        </span>
        <span className="text-xs font-bold text-purple-800">{displayValue}</span>
      </div>
    </motion.div>
  );
};

export function PersonalHonorBoard({ userId }: PersonalHonorBoardProps) {
  const { data: stats, isLoading } = usePersonalStats(userId);

  if (isLoading) {
    return (
      <div className="absolute bottom-4 left-4 right-4 z-10 hidden md:flex items-center justify-center gap-3">
        <div className="metal-gold-border-button w-20 h-16 bg-amber-100/50 animate-pulse" />
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="metal-gold-border w-28 h-10 bg-amber-100/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statsData = [
    { icon: <Trophy size={14} />, label: "Hồ Sơ Nổi Bật", value: stats.featuredScore || 0 },
    { icon: <Coins size={14} />, label: "Thu Nhập", value: stats.income || 0 },
    { icon: <FileText size={14} />, label: "Bài Viết", value: stats.postsCount || 0 },
    { icon: <Video size={14} />, label: "Video", value: stats.videosCount || 0 },
    { icon: <UserPlus size={14} />, label: "Bạn Bè", value: stats.friendsCount || 0 },
    { icon: <Award size={14} />, label: "Số NFT", value: stats.nftCount || 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute bottom-4 left-4 right-4 z-10 hidden md:flex items-center justify-center gap-3"
    >
      {/* User Stats Button - Left Side */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.05 }}
        className="metal-gold-border-button flex flex-col items-center justify-center px-4 py-3 cursor-pointer"
      >
        <Users className="text-purple-700 mb-0.5" size={20} />
        <span className="text-lg font-bold text-purple-800">
          {formatNumber(stats.featuredScore || 0)}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-purple-600 font-medium">
          Điểm
        </span>
      </motion.div>

      {/* Stats Grid - Right Side */}
      <div className="grid grid-cols-3 gap-2">
        {statsData.map((stat, index) => (
          <StatCell
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            delay={0.3 + index * 0.05}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default PersonalHonorBoard;
