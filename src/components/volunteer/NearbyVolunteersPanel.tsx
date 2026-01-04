import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { NearbyVolunteer } from '@/hooks/useNearbyVolunteers';
import { formatDistance } from '@/lib/geoUtils';
import { SKILL_OPTIONS } from '@/hooks/useVolunteerProfile';
import {
  User,
  Star,
  MapPin,
  Loader2,
  UserCheck,
  Send,
} from 'lucide-react';

interface NearbyVolunteersPanelProps {
  volunteers: NearbyVolunteer[];
  loading: boolean;
  onSendInvites: (volunteerIds: string[]) => void;
  onClose: () => void;
}

export const NearbyVolunteersPanel = ({
  volunteers,
  loading,
  onSendInvites,
  onClose,
}: NearbyVolunteersPanelProps) => {
  const { language } = useLanguage();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleSendInvites = () => {
    onSendInvites(Array.from(selectedIds));
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">
            {language === 'vi' ? 'Đang tìm tình nguyện viên...' : 'Finding volunteers...'}
          </span>
        </CardContent>
      </Card>
    );
  }

  if (volunteers.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="text-center py-12">
          <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">
            {language === 'vi' ? 'Không tìm thấy tình nguyện viên' : 'No volunteers found'}
          </h3>
          <p className="text-muted-foreground text-sm">
            {language === 'vi'
              ? 'Thử mở rộng bán kính tìm kiếm hoặc điều chỉnh yêu cầu kỹ năng'
              : 'Try expanding the search radius or adjusting skill requirements'}
          </p>
          <Button variant="outline" onClick={onClose} className="mt-4">
            {language === 'vi' ? 'Đóng' : 'Close'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            {language === 'vi' ? 'Tình nguyện viên gần đây' : 'Nearby Volunteers'}
            <Badge variant="secondary">{volunteers.length}</Badge>
          </CardTitle>
          {selectedIds.size > 0 && (
            <Button size="sm" onClick={handleSendInvites} className="gap-2">
              <Send className="w-4 h-4" />
              {language === 'vi' ? `Gửi lời mời (${selectedIds.size})` : `Send invites (${selectedIds.size})`}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
        {volunteers.map((volunteer) => (
          <div
            key={volunteer.volunteer_id}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
              selectedIds.has(volunteer.volunteer_id)
                ? 'bg-primary/10 border-primary/50'
                : 'bg-background/50 border-border/50 hover:bg-background/80'
            }`}
            onClick={() => toggleSelection(volunteer.volunteer_id)}
          >
            <Checkbox
              checked={selectedIds.has(volunteer.volunteer_id)}
              onCheckedChange={() => toggleSelection(volunteer.volunteer_id)}
            />

            <Avatar className="w-12 h-12">
              <AvatarImage src={volunteer.profile?.avatar_url} />
              <AvatarFallback>
                <User className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold truncate">
                  {volunteer.profile?.full_name || 'Anonymous'}
                </span>
                {volunteer.volunteer_profile?.rating && volunteer.volunteer_profile.rating > 0 && (
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-xs">{volunteer.volunteer_profile.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                <Badge variant="outline" className="text-xs">
                  {volunteer.volunteer_profile?.experience_level || 'beginner'}
                </Badge>
                {volunteer.distance_km !== undefined && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {formatDistance(volunteer.distance_km)}
                  </span>
                )}
                <span>
                  {volunteer.volunteer_profile?.completed_tasks || 0}{' '}
                  {language === 'vi' ? 'nhiệm vụ' : 'tasks'}
                </span>
              </div>

              {volunteer.volunteer_profile?.skills && volunteer.volunteer_profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {volunteer.volunteer_profile.skills.slice(0, 3).map((skillId) => {
                    const skill = SKILL_OPTIONS.find((s) => s.id === skillId);
                    return skill ? (
                      <Badge key={skillId} variant="secondary" className="text-xs">
                        {skill.icon} {language === 'vi' ? skill.labelVi : skill.labelEn}
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            <div className="text-right">
              <div className={`text-2xl font-bold ${getMatchScoreColor(volunteer.match_score)}`}>
                {volunteer.match_score}%
              </div>
              <span className="text-xs text-muted-foreground">
                {language === 'vi' ? 'Độ phù hợp' : 'Match'}
              </span>
              <Progress value={volunteer.match_score} className="h-1 mt-1 w-16" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
