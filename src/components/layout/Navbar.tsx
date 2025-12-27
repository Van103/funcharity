import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MotionToggle } from "@/components/background/MotionToggle";
import { WalletConnectModal } from "@/components/wallet/WalletConnectModal";
import { NotificationDropdown } from "./NotificationDropdown";
import { MessageDropdown } from "./MessageDropdown";
import { SearchBar } from "./SearchBar";
import { LanguageToggle } from "./LanguageToggle";
import CursorSettings from "@/components/cursor/CursorSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFriendRequestNotifications } from "@/hooks/useFriendNotifications";
import { usePostNotifications } from "@/hooks/usePostNotifications";
import { useDonationNotifications } from "@/hooks/useDonationNotifications";
import {
  Menu,
  X,
  Wallet,
  LayoutDashboard,
  MapPin,
  Users,
  Star,
  Newspaper,
  LogOut,
  User as UserIcon,
  Settings,
  Check,
  Home,
  ChevronDown,
  Layers,
  Globe,
  MousePointer2,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const platformItems = [
  { nameKey: "nav.campaigns", path: "/campaigns", icon: Newspaper },
  { nameKey: "nav.myCampaigns", path: "/my-campaigns", icon: Layers },
  { nameKey: "nav.needsMap", path: "/needs-map", icon: MapPin },
  { nameKey: "nav.overview", path: "/dashboard", icon: LayoutDashboard },
  { nameKey: "nav.reviews", path: "/reviews", icon: Star },
];

const navItems = [
  { nameKey: "nav.communityProfiles", path: "/profiles", icon: Users },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Enable realtime notifications
  useFriendRequestNotifications(user?.id || null);
  usePostNotifications(user?.id || null);
  useDonationNotifications(user?.id || null);

  // Fetch unread message count
  useEffect(() => {
    if (!user?.id) {
      setUnreadMessageCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      // Get all conversations for this user
      const { data: convos } = await supabase
        .from("conversations")
        .select("id")
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`);

      if (!convos || convos.length === 0) {
        setUnreadMessageCount(0);
        return;
      }

      const convoIds = convos.map(c => c.id);
      
      // Count unread messages
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("conversation_id", convoIds)
        .eq("is_read", false)
        .neq("sender_id", user.id);

      setUnreadMessageCount(count || 0);
    };

    fetchUnreadCount();

    // Subscribe to new messages
    const channel = supabase
      .channel("navbar-messages")
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

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
    
    if (data?.avatar_url) {
      setAvatarUrl(data.avatar_url);
    }
    if (data?.wallet_address) {
      setConnectedWallet(data.wallet_address);
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/social" className="flex items-center gap-1 sm:gap-2 group">
              <Logo size="md" />
            </Link>
            
            {/* Home Button - Facebook style icon with tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/social">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full ${
                      location.pathname === "/social" 
                        ? "bg-primary text-white hover:bg-primary/90" 
                        : "text-primary hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    <Home className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent className="bg-foreground text-background font-semibold">
                {t("nav.home")}
              </TooltipContent>
            </Tooltip>
            
            {/* Search - shorter width, hidden on mobile */}
            <div className="hidden md:block w-48 lg:w-56">
              <SearchBar />
            </div>
          </div>

          {/* Center Navigation - Facebook style icon buttons */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Platform Dropdown - Icon only with tooltip */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-11 h-11 rounded-full text-primary hover:bg-primary/10"
                    >
                      <Layers className="w-7 h-7" strokeWidth={2.5} />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent className="bg-foreground text-background font-semibold">
                  {t("nav.platform")}
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="center" className="w-56 bg-background border border-border shadow-lg">
                {platformItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.path} asChild className="cursor-pointer">
                      <Link to={item.path} className="flex items-center gap-3 py-2.5">
                        <Icon className="w-5 h-5 text-primary" />
                        <span className="font-medium">{t(item.nameKey)}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Community - Icon only with tooltip */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <Link to={item.path}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`w-11 h-11 rounded-full ${
                          isActive 
                            ? "bg-primary text-white hover:bg-primary/90" 
                            : "text-primary hover:bg-primary/10"
                        }`}
                      >
                        <Icon className="w-7 h-7" strokeWidth={2.5} />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent className="bg-foreground text-background font-semibold">
                    {t(item.nameKey)}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Right Actions - Facebook style */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Sparkles/Activity - Icon only with tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hidden md:flex w-10 h-10 rounded-full text-primary hover:bg-primary/10"
                >
                  <Sparkles className="w-6 h-6" strokeWidth={2.5} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-foreground text-background font-semibold">
                {t("nav.activity") || "Hoạt động"}
              </TooltipContent>
            </Tooltip>
            
            {/* Messages Dropdown */}
            {user && (
              <MessageDropdown userId={user.id} unreadCount={unreadMessageCount} />
            )}

            {/* Notifications */}
            <NotificationDropdown />
            
            <WalletConnectModal 
              open={walletModalOpen} 
              onOpenChange={setWalletModalOpen}
              onWalletConnected={(address) => setConnectedWallet(address)}
            />

            {/* User Avatar Dropdown - Facebook style: avatar only, show name on hover */}
            <div className="hidden sm:flex items-center pl-2 sm:pl-3 border-l border-border/50">
              {user ? (
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer focus:outline-none">
                          <Avatar className="w-10 h-10 sm:w-11 sm:h-11 border-3 border-primary/30 ring-2 ring-primary/20">
                            <AvatarImage src={avatarUrl || undefined} alt="Avatar" />
                            <AvatarFallback className="bg-primary/20 text-primary font-bold">
                              <UserIcon className="w-5 h-5" />
                            </AvatarFallback>
                          </Avatar>
                          <ChevronDown className="w-4 h-4 text-primary" strokeWidth={2.5} />
                        </button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent className="bg-foreground text-background font-semibold">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end" className="w-72 bg-background border border-border shadow-lg p-2">
                    {/* User Profile Header */}
                    <DropdownMenuItem asChild className="cursor-pointer p-3 rounded-lg hover:bg-primary/10">
                      <Link to="/profile" className="flex items-center gap-3">
                        <Avatar className="w-12 h-12 border-2 border-primary/30">
                          <AvatarImage src={avatarUrl || undefined} alt="Avatar" />
                          <AvatarFallback className="bg-primary/20 text-primary font-bold">
                            <UserIcon className="w-6 h-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-foreground">
                            {user.user_metadata?.full_name || user.email?.split('@')[0]}
                          </p>
                          <p className="text-sm text-muted-foreground">{t("user.viewProfile")}</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="my-2" />
                    
                    {/* Wallet Connection */}
                    <DropdownMenuItem 
                      onClick={() => setWalletModalOpen(true)}
                      className="cursor-pointer p-3 rounded-lg hover:bg-primary/10"
                    >
                      <Wallet className="w-5 h-5 mr-3 text-primary" />
                      {connectedWallet ? (
                        <span className="font-medium">{t("common.walletPrefix")} {shortenAddress(connectedWallet)}</span>
                      ) : (
                        <span className="font-medium">{t("common.connectWallet")}</span>
                      )}
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="my-2" />
                    
                    {/* Language Toggle */}
                    <div className="p-3 rounded-lg hover:bg-primary/10 flex items-center gap-3 cursor-pointer">
                      <Globe className="w-5 h-5 text-primary" />
                      <span className="font-medium flex-1">{t("settings.language") || "Ngôn ngữ"}</span>
                      <LanguageToggle />
                    </div>
                    
                    {/* Cursor Settings */}
                    <div className="p-3 rounded-lg hover:bg-primary/10 flex items-center gap-3 cursor-pointer">
                      <MousePointer2 className="w-5 h-5 text-primary" />
                      <span className="font-medium flex-1">{t("settings.cursor") || "Con trỏ"}</span>
                      <CursorSettings />
                    </div>
                    
                    {/* Settings with Motion Toggle */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="p-3 rounded-lg hover:bg-primary/10 flex items-center gap-3 cursor-pointer">
                          <Settings className="w-5 h-5 text-primary" />
                          <span className="font-medium flex-1">{t("common.settings")}</span>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-72 bg-background border border-border shadow-lg">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">{t("common.settings")}</h4>
                          <MotionToggle />
                        </div>
                      </PopoverContent>
                    </Popover>
                    
                    <DropdownMenuSeparator className="my-2" />
                    
                    {/* Logout */}
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer p-3 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive focus:text-destructive"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      <span className="font-medium">{t("user.logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm border-primary text-primary hover:bg-primary hover:text-white font-semibold">
                      {t("common.login")}
                    </Button>
                  </Link>
                  <Link to="/campaigns" className="hidden sm:block ml-2">
                    <Button variant="default" size="sm" className="text-xs sm:text-sm bg-primary hover:bg-primary/90 text-white font-semibold">
                      {t("common.donate")}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu - slide down */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden bg-background border-b border-border"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              {/* Search on mobile */}
              <div className="mb-4">
                <SearchBar />
              </div>

              <Link to="/social" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base text-primary font-semibold">
                  <Home className="w-6 h-6" strokeWidth={2.5} />
                  {t("nav.home")}
                </Button>
              </Link>
              
              {/* Platform items */}
              <div className="py-2">
                <p className="px-3 text-xs font-semibold text-muted-foreground mb-2">{t("nav.platform")}</p>
                {platformItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                    >
                      <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base text-primary font-medium">
                        <Icon className="w-6 h-6" strokeWidth={2} />
                        {t(item.nameKey)}
                      </Button>
                    </Link>
                  );
                })}
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                  >
                    <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base text-primary font-medium">
                      <Icon className="w-6 h-6" strokeWidth={2} />
                      {t(item.nameKey)}
                    </Button>
                  </Link>
                );
              })}

              <div className="pt-4 space-y-3 border-t border-border">
                {/* Language and Cursor on mobile */}
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    <span className="font-medium">{t("settings.language") || "Ngôn ngữ"}</span>
                  </div>
                  <LanguageToggle />
                </div>
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2">
                    <MousePointer2 className="w-5 h-5 text-primary" />
                    <span className="font-medium">{t("settings.cursor") || "Con trỏ"}</span>
                  </div>
                  <CursorSettings />
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full h-12 text-base border-primary text-primary font-semibold"
                  onClick={() => {
                    setWalletModalOpen(true);
                    setIsOpen(false);
                  }}
                >
                  {connectedWallet ? (
                    <>
                      <Check className="w-5 h-5 text-green-500 mr-2" />
                      {shortenAddress(connectedWallet)}
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5 mr-2" />
                      {t("common.connectWallet")}
                    </>
                  )}
                </Button>
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-primary/10 rounded-xl transition-colors">
                      <Avatar className="w-12 h-12 border-2 border-primary/30">
                        <AvatarImage src={avatarUrl || undefined} alt="Avatar" />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          <UserIcon className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-base font-bold text-primary">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </span>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full h-12 text-base border-destructive text-destructive font-semibold" 
                      onClick={() => { handleLogout(); setIsOpen(false); }}
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      {t("user.logout")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full h-12 text-base border-primary text-primary font-semibold">
                        {t("common.login")}
                      </Button>
                    </Link>
                    <Link to="/campaigns" onClick={() => setIsOpen(false)}>
                      <Button className="w-full h-12 text-base bg-primary hover:bg-primary/90 text-white font-semibold">
                        {t("common.donate")}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
