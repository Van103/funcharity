import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Bot, Calendar, FileText, Image, Shield, User } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface ModerationLog {
  id: string;
  user_id: string;
  content_type: string;
  content: string | null;
  media_urls: string[] | null;
  reason: string;
  categories: string[] | null;
  ai_score: number | null;
  ai_model: string | null;
  created_at: string;
}

const ModerationLogs = () => {
  const { data: logs, isLoading, error } = useQuery({
    queryKey: ["moderation-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("moderation_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as ModerationLog[];
    },
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      nsfw: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      violence: "bg-red-500/20 text-red-300 border-red-500/30",
      hate_speech: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      spam: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      profanity: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    };
    return colors[category.toLowerCase()] || "bg-muted text-muted-foreground";
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="h-4 w-4" />;
      case "mixed":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Moderation Logs</h1>
          </div>
          <p className="text-muted-foreground">
            Theo dõi các nội dung bị đánh dấu vi phạm bởi hệ thống AI
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng vi phạm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logs?.length || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Hôm nay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {logs?.filter(l => 
                  new Date(l.created_at).toDateString() === new Date().toDateString()
                ).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Hate Speech
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">
                {logs?.filter(l => 
                  l.categories?.some(c => c.toLowerCase().includes("hate"))
                ).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                NSFW
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-400">
                {logs?.filter(l => 
                  l.categories?.some(c => c.toLowerCase().includes("nsfw"))
                ).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logs Table */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Chi tiết vi phạm
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                Lỗi khi tải dữ liệu: {(error as Error).message}
              </div>
            ) : logs?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có vi phạm nào được ghi nhận
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Nội dung</TableHead>
                      <TableHead>Lý do</TableHead>
                      <TableHead>Categories</TableHead>
                      <TableHead>AI Model</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs?.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getContentTypeIcon(log.content_type)}
                            <span className="capitalize">{log.content_type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate text-sm">
                            {log.content || "(Chỉ có media)"}
                          </p>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm text-muted-foreground">
                            {log.reason}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {log.categories?.map((cat, idx) => (
                              <Badge 
                                key={idx} 
                                variant="outline"
                                className={getCategoryColor(cat)}
                              >
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-primary" />
                            <span className="text-xs font-mono">
                              {log.ai_model || "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              (log.ai_score || 0) > 0.8 
                                ? "bg-green-500/20 text-green-300" 
                                : "bg-yellow-500/20 text-yellow-300"
                            }
                          >
                            {((log.ai_score || 0) * 100).toFixed(0)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ModerationLogs;
