-- =============================================
-- SOCIAL FEED & MATCHING ENGINE TABLES
-- =============================================

-- Enum for post types (need vs supply)
CREATE TYPE public.feed_post_type AS ENUM ('need', 'supply', 'update', 'story');

-- Enum for urgency levels
CREATE TYPE public.urgency_level AS ENUM ('low', 'medium', 'high', 'critical');

-- =============================================
-- TABLE: feed_posts (unified social feed)
-- =============================================
CREATE TABLE public.feed_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    
    -- Post content
    post_type feed_post_type NOT NULL DEFAULT 'update',
    title TEXT,
    content TEXT,
    media_urls JSONB DEFAULT '[]'::jsonb,
    
    -- Location for geo-matching
    location TEXT,
    region TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Matching fields (for need/supply posts)
    category campaign_category,
    urgency urgency_level DEFAULT 'medium',
    target_amount NUMERIC DEFAULT 0,
    fulfilled_amount NUMERIC DEFAULT 0,
    beneficiaries_count INTEGER DEFAULT 0,
    estimated_delivery TEXT,
    
    -- Skills/resources for volunteer matching
    required_skills TEXT[],
    offered_skills TEXT[],
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_matched BOOLEAN DEFAULT false,
    matched_with_id UUID REFERENCES public.feed_posts(id) ON DELETE SET NULL,
    
    -- Timestamps
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- TABLE: feed_matches (matching results)
-- =============================================
CREATE TABLE public.feed_matches (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    need_post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
    supply_post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
    
    -- Match scoring
    match_score DECIMAL(5, 2) NOT NULL DEFAULT 0, -- 0-100 score
    geo_score DECIMAL(5, 2) DEFAULT 0,
    category_score DECIMAL(5, 2) DEFAULT 0,
    urgency_score DECIMAL(5, 2) DEFAULT 0,
    reputation_score DECIMAL(5, 2) DEFAULT 0,
    
    -- Match status
    status TEXT NOT NULL DEFAULT 'suggested', -- suggested, accepted, rejected, completed
    suggested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Notes
    notes TEXT,
    
    -- Unique constraint to prevent duplicate matches
    UNIQUE(need_post_id, supply_post_id)
);

-- =============================================
-- TABLE: feed_comments (comments on feed posts)
-- =============================================
CREATE TABLE public.feed_comments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    feed_post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    parent_comment_id UUID REFERENCES public.feed_comments(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    image_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- TABLE: feed_reactions (reactions on feed posts)
-- =============================================
CREATE TABLE public.feed_reactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    feed_post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    reaction_type TEXT NOT NULL DEFAULT 'like', -- like, love, support, pray, celebrate
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    UNIQUE(feed_post_id, user_id)
);

-- =============================================
-- ENABLE RLS
-- =============================================
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_reactions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES: feed_posts
-- =============================================
CREATE POLICY "Anyone can view active feed posts"
ON public.feed_posts FOR SELECT
USING (is_active = true);

CREATE POLICY "Users can create their own feed posts"
ON public.feed_posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feed posts"
ON public.feed_posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feed posts"
ON public.feed_posts FOR DELETE
USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES: feed_matches
-- =============================================
CREATE POLICY "Users can view matches for their posts"
ON public.feed_matches FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.feed_posts
        WHERE (feed_posts.id = feed_matches.need_post_id OR feed_posts.id = feed_matches.supply_post_id)
        AND feed_posts.user_id = auth.uid()
    )
);

CREATE POLICY "System and admins can create matches"
ON public.feed_matches FOR INSERT
WITH CHECK (is_admin(auth.uid()) OR auth.uid() IS NOT NULL);

CREATE POLICY "Post owners can update match status"
ON public.feed_matches FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.feed_posts
        WHERE (feed_posts.id = feed_matches.need_post_id OR feed_posts.id = feed_matches.supply_post_id)
        AND feed_posts.user_id = auth.uid()
    )
);

-- =============================================
-- RLS POLICIES: feed_comments
-- =============================================
CREATE POLICY "Anyone can view comments"
ON public.feed_comments FOR SELECT
USING (true);

CREATE POLICY "Users can create comments"
ON public.feed_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.feed_comments FOR DELETE
USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES: feed_reactions
-- =============================================
CREATE POLICY "Anyone can view reactions"
ON public.feed_reactions FOR SELECT
USING (true);

CREATE POLICY "Users can add reactions"
ON public.feed_reactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their reactions"
ON public.feed_reactions FOR DELETE
USING (auth.uid() = user_id);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_feed_posts_user ON public.feed_posts(user_id);
CREATE INDEX idx_feed_posts_campaign ON public.feed_posts(campaign_id);
CREATE INDEX idx_feed_posts_type ON public.feed_posts(post_type);
CREATE INDEX idx_feed_posts_category ON public.feed_posts(category);
CREATE INDEX idx_feed_posts_urgency ON public.feed_posts(urgency);
CREATE INDEX idx_feed_posts_region ON public.feed_posts(region);
CREATE INDEX idx_feed_posts_active ON public.feed_posts(is_active, is_matched);
CREATE INDEX idx_feed_posts_created ON public.feed_posts(created_at DESC);

CREATE INDEX idx_feed_matches_need ON public.feed_matches(need_post_id);
CREATE INDEX idx_feed_matches_supply ON public.feed_matches(supply_post_id);
CREATE INDEX idx_feed_matches_score ON public.feed_matches(match_score DESC);

CREATE INDEX idx_feed_comments_post ON public.feed_comments(feed_post_id);
CREATE INDEX idx_feed_reactions_post ON public.feed_reactions(feed_post_id);

-- =============================================
-- TRIGGER: Update updated_at
-- =============================================
CREATE TRIGGER update_feed_posts_updated_at
BEFORE UPDATE ON public.feed_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ENABLE REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_comments;