import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { WalletConnectModal } from "@/components/wallet/WalletConnectModal";
import {
  Menu,
  Bell,
  MessageCircle,
  Wallet,
  Home,
  PlayCircle,
  Radio,
  Building2,
  Users,
  User as UserIcon,
  LogOut,
  Check,
  Crown,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const headerTabs = [
  { name: "Trang Chủ", path: "/", icon: Home },
  { name: "Stories", path: "/stories", icon: PlayCircle },
  { name: "Live", path: "/live", icon: Radio },
  { name: "Tổ Chức", path: "/profiles", icon: Building2 },
  { name: "Tình Nguyện", path: "/volunteer", icon: Users },
];

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setAvatarUrl(null);
        setConnectedWallet(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("avatar_url, wallet_address")
      .eq("user_id", userId)
      .single();
    
    if (data?.avatar_url) setAvatarUrl(data.avatar_url);
    if (data?.wallet_address) setConnectedWallet(data.wallet_address);
  };

  const shortenAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary h-14 md:h-16 shadow-lg">
      <div className="h-full flex items-center justify-between px-3 md:px-4 max-w-[1800px] mx-auto">
        {/* Left: Logo & Menu */}
        <div className="flex items-center gap-2 md:gap-4">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onMenuToggle} className="text-primary-foreground">
              <Menu className="w-5 h-5" />
            </Button>
          )}
          
          <Link to="/" className="flex items-center gap-1.5 group">
            <div className="relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
              <Crown className="w-6 h-6 md:w-8 md:h-8 text-secondary crown-glow" />
            </div>
            <span className="text-lg md:text-xl font-bold logo-fun-text hidden sm:block">
              FUN
            </span>
          </Link>

          {/* Desktop Tabs */}
          {!isMobile && (
            <nav className="hidden md:flex items-center gap-1 ml-4">
              {headerTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = location.pathname === tab.path;
                return (
                  <Link key={tab.path} to={tab.path}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-light/50 ${
                        isActive ? 'bg-primary-light text-primary-foreground' : ''
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-1.5" />
                      {tab.name}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative text-primary-foreground">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-primary" />
          </Button>

          {/* Messages */}
          <Button variant="ghost" size="icon" className="text-primary-foreground hidden sm:flex">
            <MessageCircle className="w-5 h-5" />
          </Button>

          {/* Wallet */}
          {connectedWallet ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-1.5 hidden sm:flex">
                  <Check className="w-3.5 h-3.5" />
                  <span className="font-mono text-xs">{shortenAddress(connectedWallet)}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="p-3 w-auto">
                <div className="text-sm">
                  <p className="text-muted-foreground mb-2">Ví đã kết nối</p>
                  <p className="font-mono text-xs break-all">{connectedWallet}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => setWalletModalOpen(true)}
                  >
                    Đổi Ví
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Button 
              variant="secondary" 
              size="sm" 
              className="gap-1.5 hidden sm:flex"
              onClick={() => setWalletModalOpen(true)}
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden md:inline">Kết Nối</span>
            </Button>
          )}

          <WalletConnectModal 
            open={walletModalOpen} 
            onOpenChange={setWalletModalOpen}
            onWalletConnected={(address) => setConnectedWallet(address)}
          />

          {/* Profile */}
          {user ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Avatar className="w-8 h-8 border-2 border-secondary/50">
                    <AvatarImage src={avatarUrl || undefined} alt="Avatar" />
                    <AvatarFallback className="bg-primary-light text-primary-foreground">
                      <UserIcon className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-48 p-2">
                <div className="space-y-1">
                  <Link to="/profile">
                    <Button variant="ghost" className="w-full justify-start gap-2" size="sm">
                      <UserIcon className="w-4 h-4" />
                      Hồ Sơ
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-2 text-destructive" 
                    size="sm"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng Xuất
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Link to="/auth">
              <Button variant="secondary" size="sm">
                Đăng Nhập
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}