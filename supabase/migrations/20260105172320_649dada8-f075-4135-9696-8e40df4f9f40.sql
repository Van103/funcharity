
-- Bảng cấu hình phần thưởng
CREATE TABLE public.reward_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type TEXT NOT NULL, -- signup, post, donation, referral, volunteer
  reward_currency TEXT NOT NULL DEFAULT 'CAMLY', -- CAMLY, BTC, USDT, BNB, VND
  reward_amount NUMERIC NOT NULL DEFAULT 0,
  reward_percentage NUMERIC DEFAULT NULL, -- cho donation (1% = 0.01)
  min_threshold NUMERIC DEFAULT 0, -- điều kiện tối thiểu
  max_per_day NUMERIC DEFAULT NULL, -- giới hạn mỗi ngày
  bonus_conditions JSONB DEFAULT NULL, -- điều kiện thưởng thêm
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(action_type, reward_currency)
);

-- Bảng số dư đa tiền tệ
CREATE TABLE public.user_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CAMLY',
  balance NUMERIC NOT NULL DEFAULT 0,
  total_earned NUMERIC NOT NULL DEFAULT 0,
  total_withdrawn NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, currency)
);

-- Bảng lịch sử giao dịch thưởng
CREATE TABLE public.reward_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CAMLY',
  amount NUMERIC NOT NULL,
  reference_id UUID DEFAULT NULL, -- ID bài viết/quyên góp liên quan
  reference_type TEXT DEFAULT NULL, -- post, donation, referral
  description TEXT DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'completed', -- pending, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Bảng mã giới thiệu
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  uses_count INTEGER NOT NULL DEFAULT 0,
  total_earned NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Bảng theo dõi referral
CREATE TABLE public.referral_uses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_code_id UUID NOT NULL REFERENCES public.referral_codes(id),
  referred_user_id UUID NOT NULL UNIQUE,
  reward_given BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reward_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_uses ENABLE ROW LEVEL SECURITY;

-- RLS Policies cho reward_config (chỉ đọc cho tất cả)
CREATE POLICY "Anyone can view active reward configs"
ON public.reward_config FOR SELECT
USING (is_active = true);

-- RLS Policies cho user_balances
CREATE POLICY "Users can view their own balances"
ON public.user_balances FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert balances"
ON public.user_balances FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update balances"
ON public.user_balances FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies cho reward_transactions
CREATE POLICY "Users can view their own transactions"
ON public.reward_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions"
ON public.reward_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies cho referral_codes
CREATE POLICY "Anyone can view referral codes"
ON public.referral_codes FOR SELECT
USING (true);

CREATE POLICY "Users can create their own referral code"
ON public.referral_codes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral code"
ON public.referral_codes FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies cho referral_uses
CREATE POLICY "Users can view their referral uses"
ON public.referral_uses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.referral_codes rc 
    WHERE rc.id = referral_code_id AND rc.user_id = auth.uid()
  )
  OR referred_user_id = auth.uid()
);

CREATE POLICY "System can insert referral uses"
ON public.referral_uses FOR INSERT
WITH CHECK (referred_user_id = auth.uid());

-- Function tặng thưởng
CREATE OR REPLACE FUNCTION public.award_user_reward(
  p_user_id UUID,
  p_action_type TEXT,
  p_currency TEXT,
  p_amount NUMERIC,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction_id UUID;
BEGIN
  -- Tạo hoặc cập nhật balance
  INSERT INTO public.user_balances (user_id, currency, balance, total_earned)
  VALUES (p_user_id, p_currency, p_amount, p_amount)
  ON CONFLICT (user_id, currency)
  DO UPDATE SET 
    balance = user_balances.balance + p_amount,
    total_earned = user_balances.total_earned + p_amount,
    updated_at = now();

  -- Ghi lịch sử giao dịch
  INSERT INTO public.reward_transactions (user_id, action_type, currency, amount, reference_id, reference_type, description)
  VALUES (p_user_id, p_action_type, p_currency, p_amount, p_reference_id, p_reference_type, p_description)
  RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$;

-- Function tạo mã referral
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    v_code := upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM public.referral_codes WHERE code = v_code) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_code;
END;
$$;

-- Trigger tặng thưởng khi đăng ký mới
CREATE OR REPLACE FUNCTION public.reward_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reward_amount NUMERIC;
BEGIN
  -- Lấy số tiền thưởng từ config
  SELECT reward_amount INTO v_reward_amount
  FROM public.reward_config
  WHERE action_type = 'signup' AND reward_currency = 'CAMLY' AND is_active = true
  LIMIT 1;

  -- Mặc định 50 nếu không có config
  v_reward_amount := COALESCE(v_reward_amount, 50);

  -- Tặng thưởng chào mừng
  PERFORM public.award_user_reward(
    NEW.user_id,
    'signup',
    'CAMLY',
    v_reward_amount,
    NULL,
    NULL,
    'Chào mừng thành viên mới!'
  );

  -- Tạo mã referral cho user mới
  INSERT INTO public.referral_codes (user_id, code)
  VALUES (NEW.user_id, public.generate_referral_code())
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_reward_on_signup
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.reward_on_signup();

