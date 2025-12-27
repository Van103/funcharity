import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Eye, 
  ThumbsUp, 
  ThumbsDown,
  AlertTriangle,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  FileText,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { Helmet } from 'react-helmet-async';

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  short_description: string | null;
  category: string;
  status: string;
  goal_amount: number;
  raised_amount: number;
  currency: string;
  location: string | null;
  region: string | null;
  cover_image_url: string | null;
  created_at: string;
  start_date: string | null;
  end_date: string | null;
  creator_id: string;
  urgency_level: number | null;
  is_verified: boolean | null;
  is_featured: boolean | null;
}

interface CampaignWithCreator extends Campaign {
  creator?: {
    full_name: string | null;
    avatar_url: string | null;
    is_verified: boolean | null;
  };
}

const AdminVerify = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [campaigns, setCampaigns] = useState<CampaignWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignWithCreator | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [processing, setProcessing] = useState(false);

  const dateLocale = language === 'vi' ? vi : enUS;

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check if user has admin role
      const { data: roleData, error } = await supabase
        .rpc('is_admin', { _user_id: user.id });

      if (error || !roleData) {
        toast({
          title: language === 'vi' ? 'Không có quyền truy cập' : 'Access Denied',
          description: language === 'vi' 
            ? 'Bạn không có quyền truy cập trang quản trị viên' 
            : 'You do not have permission to access the admin panel',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      setIsAdmin(true);
    };

    checkAdminStatus();
  }, [navigate, toast, language]);

  // Fetch campaigns
  useEffect(() => {
    if (!isAdmin) return;
    fetchCampaigns();
  }, [isAdmin, activeTab]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeTab === 'pending') {
        query = query.eq('status', 'pending_review');
      } else if (activeTab === 'approved') {
        query = query.in('status', ['approved', 'active']);
      } else if (activeTab === 'rejected') {
        query = query.eq('status', 'rejected');
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch creator profiles
      const campaignsWithCreators = await Promise.all(
        (data || []).map(async (campaign) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, is_verified')
            .eq('user_id', campaign.creator_id)
            .single();

          return {
            ...campaign,
            creator: profile || undefined,
          };
        })
      );

      setCampaigns(campaignsWithCreators);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: language === 'vi' ? 'Lỗi' : 'Error',
        description: language === 'vi' 
          ? 'Không thể tải danh sách chiến dịch' 
          : 'Failed to load campaigns',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (campaign: CampaignWithCreator) => {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('campaigns')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user.id,
          is_verified: true,
        })
        .eq('id', campaign.id);

      if (error) throw error;

      // Create audit log
      await supabase.from('campaign_audits').insert({
        campaign_id: campaign.id,
        auditor_id: user.id,
        action: 'approve',
        previous_status: campaign.status as any,
        new_status: 'approved',
        notes: 'Campaign approved by admin',
      });

      toast({
        title: language === 'vi' ? 'Đã duyệt' : 'Approved',
        description: language === 'vi' 
          ? `Chiến dịch "${campaign.title}" đã được phê duyệt` 
          : `Campaign "${campaign.title}" has been approved`,
      });

      fetchCampaigns();
      setShowDetailDialog(false);
    } catch (error) {
      console.error('Error approving campaign:', error);
      toast({
        title: language === 'vi' ? 'Lỗi' : 'Error',
        description: language === 'vi' 
          ? 'Không thể phê duyệt chiến dịch' 
          : 'Failed to approve campaign',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCampaign || !rejectReason.trim()) return;

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('campaigns')
        .update({
          status: 'rejected',
        })
        .eq('id', selectedCampaign.id);

      if (error) throw error;

      // Create audit log
      await supabase.from('campaign_audits').insert({
        campaign_id: selectedCampaign.id,
        auditor_id: user.id,
        action: 'reject',
        previous_status: selectedCampaign.status as any,
        new_status: 'rejected',
        notes: rejectReason,
      });

      toast({
        title: language === 'vi' ? 'Đã từ chối' : 'Rejected',
        description: language === 'vi' 
          ? `Chiến dịch "${selectedCampaign.title}" đã bị từ chối` 
          : `Campaign "${selectedCampaign.title}" has been rejected`,
      });

      fetchCampaigns();
      setShowRejectDialog(false);
      setShowDetailDialog(false);
      setRejectReason('');
    } catch (error) {
      console.error('Error rejecting campaign:', error);
      toast({
        title: language === 'vi' ? 'Lỗi' : 'Error',
        description: language === 'vi' 
          ? 'Không thể từ chối chiến dịch' 
          : 'Failed to reject campaign',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.creator?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, { vi: string; en: string }> = {
      education: { vi: 'Giáo dục', en: 'Education' },
      healthcare: { vi: 'Y tế', en: 'Healthcare' },
      disaster_relief: { vi: 'Cứu trợ thiên tai', en: 'Disaster Relief' },
      poverty: { vi: 'Xóa đói giảm nghèo', en: 'Poverty' },
      environment: { vi: 'Môi trường', en: 'Environment' },
      animal_welfare: { vi: 'Bảo vệ động vật', en: 'Animal Welfare' },
      community: { vi: 'Cộng đồng', en: 'Community' },
      other: { vi: 'Khác', en: 'Other' },
    };
    return labels[category]?.[language] || category;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending_review: { label: language === 'vi' ? 'Chờ duyệt' : 'Pending', variant: 'secondary' },
      approved: { label: language === 'vi' ? 'Đã duyệt' : 'Approved', variant: 'default' },
      active: { label: language === 'vi' ? 'Đang hoạt động' : 'Active', variant: 'default' },
      rejected: { label: language === 'vi' ? 'Đã từ chối' : 'Rejected', variant: 'destructive' },
    };
    const config = statusConfig[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {language === 'vi' ? 'Đang kiểm tra quyền truy cập...' : 'Checking access...'}
          </h1>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{language === 'vi' ? 'Quản trị - Duyệt chiến dịch' : 'Admin - Campaign Verification'}</title>
        <meta name="description" content={language === 'vi' ? 'Trang quản trị viên duyệt chiến dịch' : 'Admin panel for campaign verification'} />
      </Helmet>

      <div className="min-h-screen bg-background pt-20 pb-10">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-primary/10">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {language === 'vi' ? 'Quản trị viên' : 'Admin Panel'}
                </h1>
                <p className="text-muted-foreground">
                  {language === 'vi' ? 'Duyệt và quản lý các chiến dịch' : 'Review and manage campaigns'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/10">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {campaigns.filter(c => c.status === 'pending_review').length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'vi' ? 'Chờ duyệt' : 'Pending'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {campaigns.filter(c => ['approved', 'active'].includes(c.status)).length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'vi' ? 'Đã duyệt' : 'Approved'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-500/10">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {campaigns.filter(c => c.status === 'rejected').length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'vi' ? 'Đã từ chối' : 'Rejected'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {campaigns.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'vi' ? 'Tổng cộng' : 'Total'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">
                      {language === 'vi' ? 'Danh sách chiến dịch' : 'Campaign List'}
                    </CardTitle>
                    <CardDescription>
                      {language === 'vi' 
                        ? 'Xem xét và phê duyệt các chiến dịch mới' 
                        : 'Review and approve new campaigns'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder={language === 'vi' ? 'Tìm kiếm...' : 'Search...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-[200px] md:w-[300px]"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={fetchCampaigns}
                      disabled={loading}
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-6">
                    <TabsTrigger value="pending" className="gap-2">
                      <Clock className="w-4 h-4" />
                      {language === 'vi' ? 'Chờ duyệt' : 'Pending'}
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {language === 'vi' ? 'Đã duyệt' : 'Approved'}
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="gap-2">
                      <XCircle className="w-4 h-4" />
                      {language === 'vi' ? 'Đã từ chối' : 'Rejected'}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab}>
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : filteredCampaigns.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {language === 'vi' 
                            ? 'Không có chiến dịch nào' 
                            : 'No campaigns found'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <AnimatePresence>
                          {filteredCampaigns.map((campaign, index) => (
                            <motion.div
                              key={campaign.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Card className="bg-background/50 hover:bg-background/80 transition-all duration-300 border-border/50 hover:border-primary/30 hover:shadow-lg">
                                <CardContent className="p-4">
                                  <div className="flex flex-col md:flex-row gap-4">
                                    {/* Cover Image */}
                                    <div className="w-full md:w-40 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                      {campaign.cover_image_url ? (
                                        <img 
                                          src={campaign.cover_image_url} 
                                          alt={campaign.title}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <FileText className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                      )}
                                    </div>

                                    {/* Campaign Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2 mb-2">
                                        <div>
                                          <h3 className="font-semibold text-foreground line-clamp-1">
                                            {campaign.title}
                                          </h3>
                                          <p className="text-sm text-muted-foreground line-clamp-2">
                                            {campaign.short_description || campaign.description}
                                          </p>
                                        </div>
                                        {getStatusBadge(campaign.status)}
                                      </div>

                                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                                        <div className="flex items-center gap-1">
                                          <Users className="w-4 h-4" />
                                          <span>{campaign.creator?.full_name || 'Unknown'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <DollarSign className="w-4 h-4" />
                                          <span>
                                            {campaign.goal_amount.toLocaleString()} {campaign.currency}
                                          </span>
                                        </div>
                                        {campaign.location && (
                                          <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            <span>{campaign.location}</span>
                                          </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                          <Calendar className="w-4 h-4" />
                                          <span>
                                            {format(new Date(campaign.created_at), 'dd/MM/yyyy', { locale: dateLocale })}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline">{getCategoryLabel(campaign.category)}</Badge>
                                        {campaign.urgency_level && campaign.urgency_level >= 3 && (
                                          <Badge variant="destructive" className="gap-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            {language === 'vi' ? 'Khẩn cấp' : 'Urgent'}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex md:flex-col gap-2 flex-shrink-0">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedCampaign(campaign);
                                          setShowDetailDialog(true);
                                        }}
                                        className="gap-1"
                                      >
                                        <Eye className="w-4 h-4" />
                                        {language === 'vi' ? 'Xem' : 'View'}
                                      </Button>
                                      {campaign.status === 'pending_review' && (
                                        <>
                                          <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() => handleApprove(campaign)}
                                            disabled={processing}
                                            className="gap-1 bg-green-600 hover:bg-green-700"
                                          >
                                            <ThumbsUp className="w-4 h-4" />
                                            {language === 'vi' ? 'Duyệt' : 'Approve'}
                                          </Button>
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                              setSelectedCampaign(campaign);
                                              setShowRejectDialog(true);
                                            }}
                                            disabled={processing}
                                            className="gap-1"
                                          >
                                            <ThumbsDown className="w-4 h-4" />
                                            {language === 'vi' ? 'Từ chối' : 'Reject'}
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Campaign Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedCampaign?.title}</DialogTitle>
            <DialogDescription>
              {language === 'vi' ? 'Chi tiết chiến dịch' : 'Campaign Details'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {selectedCampaign && (
              <div className="space-y-6 pr-4">
                {selectedCampaign.cover_image_url && (
                  <img 
                    src={selectedCampaign.cover_image_url} 
                    alt={selectedCampaign.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'vi' ? 'Người tạo' : 'Creator'}
                    </p>
                    <p className="font-medium">{selectedCampaign.creator?.full_name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'vi' ? 'Danh mục' : 'Category'}
                    </p>
                    <p className="font-medium">{getCategoryLabel(selectedCampaign.category)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'vi' ? 'Mục tiêu' : 'Goal'}
                    </p>
                    <p className="font-medium">
                      {selectedCampaign.goal_amount.toLocaleString()} {selectedCampaign.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'vi' ? 'Đã quyên góp' : 'Raised'}
                    </p>
                    <p className="font-medium">
                      {selectedCampaign.raised_amount.toLocaleString()} {selectedCampaign.currency}
                    </p>
                  </div>
                  {selectedCampaign.location && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'vi' ? 'Địa điểm' : 'Location'}
                      </p>
                      <p className="font-medium">{selectedCampaign.location}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'vi' ? 'Ngày tạo' : 'Created'}
                    </p>
                    <p className="font-medium">
                      {format(new Date(selectedCampaign.created_at), 'dd/MM/yyyy HH:mm', { locale: dateLocale })}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {language === 'vi' ? 'Mô tả' : 'Description'}
                  </p>
                  <p className="text-foreground whitespace-pre-wrap">
                    {selectedCampaign.description || selectedCampaign.short_description || 'No description'}
                  </p>
                </div>
              </div>
            )}
          </ScrollArea>
          <DialogFooter className="gap-2">
            {selectedCampaign?.status === 'pending_review' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={processing}
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  {language === 'vi' ? 'Từ chối' : 'Reject'}
                </Button>
                <Button
                  onClick={() => selectedCampaign && handleApprove(selectedCampaign)}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  {language === 'vi' ? 'Phê duyệt' : 'Approve'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'vi' ? 'Từ chối chiến dịch' : 'Reject Campaign'}
            </DialogTitle>
            <DialogDescription>
              {language === 'vi' 
                ? 'Vui lòng cung cấp lý do từ chối chiến dịch này' 
                : 'Please provide a reason for rejecting this campaign'}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder={language === 'vi' ? 'Lý do từ chối...' : 'Reason for rejection...'}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              {language === 'vi' ? 'Hủy' : 'Cancel'}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectReason.trim() || processing}
            >
              {processing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              {language === 'vi' ? 'Xác nhận từ chối' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminVerify;
