
-- Create withdrawal_requests table
CREATE TABLE public.withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  wallet_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  tx_hash TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own withdrawal requests
CREATE POLICY "Users can view own withdrawals"
  ON public.withdrawal_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own withdrawal requests
CREATE POLICY "Users can create own withdrawals"
  ON public.withdrawal_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all withdrawals
CREATE POLICY "Admins can view all withdrawals"
  ON public.withdrawal_requests
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Admins can update withdrawals
CREATE POLICY "Admins can update withdrawals"
  ON public.withdrawal_requests
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Create transfer_camly function
CREATE OR REPLACE FUNCTION public.transfer_camly(
  p_to_user_id UUID,
  p_amount NUMERIC,
  p_message TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_from_user_id UUID;
  v_from_balance NUMERIC;
  v_to_profile RECORD;
BEGIN
  -- Get authenticated user
  v_from_user_id := auth.uid();
  
  IF v_from_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Chưa đăng nhập');
  END IF;
  
  -- Cannot transfer to self
  IF v_from_user_id = p_to_user_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Không thể chuyển cho chính mình');
  END IF;
  
  -- Validate amount
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Số tiền phải lớn hơn 0');
  END IF;
  
  -- Check if recipient exists
  SELECT * INTO v_to_profile FROM public.profiles WHERE user_id = p_to_user_id;
  IF v_to_profile.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Người nhận không tồn tại');
  END IF;
  
  -- Get sender's balance
  SELECT COALESCE(balance, 0) INTO v_from_balance
  FROM public.user_balances
  WHERE user_id = v_from_user_id AND currency = 'CAMLY';
  
  IF v_from_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'message', 'Số dư không đủ');
  END IF;
  
  -- Deduct from sender
  UPDATE public.user_balances
  SET balance = balance - p_amount, updated_at = now()
  WHERE user_id = v_from_user_id AND currency = 'CAMLY';
  
  -- Add to recipient
  INSERT INTO public.user_balances (user_id, currency, balance, total_earned)
  VALUES (p_to_user_id, 'CAMLY', p_amount, p_amount)
  ON CONFLICT (user_id, currency)
  DO UPDATE SET 
    balance = user_balances.balance + p_amount,
    total_earned = user_balances.total_earned + p_amount,
    updated_at = now();
  
  -- Log sender transaction
  INSERT INTO public.reward_transactions (user_id, action_type, currency, amount, description, status, reference_type, reference_id)
  VALUES (v_from_user_id, 'transfer_out', 'CAMLY', -p_amount, 
    COALESCE(p_message, 'Chuyển Camly Coin cho ' || COALESCE(v_to_profile.full_name, 'người dùng')), 
    'completed', 'user', p_to_user_id::text);
  
  -- Log recipient transaction
  INSERT INTO public.reward_transactions (user_id, action_type, currency, amount, description, status, reference_type, reference_id)
  VALUES (p_to_user_id, 'transfer_in', 'CAMLY', p_amount,
    COALESCE(p_message, 'Nhận Camly Coin'), 
    'completed', 'user', v_from_user_id::text);
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Chuyển thành công!',
    'amount', p_amount,
    'to_user', v_to_profile.full_name
  );
END;
$$;

-- Create request_withdrawal function
CREATE OR REPLACE FUNCTION public.request_withdrawal(
  p_amount NUMERIC,
  p_wallet_address TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_balance NUMERIC;
  v_request_id UUID;
  v_min_withdraw NUMERIC := 10000;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Chưa đăng nhập');
  END IF;
  
  -- Validate amount
  IF p_amount < v_min_withdraw THEN
    RETURN jsonb_build_object('success', false, 'message', 'Số tiền tối thiểu là ' || v_min_withdraw || ' Camly');
  END IF;
  
  -- Validate wallet address
  IF p_wallet_address IS NULL OR LENGTH(p_wallet_address) < 10 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Địa chỉ ví không hợp lệ');
  END IF;
  
  -- Get balance
  SELECT COALESCE(balance, 0) INTO v_balance
  FROM public.user_balances
  WHERE user_id = v_user_id AND currency = 'CAMLY';
  
  IF v_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'message', 'Số dư không đủ');
  END IF;
  
  -- Deduct balance immediately (pending withdrawal)
  UPDATE public.user_balances
  SET balance = balance - p_amount, updated_at = now()
  WHERE user_id = v_user_id AND currency = 'CAMLY';
  
  -- Create withdrawal request
  INSERT INTO public.withdrawal_requests (user_id, amount, wallet_address, status)
  VALUES (v_user_id, p_amount, p_wallet_address, 'pending')
  RETURNING id INTO v_request_id;
  
  -- Log transaction
  INSERT INTO public.reward_transactions (user_id, action_type, currency, amount, description, status, reference_type, reference_id)
  VALUES (v_user_id, 'withdrawal', 'CAMLY', -p_amount, 
    'Yêu cầu rút ' || p_amount || ' Camly về ví ' || LEFT(p_wallet_address, 6) || '...' || RIGHT(p_wallet_address, 4),
    'pending', 'withdrawal', v_request_id::text);
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Yêu cầu rút tiền đã được gửi!',
    'request_id', v_request_id,
    'amount', p_amount
  );
END;
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for withdrawal_requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.withdrawal_requests;