-- Trigger tặng thưởng khi đăng bài
CREATE OR REPLACE FUNCTION public.reward_on_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reward_amount NUMERIC;
  v_today_earned NUMERIC;
  v_max_per_day NUMERIC;
  v_media_urls JSONB;
BEGIN
  -- Chỉ thưởng cho bài viết mới được duyệt
  IF NEW.moderation_status != 'approved' THEN
    RETURN NEW;
  END IF;

  -- Kiểm tra số tiền đã nhận hôm nay
  SELECT COALESCE(SUM(amount), 0) INTO v_today_earned
  FROM public.reward_transactions
  WHERE user_id = NEW.user_id 
    AND action_type = 'post' 
    AND currency = 'CAMLY'
    AND created_at >= CURRENT_DATE;

  -- Lấy giới hạn mỗi ngày
  SELECT max_per_day INTO v_max_per_day
  FROM public.reward_config
  WHERE action_type = 'post' AND reward_currency = 'CAMLY' AND is_active = true
  LIMIT 1;

  v_max_per_day := COALESCE(v_max_per_day, 50);

  -- Nếu đã đạt giới hạn thì không thưởng thêm
  IF v_today_earned >= v_max_per_day THEN
    RETURN NEW;
  END IF;

  -- Tính số tiền thưởng dựa trên loại bài
  v_media_urls := NEW.media_urls;
  
  IF v_media_urls IS NOT NULL AND jsonb_array_length(v_media_urls) > 0 THEN
    -- Kiểm tra có video không
    IF EXISTS (SELECT 1 FROM jsonb_array_elements_text(v_media_urls) url WHERE url LIKE '%.mp4' OR url LIKE '%.webm') THEN
      v_reward_amount := 10; -- Video
    ELSE
      v_reward_amount := 8; -- Ảnh
    END IF;
  ELSE
    v_reward_amount := 5; -- Text only
  END IF;

  -- Giới hạn không vượt quá max
  v_reward_amount := LEAST(v_reward_amount, v_max_per_day - v_today_earned);

  IF v_reward_amount > 0 THEN
    PERFORM public.award_user_reward(
      NEW.user_id,
      'post',
      'CAMLY',
      v_reward_amount,
      NEW.id,
      'feed_post',
      'Thưởng đăng bài viết'
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_reward_on_post
AFTER INSERT OR UPDATE OF moderation_status ON public.feed_posts
FOR EACH ROW
EXECUTE FUNCTION public.reward_on_post();

-- Trigger tặng thưởng khi quyên góp
CREATE OR REPLACE FUNCTION public.reward_on_donation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reward_percentage NUMERIC;
  v_reward_amount NUMERIC;
  v_min_reward NUMERIC := 10;
BEGIN
  -- Chỉ thưởng khi donation completed và có donor_id
  IF NEW.status != 'completed' OR NEW.donor_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Chỉ xử lý khi status mới chuyển sang completed
  IF OLD IS NOT NULL AND OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- Lấy tỷ lệ thưởng từ config
  SELECT reward_percentage INTO v_reward_percentage
  FROM public.reward_config
  WHERE action_type = 'donation' AND reward_currency = 'CAMLY' AND is_active = true
  LIMIT 1;

  v_reward_percentage := COALESCE(v_reward_percentage, 0.01); -- 1% mặc định

  -- Tính số tiền thưởng (1% giá trị quyên góp, tối thiểu 10 coin)
  v_reward_amount := GREATEST(v_min_reward, NEW.amount * v_reward_percentage);

  PERFORM public.award_user_reward(
    NEW.donor_id,
    'donation',
    'CAMLY',
    v_reward_amount,
    NEW.id,
    'donation',
    'Cảm ơn bạn đã quyên góp!'
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_reward_on_donation
AFTER INSERT OR UPDATE OF status ON public.donations
FOR EACH ROW
EXECUTE FUNCTION public.reward_on_donation();

-- Insert cấu hình mặc định
INSERT INTO public.reward_config (action_type, reward_currency, reward_amount, reward_percentage, max_per_day, is_active) VALUES
('signup', 'CAMLY', 50, NULL, NULL, true),
('post', 'CAMLY', 5, NULL, 50, true),
('donation', 'CAMLY', 10, 0.01, NULL, true),
('referral', 'CAMLY', 30, NULL, NULL, true),
('referred', 'CAMLY', 20, NULL, NULL, true);

-- Enable realtime for reward_transactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.reward_transactions;
