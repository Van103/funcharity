import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Users,
  FileText,
  Play,
  UserPlus,
  Hexagon,
} from "lucide-react";

const tabs = [
  { id: "top", label: "Top Profile", icon: Trophy },
  { id: "groups", label: "Nhóm", icon: Users },
  { id: "posts", label: "Bài Viết", icon: FileText },
  { id: "videos", label: "Video", icon: Play },
  { id: "friends", label: "Bạn Bè", icon: UserPlus },
  { id: "nft", label: "Số NFT", icon: Hexagon },
];

interface HonorBoardProps {
  onTabChange?: (tab: string) => void;
}

export function HonorBoard({ onTabChange }: HonorBoardProps) {
  const [activeTab, setActiveTab] = useState("posts");

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className="glass-card p-4 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-secondary" />
        <h2 className="font-semibold">Honor Board</h2>
      </div>

      {/* Tabs - Scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "shrink-0 gap-1.5 rounded-full transition-all",
                isActive 
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" 
                  : "bg-muted/50 hover:bg-muted"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}