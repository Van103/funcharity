import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { MantrasFooter } from "./MantrasFooter";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebars?: boolean;
}

export function MainLayout({ children, showSidebars = true }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setLeftSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Header onMenuToggle={() => setLeftSidebarOpen(!leftSidebarOpen)} />

      {/* Main Content Area */}
      <div className="flex flex-1 pt-14 md:pt-16">
        {/* Left Sidebar - Desktop */}
        {showSidebars && !isMobile && (
          <LeftSidebar className="hidden lg:flex" />
        )}

        {/* Left Sidebar - Mobile Overlay */}
        {showSidebars && isMobile && leftSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setLeftSidebarOpen(false)}
            />
            <LeftSidebar 
              className="fixed left-0 top-14 bottom-0 z-50 w-64" 
              onClose={() => setLeftSidebarOpen(false)}
            />
          </>
        )}

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto ${isMobile ? 'pb-20' : ''}`}>
          <div className={`max-w-4xl mx-auto px-4 py-4 ${showSidebars && !isMobile ? 'lg:px-6' : ''}`}>
            {children}
          </div>
        </main>

        {/* Right Sidebar - Desktop only */}
        {showSidebars && !isMobile && (
          <RightSidebar className="hidden xl:flex" />
        )}
      </div>

      {/* Mantras Footer */}
      <MantrasFooter />

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav />}
    </div>
  );
}