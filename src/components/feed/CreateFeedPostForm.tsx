import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Image,
  MapPin,
  AlertTriangle,
  Tag,
  Users,
  DollarSign,
  Send,
  X,
  HandHeart,
  Gift,
  Zap,
  Heart,
} from "lucide-react";
import { useCreateFeedPost, FeedPostType, UrgencyLevel } from "@/hooks/useFeedPosts";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  post_type: z.enum(["need", "supply", "update", "story"]),
  title: z.string().optional(),
  content: z.string().min(1, "Vui lòng nhập nội dung"),
  location: z.string().optional(),
  region: z.string().optional(),
  category: z.string().optional(),
  urgency: z.enum(["low", "medium", "high", "critical"]).optional(),
  target_amount: z.number().optional(),
  beneficiaries_count: z.number().optional(),
  estimated_delivery: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const postTypes = [
  { value: "update", label: "Cập Nhật", icon: Zap, color: "text-primary" },
  { value: "need", label: "Cần Hỗ Trợ", icon: HandHeart, color: "text-destructive" },
  { value: "supply", label: "Sẵn Sàng Hỗ Trợ", icon: Gift, color: "text-success" },
  { value: "story", label: "Câu Chuyện", icon: Heart, color: "text-secondary" },
];

const categories = [
  { value: "education", label: "Giáo Dục" },
  { value: "healthcare", label: "Y Tế" },
  { value: "disaster_relief", label: "Cứu Trợ Thiên Tai" },
  { value: "poverty", label: "Xóa Đói Giảm Nghèo" },
  { value: "environment", label: "Môi Trường" },
  { value: "animal_welfare", label: "Bảo Vệ Động Vật" },
  { value: "community", label: "Cộng Đồng" },
  { value: "other", label: "Khác" },
];

const urgencyLevels = [
  { value: "low", label: "Thấp", color: "text-muted-foreground" },
  { value: "medium", label: "Trung Bình", color: "text-secondary" },
  { value: "high", label: "Cao", color: "text-warning" },
  { value: "critical", label: "Cấp Bách", color: "text-destructive" },
];

const vietnamRegions = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Miền Bắc",
  "Miền Trung",
  "Miền Nam",
  "Tây Nguyên",
  "Đồng Bằng Sông Cửu Long",
];

export function CreateFeedPostForm() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedType, setSelectedType] = useState<FeedPostType>("update");
  const createPost = useCreateFeedPost();

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", data.user.id)
        .single();

      return { ...data.user, profile };
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      post_type: "update",
      content: "",
    },
  });

  const showAdvancedFields = selectedType === "need" || selectedType === "supply";

  const handleSubmit = async (data: FormData) => {
    await createPost.mutateAsync({
      ...data,
      post_type: selectedType,
    });
    form.reset();
    setIsExpanded(false);
  };

  if (!user) {
    return (
      <div className="glass-card p-5 luxury-border text-center">
        <p className="text-muted-foreground">
          Vui lòng đăng nhập để đăng bài viết
        </p>
        <Button variant="hero" className="mt-3" asChild>
          <a href="/auth">Đăng Nhập</a>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="glass-card p-5 luxury-border"
    >
      <div className="flex items-start gap-3">
        <Avatar className="w-12 h-12 border-2 border-secondary/20">
          <AvatarImage src={user.profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10">
            {user.profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          {!isExpanded ? (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full text-left p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-muted-foreground"
            >
              Bạn muốn chia sẻ điều gì?
            </button>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {/* Post Type Selection */}
                <div className="flex flex-wrap gap-2">
                  {postTypes.map(({ value, label, icon: Icon, color }) => (
                    <Badge
                      key={value}
                      variant={selectedType === value ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        selectedType === value
                          ? "bg-primary text-primary-foreground"
                          : `hover:bg-muted ${color}`
                      }`}
                      onClick={() => {
                        setSelectedType(value as FeedPostType);
                        form.setValue("post_type", value as FeedPostType);
                      }}
                    >
                      <Icon className="w-3.5 h-3.5 mr-1" />
                      {label}
                    </Badge>
                  ))}
                </div>

                {/* Title (for need/supply) */}
                {showAdvancedFields && (
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Tiêu đề bài viết..."
                            className="font-semibold"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Content */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder={
                            selectedType === "need"
                              ? "Mô tả nhu cầu hỗ trợ của bạn..."
                              : selectedType === "supply"
                              ? "Mô tả nguồn lực bạn muốn đóng góp..."
                              : "Chia sẻ điều gì đó..."
                          }
                          className="min-h-[100px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Advanced Fields for need/supply */}
                <AnimatePresence>
                  {showAdvancedFields && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        {/* Category */}
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1 text-xs">
                                <Tag className="w-3 h-3" />
                                Danh Mục
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn danh mục" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                      {cat.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Urgency */}
                        <FormField
                          control={form.control}
                          name="urgency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1 text-xs">
                                <AlertTriangle className="w-3 h-3" />
                                Mức Độ Khẩn Cấp
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn mức độ" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {urgencyLevels.map((level) => (
                                    <SelectItem key={level.value} value={level.value}>
                                      <span className={level.color}>{level.label}</span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Location */}
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1 text-xs">
                                <MapPin className="w-3 h-3" />
                                Địa Điểm
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="VD: Quận 1, TP.HCM" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Region */}
                        <FormField
                          control={form.control}
                          name="region"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1 text-xs">
                                <MapPin className="w-3 h-3" />
                                Khu Vực
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn khu vực" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {vietnamRegions.map((region) => (
                                    <SelectItem key={region} value={region}>
                                      {region}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {selectedType === "need" && (
                        <div className="grid grid-cols-2 gap-4">
                          {/* Target Amount */}
                          <FormField
                            control={form.control}
                            name="target_amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1 text-xs">
                                  <DollarSign className="w-3 h-3" />
                                  Số Tiền Cần (VNĐ)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(parseInt(e.target.value) || 0)
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Beneficiaries */}
                          <FormField
                            control={form.control}
                            name="beneficiaries_count"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1 text-xs">
                                  <Users className="w-3 h-3" />
                                  Số Người Thụ Hưởng
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(parseInt(e.target.value) || 0)
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" size="icon">
                      <Image className="w-5 h-5 text-secondary" />
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setIsExpanded(false);
                        form.reset();
                      }}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      variant="hero"
                      disabled={createPost.isPending}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      {createPost.isPending ? "Đang đăng..." : "Đăng Bài"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </motion.div>
  );
}
