import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LeftSidebar } from "@/components/social/LeftSidebar";
import { RightSidebar } from "@/components/social/RightSidebar";
import { StoriesSection } from "@/components/social/StoriesSection";
import { FriendRequestsSection } from "@/components/social/FriendRequestsSection";
import { CreatePostBox } from "@/components/social/CreatePostBox";
import { SocialPostCard } from "@/components/social/SocialPostCard";
import { FeedFilters } from "@/components/social/FeedFilters";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { useFeedPosts, FeedFilters as FeedFiltersType } from "@/hooks/useFeedPosts";
import { Loader2, SearchX } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  wallet_address: string | null;
}

export default function SocialFeed() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [filters, setFilters] = useState<FeedFiltersType>({});
  const navigate = useNavigate();
  
  const { data: posts, isLoading: postsLoading } = useFeedPosts(filters);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const hasActiveFilters = filters.postType || filters.category || filters.location || filters.search;

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Bảng Tin - FUN Charity</title>
        <meta name="description" content="Xem bảng tin xã hội, kết nối với cộng đồng từ thiện minh bạch trên FUN Charity" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            <div className="flex gap-6">
              {/* Left Sidebar - Hidden on mobile */}
              <div className="hidden lg:block">
                <LeftSidebar profile={profile} />
              </div>

              {/* Main Feed */}
              <div className="flex-1 max-w-2xl mx-auto lg:mx-0 space-y-6">
                <StoriesSection />
                <CreatePostBox profile={profile} />
                
                {/* Search & Filters */}
                <FeedFilters filters={filters} onFiltersChange={setFilters} />
                
                <FriendRequestsSection />
                
                {/* Posts Feed */}
                <div className="space-y-6">
                  {postsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-secondary mb-4" />
                      <p className="text-muted-foreground">Đang tải bài viết...</p>
                    </div>
                  ) : posts && posts.length > 0 ? (
                    posts.map((post) => (
                      <SocialPostCard key={post.id} post={post} />
                    ))
                  ) : (
                    <div className="glass-card p-12 text-center">
                      {hasActiveFilters ? (
                        <>
                          <SearchX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground mb-2">
                            Không tìm thấy bài viết phù hợp với bộ lọc
                          </p>
                          <button 
                            onClick={() => setFilters({})}
                            className="text-secondary hover:underline text-sm"
                          >
                            Xóa bộ lọc
                          </button>
                        </>
                      ) : (
                        <p className="text-muted-foreground">
                          Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar - Hidden on mobile/tablet */}
              <div className="hidden xl:block">
                <RightSidebar />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
