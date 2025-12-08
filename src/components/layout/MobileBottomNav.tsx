import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Search,
  PlusCircle,
  Bell,
  User,
} from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Trang Chủ" },
  { path: "/campaigns", icon: Search, label: "Khám Phá" },
  { path: "/feed", icon: PlusCircle, label: "Đăng", isAction: true },
  { path: "/notifications", icon: Bell, label: "Thông Báo" },
  { path: "/profile", icon: User, label: "Hồ Sơ" },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="mobile-nav">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          if (item.isAction) {
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className="flex items-center justify-center"
              >
                <div className="w-12 h-12 -mt-4 rounded-full bg-secondary flex items-center justify-center shadow-lg shadow-secondary/30">
                  <Icon className="w-6 h-6 text-secondary-foreground" />
                </div>
              </Link>
            );
          }
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "mobile-nav-item touch-target",
                isActive && "active"
              )}
            >
              <Icon className={cn("w-6 h-6 mb-0.5", isActive ? "text-secondary" : "text-muted-foreground")} />
              <span className={cn(isActive ? "text-secondary" : "text-muted-foreground")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}