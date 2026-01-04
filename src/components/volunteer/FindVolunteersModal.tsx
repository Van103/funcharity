import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNearbyVolunteers } from '@/hooks/useNearbyVolunteers';
import { NearbyVolunteersPanel } from './NearbyVolunteersPanel';
import { useToast } from '@/hooks/use-toast';
import { HelpRequest } from '@/hooks/useHelpRequests';
import { Search, Loader2 } from 'lucide-react';

interface FindVolunteersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: HelpRequest | null;
  onMatchCreated?: () => void;
}

export const FindVolunteersModal = ({
  open,
  onOpenChange,
  request,
  onMatchCreated,
}: FindVolunteersModalProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { volunteers, loading, findNearbyVolunteers, createMatches } = useNearbyVolunteers();
  const [radiusKm, setRadiusKm] = useState(25);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (open) {
      setHasSearched(false);
    }
  }, [open]);

  const handleSearch = async () => {
    if (!request) return;
    await findNearbyVolunteers(request.id, radiusKm, 20);
    setHasSearched(true);
  };

  const handleSendInvites = async (volunteerIds: string[]) => {
    if (!request) return;

    const result = await createMatches(request.id, volunteerIds);
    if (result) {
      toast({
        title: language === 'vi' ? 'Đã gửi lời mời!' : 'Invites sent!',
        description:
          language === 'vi'
            ? `Đã gửi lời mời đến ${volunteerIds.length} tình nguyện viên`
            : `Sent invites to ${volunteerIds.length} volunteers`,
      });
      onMatchCreated?.();
      onOpenChange(false);
    } else {
      toast({
        title: language === 'vi' ? 'Lỗi' : 'Error',
        description: language === 'vi' ? 'Không thể gửi lời mời' : 'Failed to send invites',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'vi' ? 'Tìm tình nguyện viên gần đây' : 'Find Nearby Volunteers'}
          </DialogTitle>
          <DialogDescription>
            {request?.title}
          </DialogDescription>
        </DialogHeader>

        {!hasSearched ? (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {language === 'vi' ? 'Bán kính tìm kiếm' : 'Search radius'}
                </span>
                <span className="text-primary font-bold">{radiusKm} km</span>
              </div>
              <Slider
                value={[radiusKm]}
                onValueChange={([value]) => setRadiusKm(value)}
                min={5}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5km</span>
                <span>50km</span>
                <span>100km</span>
              </div>
            </div>

            <Button onClick={handleSearch} className="w-full gap-2" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {language === 'vi' ? 'Tìm tình nguyện viên' : 'Find Volunteers'}
            </Button>
          </div>
        ) : (
          <div className="py-4">
            <NearbyVolunteersPanel
              volunteers={volunteers}
              loading={loading}
              onSendInvites={handleSendInvites}
              onClose={() => onOpenChange(false)}
            />

            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => setHasSearched(false)}>
                {language === 'vi' ? 'Tìm lại' : 'Search again'}
              </Button>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                {language === 'vi' ? 'Đóng' : 'Close'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
