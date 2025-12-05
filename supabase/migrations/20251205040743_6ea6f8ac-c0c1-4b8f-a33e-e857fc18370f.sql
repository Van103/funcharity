-- =============================================
-- NOTIFICATIONS SYSTEM
-- =============================================

CREATE TYPE public.notification_type AS ENUM (
    'donation_received',
    'donation_confirmed',
    'campaign_approved',
    'campaign_rejected',
    'campaign_funded',
    'badge_earned',
    'friend_request',
    'comment_reply',
    'system_announcement'
);

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email_donations BOOLEAN DEFAULT true,
    email_campaigns BOOLEAN DEFAULT true,
    email_social BOOLEAN DEFAULT false,
    push_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- =============================================
-- REPORTS & MODERATION SYSTEM
-- =============================================

CREATE TYPE public.report_status AS ENUM (
    'pending',
    'investigating',
    'resolved',
    'dismissed'
);

CREATE TYPE public.report_type AS ENUM (
    'fraud',
    'spam',
    'inappropriate_content',
    'fake_campaign',
    'misuse_of_funds',
    'other'
);

CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    target_type TEXT NOT NULL, -- campaign, post, user, comment
    target_id UUID NOT NULL,
    report_type report_type NOT NULL,
    status report_status NOT NULL DEFAULT 'pending',
    description TEXT,
    evidence_urls JSONB DEFAULT '[]'::jsonb,
    admin_notes TEXT,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Admin action logs
CREATE TABLE public.admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- KYC REQUESTS
-- =============================================

CREATE TYPE public.kyc_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'expired'
);

CREATE TABLE public.kyc_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    requested_role user_role NOT NULL,
    status kyc_status NOT NULL DEFAULT 'pending',
    
    -- Documents (stored securely)
    id_document_url TEXT,
    business_license_url TEXT,
    additional_docs JSONB DEFAULT '[]'::jsonb,
    
    -- Verification
    verified_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.kyc_requests ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Notification preferences
CREATE POLICY "Users can manage own preferences"
ON public.notification_preferences FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Reports
CREATE POLICY "Users can create reports"
ON public.reports FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own reports"
ON public.reports FOR SELECT
USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage reports"
ON public.reports FOR ALL
USING (public.is_admin(auth.uid()));

-- Admin actions
CREATE POLICY "Admins can view actions"
ON public.admin_actions FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can log actions"
ON public.admin_actions FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

-- KYC Requests
CREATE POLICY "Users can view own KYC"
ON public.kyc_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can submit KYC"
ON public.kyc_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage KYC"
ON public.kyc_requests FOR ALL
USING (public.is_admin(auth.uid()));

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_kyc_status ON public.kyc_requests(status);

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kyc_requests_updated_at
BEFORE UPDATE ON public.kyc_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ENABLE REALTIME FOR KEY TABLES
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaigns;