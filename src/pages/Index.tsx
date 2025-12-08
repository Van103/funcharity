import { MainLayout } from "@/components/layout/MainLayout";
import { HonorBoard } from "@/components/home/HonorBoard";
import { CreatePostBox } from "@/components/home/CreatePostBox";
import { SocialFeedCard } from "@/components/home/SocialFeedCard";

// Mock posts data
const mockPosts = [
  {
    id: "1",
    author: { name: "Camly Duong", isVerified: true },
    content: "🌟 Chào mừng đến với FUN Charity! Nơi lòng tốt trở nên minh bạch và được ghi nhận mãi mãi trên blockchain.\n\nHãy cùng nhau lan tỏa yêu thương! 💜✨",
    images: ["https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800"],
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    likes: 128,
    comments: 24,
    shares: 15,
    funReward: 50,
  },
  {
    id: "2", 
    author: { name: "Nguyễn Văn An", isVerified: false },
    content: "Vừa quyên góp 500.000đ cho chiến dịch 'Áo ấm mùa đông'. Cảm ơn FUN Charity đã giúp mình kết nối với những hoàn cảnh khó khăn! 🙏",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    likes: 89,
    comments: 12,
    shares: 8,
    funReward: 25,
  },
  {
    id: "3",
    author: { name: "Trần Thị Mai", isVerified: true },
    content: "📢 Cập nhật chiến dịch: Đã phân phát 200 phần quà đến các em nhỏ vùng cao. Xem chi tiết giao dịch on-chain tại đây!",
    images: [
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800",
      "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800",
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    likes: 256,
    comments: 45,
    shares: 32,
  },
];

const Index = () => {
  return (
    <MainLayout>
      <HonorBoard />
      <CreatePostBox />
      
      <div className="space-y-4">
        {mockPosts.map((post) => (
          <SocialFeedCard key={post.id} post={post} />
        ))}
      </div>
    </MainLayout>
  );
};

export default Index;