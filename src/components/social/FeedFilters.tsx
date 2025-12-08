import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  X, 
  Filter,
  MapPin,
  HandHeart,
  Gift,
  MessageSquare,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { FeedPostType, FeedFilters as FeedFiltersType } from "@/hooks/useFeedPosts";
import { motion, AnimatePresence } from "framer-motion";

interface FeedFiltersProps {
  filters: FeedFiltersType;
  onFiltersChange: (filters: FeedFiltersType) => void;
}

const postTypeOptions: { value: FeedPostType | "all"; label: string; icon: React.ElementType }[] = [
  { value: "all", label: "Tất cả", icon: TrendingUp },
  { value: "need", label: "Cần hỗ trợ", icon: HandHeart },
  { value: "supply", label: "Sẵn sàng cho", icon: Gift },
  { value: "story", label: "Câu chuyện", icon: MessageSquare },
];

const categoryOptions = [
  { value: "education", label: "Giáo dục", emoji: "📚" },
  { value: "healthcare", label: "Y tế", emoji: "🏥" },
  { value: "disaster_relief", label: "Cứu trợ", emoji: "🆘" },
  { value: "poverty", label: "Xóa nghèo", emoji: "🏠" },
  { value: "environment", label: "Môi trường", emoji: "🌱" },
  { value: "animal_welfare", label: "Động vật", emoji: "🐾" },
  { value: "community", label: "Cộng đồng", emoji: "🤝" },
  { value: "other", label: "Khác", emoji: "💫" },
];

const locationOptions = [
  { value: "", label: "Tất cả" },
  { value: "Hà Nội", label: "Hà Nội" },
  { value: "TP.HCM", label: "TP. Hồ Chí Minh" },
  { value: "Đà Nẵng", label: "Đà Nẵng" },
  { value: "Đà Lạt", label: "Đà Lạt" },
  { value: "Huế", label: "Huế" },
  { value: "Cần Thơ", label: "Cần Thơ" },
];

export function FeedFilters({ filters, onFiltersChange }: FeedFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchValue.trim() || undefined });
  };

  const handlePostTypeChange = (type: FeedPostType | "all") => {
    onFiltersChange({ 
      ...filters, 
      postType: type === "all" ? undefined : type 
    });
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({ 
      ...filters, 
      category: filters.category === category ? undefined : category 
    });
  };

  const handleLocationChange = (location: string) => {
    onFiltersChange({ 
      ...filters, 
      location: location || undefined 
    });
  };

  const clearFilters = () => {
    setSearchValue("");
    onFiltersChange({});
  };

  const hasActiveFilters = filters.postType || filters.category || filters.location || filters.search;
  const activeFilterCount = [filters.postType, filters.category, filters.location, filters.search].filter(Boolean).length;

  return (
    <div className="glass-card p-4 space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm bài viết..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9 bg-muted/50 border-none"
          />
          {searchValue && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => {
                setSearchValue("");
                onFiltersChange({ ...filters, search: undefined });
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
        <Button type="submit" variant="secondary" size="icon">
          <Search className="w-4 h-4" />
        </Button>
      </form>

      {/* Post Type Tabs */}
      <div className="flex flex-wrap gap-2">
        {postTypeOptions.map((option) => {
          const Icon = option.icon;
          const isActive = option.value === "all" 
            ? !filters.postType 
            : filters.postType === option.value;
          
          return (
            <Button
              key={option.value}
              variant={isActive ? "secondary" : "outline"}
              size="sm"
              onClick={() => handlePostTypeChange(option.value)}
              className={`gap-1.5 ${isActive ? "" : "border-border/50"}`}
            >
              <Icon className="w-4 h-4" />
              {option.label}
            </Button>
          );
        })}
      </div>

      {/* Toggle Advanced Filters */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full justify-between text-muted-foreground hover:text-foreground"
      >
        <span className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Bộ lọc nâng cao
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </span>
        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Danh mục</label>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((cat) => (
                  <Button
                    key={cat.value}
                    variant={filters.category === cat.value ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryChange(cat.value)}
                    className={`gap-1 ${filters.category === cat.value ? "" : "border-border/50"}`}
                  >
                    <span>{cat.emoji}</span>
                    <span className="hidden sm:inline">{cat.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Khu vực
              </label>
              <div className="flex flex-wrap gap-2">
                {locationOptions.map((loc) => (
                  <Button
                    key={loc.value}
                    variant={filters.location === loc.value || (!filters.location && !loc.value) ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => handleLocationChange(loc.value)}
                    className={filters.location === loc.value || (!filters.location && !loc.value) ? "" : "border-border/50"}
                  >
                    {loc.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <X className="w-4 h-4 mr-1" />
                Xóa tất cả bộ lọc
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {hasActiveFilters && !showAdvanced && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Tìm: "{filters.search}"
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => {
                  setSearchValue("");
                  onFiltersChange({ ...filters, search: undefined });
                }}
              />
            </Badge>
          )}
          {filters.category && (
            <Badge variant="secondary" className="gap-1">
              {categoryOptions.find(c => c.value === filters.category)?.emoji}{" "}
              {categoryOptions.find(c => c.value === filters.category)?.label}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onFiltersChange({ ...filters, category: undefined })}
              />
            </Badge>
          )}
          {filters.location && (
            <Badge variant="secondary" className="gap-1">
              <MapPin className="w-3 h-3" />
              {filters.location}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onFiltersChange({ ...filters, location: undefined })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
