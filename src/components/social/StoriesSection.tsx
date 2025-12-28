import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ChevronRight, Video } from "lucide-react";
import { motion } from "framer-motion";

interface Story {
  id: string;
  userName: string;
  avatar: string;
  hasNew: boolean;
  isLive?: boolean;
}

const mockStories: Story[] = [
  { id: "1", userName: "Anh Elgon", avatar: "", hasNew: true },
  { id: "2", userName: "Kim Ngọc", avatar: "", hasNew: true },
  { id: "3", userName: "Lê Minh Trí", avatar: "", hasNew: true },
  { id: "4", userName: "Lê Huỳnh Như", avatar: "", hasNew: false },
  { id: "5", userName: "Na Trần", avatar: "", hasNew: true },
  { id: "6", userName: "Diệu Ngọc", avatar: "", hasNew: false },
];

// Soft gradient backgrounds for letter avatars
const avatarGradients = [
  "from-purple-soft to-purple-light",
  "from-gold-champagne to-gold-light",
  "from-pink-400 to-rose-300",
  "from-sky-400 to-blue-300",
  "from-emerald-400 to-teal-300",
  "from-amber-400 to-orange-300",
];

export function StoriesSection() {
  const [activeTab, setActiveTab] = useState("stories");

  return (
    <div className="glass-card p-4 bg-white">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted p-1 rounded-xl border border-border">
          <TabsTrigger 
            value="stories" 
            className="rounded-lg text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
          >
            📖 Stories
          </TabsTrigger>
          <TabsTrigger 
            value="live" 
            className="rounded-lg text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
          >
            <Video className="w-4 h-4 mr-1" />
            Live
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stories" className="mt-0">
          <div className="relative">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {/* Create Story - Square Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="shrink-0 cursor-pointer"
              >
                <div className="relative w-28 h-40 rounded-xl bg-gradient-to-br from-muted to-muted/50 border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:from-primary/5 hover:to-primary/10 transition-all overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs text-foreground font-medium">Tạo tin</span>
                </div>
              </motion.div>

              {/* Story Items - Square Cards */}
              {mockStories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="shrink-0 cursor-pointer"
                >
                  <div className="relative w-28 h-40 rounded-xl overflow-hidden group">
                    {/* Background gradient / placeholder */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${avatarGradients[index % avatarGradients.length]}`}>
                      {story.avatar && (
                        <img 
                          src={story.avatar} 
                          alt={story.userName} 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Ring indicator for new stories */}
                    {story.hasNew && (
                      <div className="absolute top-2 left-2">
                        <div className="p-0.5 rounded-full bg-gradient-to-br from-gold-champagne via-gold-light to-gold-champagne">
                          <div className="w-8 h-8 rounded-full bg-card border-2 border-card overflow-hidden">
                            {story.avatar ? (
                              <img src={story.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className={`w-full h-full bg-gradient-to-br ${avatarGradients[index % avatarGradients.length]} flex items-center justify-center text-white text-xs font-bold`}>
                                {story.userName.charAt(0)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Live indicator */}
                    {story.isLive && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 bg-destructive text-destructive-foreground text-[10px] rounded-full font-medium">
                        LIVE
                      </span>
                    )}

                    {/* Name at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <span className="text-xs text-white font-medium line-clamp-2 drop-shadow-lg">
                        {story.userName}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Navigation Arrow */}
            <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-8 h-8 bg-white/90 rounded-full shadow-md flex items-center justify-center hover:bg-white transition-colors border border-white/50">
              <ChevronRight className="w-4 h-4 text-primary" />
            </button>
          </div>
        </TabsContent>

        <TabsContent value="live" className="mt-0">
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <Video className="w-8 h-8 mx-auto mb-2 opacity-70" />
              <p className="text-sm">Chưa có ai đang phát trực tiếp</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}