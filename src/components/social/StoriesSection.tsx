import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ChevronLeft, ChevronRight, Video } from "lucide-react";
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
];

export function StoriesSection() {
  const [activeTab, setActiveTab] = useState("stories");

  return (
    <div className="glass-card p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="stories" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
            📖 Stories
          </TabsTrigger>
          <TabsTrigger value="live" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
            <Video className="w-4 h-4 mr-1" />
            Live
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stories" className="mt-0">
          <div className="relative">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {/* Create Story */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="shrink-0 w-24 cursor-pointer"
              >
                <div className="relative h-36 rounded-xl bg-gradient-to-br from-muted to-muted/50 border-2 border-dashed border-secondary/30 flex flex-col items-center justify-center gap-2 hover:border-secondary/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <Plus className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <span className="text-xs text-center text-muted-foreground">Tạo tin</span>
                </div>
              </motion.div>

              {/* Story Items */}
              {mockStories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="shrink-0 w-24 cursor-pointer group"
                >
                  <div className={`relative h-36 rounded-xl overflow-hidden ${
                    story.hasNew 
                      ? "ring-2 ring-secondary ring-offset-2 ring-offset-background" 
                      : ""
                  }`}>
                    {/* Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-secondary/40" />
                    
                    {/* Avatar */}
                    <div className="absolute top-2 left-2">
                      <Avatar className={`w-9 h-9 border-2 ${
                        story.hasNew ? "border-secondary" : "border-border"
                      }`}>
                        <AvatarImage src={story.avatar} />
                        <AvatarFallback className="bg-secondary/20 text-xs">
                          {story.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Live indicator */}
                    {story.isLive && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-xs rounded-full">
                          LIVE
                        </span>
                      </div>
                    )}

                    {/* Name */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                      <span className="text-xs text-white font-medium line-clamp-2">
                        {story.userName}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-8 h-8 bg-background/90 rounded-full shadow-lg flex items-center justify-center hover:bg-background transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-8 h-8 bg-background/90 rounded-full shadow-lg flex items-center justify-center hover:bg-background transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </TabsContent>

        <TabsContent value="live" className="mt-0">
          <div className="flex items-center justify-center h-36 text-muted-foreground">
            <div className="text-center">
              <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Chưa có ai đang phát trực tiếp</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
