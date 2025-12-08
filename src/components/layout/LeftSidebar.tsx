import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  User,
  GraduationCap,
  TrendingUp,
  PiggyBank,
  Heart,
  Scale,
  Globe,
  X,
  Crown,
} from "lucide-react";

const sidebarItems = [
  { name: "Fun Profile", path: "/profile", icon: User, description: "Hồ sơ cá nhân" },
  { name: "Fun Academy", path: "/academy", icon: GraduationCap, description: "Học miễn phí" },
  { name: "Fun Trading", path: "/trading", icon: TrendingUp, description: "Đổi token" },
  { name: "Fun Investment", path: "/investment", icon: PiggyBank, description: "Staking & Rewards" },
  { name: "Fun Life", path: "/life", icon: Heart, description: "Sự kiện cộng đồng" },
  { name: "Fun Legal", path: "/legal", icon: Scale, description: "Điều khoản & DAO" },
  { name: "Fun Planet", path: "/planet", icon: Globe, description: "Dự án xanh" },
];

interface LeftSidebarProps {
  className?: string;
  onClose?: () => void;
}

export function LeftSidebar({ className, onClose }: LeftSidebarProps) {
  const location = useLocation();

  return (
    <aside className={cn(
      "w-60 bg-sidebar flex flex-col border-r border-sidebar-border",
      className
    )}>
      {/* Close button for mobile */}
      {onClose && (
        <div className="flex justify-end p-2 lg:hidden">
          <Button variant="ghost" size="icon" onClick={onClose} className="text-sidebar-foreground">
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Logo area */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Crown className="w-8 h-8 text-sidebar-primary crown-glow" />
          <div>
            <h2 className="text-lg font-bold text-sidebar-primary">FUN Charity</h2>
            <p className="text-xs text-sidebar-foreground/60">Mạng xã hội từ thiện</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link key={item.path} to={item.path} onClick={onClose}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-auto py-3 px-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive && "bg-sidebar-accent text-sidebar-primary"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "bg-sidebar-accent/50"
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs opacity-60">{item.description}</p>
                </div>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Stats */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-sidebar-accent/30 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-sidebar-primary">1B+</p>
          <p className="text-xs text-sidebar-foreground/70">Người dùng toàn cầu</p>
        </div>
      </div>
    </aside>
  );
}