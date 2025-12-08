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
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  wallet_address: string | null;
}

// Mock posts data
const mockPosts = [
  {
    id: "1",
    user: {
      name: "Camly Duong",
      verified: true,
      location: "Love House Đà Lạt",
    },
    content: `THƯỢNG ĐẾ CÓ MỘT THOẢ THUẬN,
VỚI BẠN.

Bạn đang nhận từ Ngài rất rất nhiều.
Ngài sẽ còn cho bạn thêm nhiều nhiều nữa.
Với 1 thỏa thuận:
Bạn phải luôn chia sẻ, cho đi nhiều người khác.
Luôn cho đi, không ngưng nghỉ. Với tâm hoan hỉ, vui vẻ, yêu thương và biết ơn.
Nếu bạn ngưng cho đi, thì bạn sẽ ngưng nhận thêm. Và những gì bạn có sẽ từ từ bốc hơi, qua nhiều cách khác nhau, bị mất, bị lửa, bị hack, bị hao hụt, bị suy thoái, bị phá sản...
Bạn phải tiếp tục cho đi, cho đi, với tâm yêu thương và biết ơn. Càng cho đi, bạn sẽ càng nhận lại nhiều hơn.
Chúc bạn luôn giàu có, đủ đầy và thịnh vượng!`,
    media: [
      {
        url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&auto=format&fit=crop",
        type: "image" as const,
      },
    ],
    earnAmount: "99,999 ₫",
    createdAt: "1 ngày",
    reactions: {
      total: 1800000000,
      types: ["😍", "🥰", "😢", "❤️", "👍"],
    },
    comments: 3700000000,
    shares: 1000000000,
  },
  {
    id: "2",
    user: {
      name: "Lê Minh Trí",
      verified: true,
    },
    content: `Hôm nay là một ngày tuyệt vời để chia sẻ yêu thương! 💜

Cảm ơn FUN Charity đã tạo ra một nền tảng minh bạch để kết nối những tấm lòng nhân ái. 

#FUNCharity #BlockchainForGood #TransparentGiving`,
    earnAmount: "50,000 ₫",
    createdAt: "2 giờ",
    reactions: {
      total: 2500,
      types: ["❤️", "👍", "😍"],
    },
    comments: 128,
    shares: 45,
  },
];

export default function SocialFeed() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      setLoading(false);
    }
  };

  if (loading) {
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
                <FriendRequestsSection />
                
                {/* Posts Feed */}
                <div className="space-y-6">
                  {mockPosts.map((post) => (
                    <SocialPostCard key={post.id} post={post} />
                  ))}
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
