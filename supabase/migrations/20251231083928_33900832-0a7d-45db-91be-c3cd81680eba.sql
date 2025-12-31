-- Create user_coins table to track coin balance
CREATE TABLE public.user_coins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create gift_transactions table to track all gift history
CREATE TABLE public.gift_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  gift_id TEXT NOT NULL,
  gift_name TEXT NOT NULL,
  gift_emoji TEXT NOT NULL,
  gift_price INTEGER NOT NULL,
  stream_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coin_purchases table to track Stripe purchases
CREATE TABLE public.coin_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  coins_received INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'VND',
  stripe_payment_id TEXT,
  stripe_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.user_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_purchases ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_coins
CREATE POLICY "Users can view their own coin balance"
ON public.user_coins FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coin record"
ON public.user_coins FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coin balance"
ON public.user_coins FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for gift_transactions
CREATE POLICY "Users can view gifts they sent or received"
ON public.gift_transactions FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send gifts"
ON public.gift_transactions FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- RLS policies for coin_purchases
CREATE POLICY "Users can view their own purchases"
ON public.coin_purchases FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchases"
ON public.coin_purchases FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update purchases"
ON public.coin_purchases FOR UPDATE
USING (true);

-- Create function to initialize user coins on registration
CREATE OR REPLACE FUNCTION public.initialize_user_coins()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_coins (user_id, balance)
  VALUES (NEW.id, 100)  -- Give 100 free coins to new users
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create coin record for new users
CREATE TRIGGER on_auth_user_created_coins
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_coins();

-- Enable realtime for gift transactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.gift_transactions;