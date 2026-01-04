import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Locate, Loader2 } from 'lucide-react';
import { DISTANCE_OPTIONS } from '@/lib/geoUtils';

interface DistanceFilterProps {
  selectedDistance: number;
  onDistanceChange: (distance: number) => void;
  userLocationAvailable: boolean;
  onRequestLocation: () => void;
  loading?: boolean;
}

export const DistanceFilter = ({
  selectedDistance,
  onDistanceChange,
  userLocationAvailable,
  onRequestLocation,
  loading = false,
}: DistanceFilterProps) => {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50">
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" />
        <span className="font-medium text-sm">
          {language === 'vi' ? 'Lọc theo khoảng cách' : 'Filter by distance'}
        </span>
      </div>

      {!userLocationAvailable ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onRequestLocation}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Locate className="w-4 h-4" />
          )}
          {language === 'vi' ? 'Bật vị trí' : 'Enable location'}
        </Button>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {DISTANCE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={selectedDistance === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onDistanceChange(option.value)}
              className="min-w-[60px]"
            >
              {option.value === -1
                ? language === 'vi'
                  ? 'Tất cả'
                  : 'All'
                : option.label}
            </Button>
          ))}
        </div>
      )}

      {userLocationAvailable && selectedDistance > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>✓</span>
          <span>
            {language === 'vi'
              ? `Đang lọc trong bán kính ${selectedDistance}km`
              : `Filtering within ${selectedDistance}km radius`}
          </span>
        </div>
      )}
    </div>
  );
};
