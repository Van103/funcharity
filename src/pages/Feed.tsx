import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Zap,
  TrendingUp,
  HandHeart,
  Gift,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { CreateFeedPostForm } from "@/components/feed/CreateFeedPostForm";
import { FeedPostCard } from "@/components/feed/FeedPostCard";
import { MatchingSidebar } from "@/components/feed/MatchingSidebar";
import { useFeedPosts, FeedPostType } from "@/hooks/useFeedPosts";

const Feed = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedNeedId, setSelectedNeedId] = useState<string | null>(null);

  const postType: FeedPostType | undefined =
    activeTab === "all" ? undefined : (activeTab as FeedPostType);

  const { data: posts, isLoading, error } = useFeedPosts({ postType });

  const handleShowMatches = (postId: string) => {
    setSelectedNeedId(postId);
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge variant="trending" className="mb-4">
              <Zap className="w-3.5 h-3.5 mr-1" />
              Social Charity Feed
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Bảng Tin <span className="gradient-text">Từ Thiện</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Chia sẻ nhu cầu, đóng góp nguồn lực, và kết nối với cộng đồng từ thiện.
              Smart matching engine giúp kết nối nhu cầu với nguồn lực phù hợp nhất.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Create Post Form */}
            <div className="mb-6">
              <CreateFeedPostForm />
            </div>

            {/* Filter Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="w-full grid grid-cols-4 h-auto p-1">
                <TabsTrigger value="all" className="gap-1 py-2.5">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Tất Cả</span>
                </TabsTrigger>
                <TabsTrigger value="need" className="gap-1 py-2.5">
                  <HandHeart className="w-4 h-4" />
                  <span className="hidden sm:inline">Cần Hỗ Trợ</span>
                </TabsTrigger>
                <TabsTrigger value="supply" className="gap-1 py-2.5">
                  <Gift className="w-4 h-4" />
                  <span className="hidden sm:inline">Sẵn Sàng</span>
                </TabsTrigger>
                <TabsTrigger value="story" className="gap-1 py-2.5">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Câu Chuyện</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Posts List */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Đang tải bài viết...</p>
                </div>
              ) : error ? (
                <div className="glass-card p-8 text-center">
                  <p className="text-destructive mb-2">Có lỗi xảy ra</p>
                  <p className="text-sm text-muted-foreground">
                    {error instanceof Error ? error.message : "Không thể tải bài viết"}
                  </p>
                </div>
              ) : posts && posts.length > 0 ? (
                posts.map((post) => (
                  <FeedPostCard
                    key={post.id}
                    post={post}
                    onShowMatches={handleShowMatches}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-12 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <MessageSquare className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-xl mb-2">
                    Chưa có bài viết nào
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === "need"
                      ? "Chưa có ai đăng nhu cầu hỗ trợ. Hãy là người đầu tiên!"
                      : activeTab === "supply"
                      ? "Chưa có ai chia sẻ nguồn lực. Hãy đóng góp ngay!"
                      : "Hãy bắt đầu chia sẻ câu chuyện từ thiện của bạn!"}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Matching Sidebar */}
      <MatchingSidebar
        selectedNeedId={selectedNeedId}
        onClose={() => setSelectedNeedId(null)}
      />

      <Footer />
    </main>
  );
};

export default Feed;
