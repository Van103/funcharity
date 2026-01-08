-- Fix 1: Restrict volunteer_profiles RLS policy - require authentication
DROP POLICY IF EXISTS "Anyone can view volunteer profiles" ON public.volunteer_profiles;

-- Only authenticated users can view volunteer profiles
CREATE POLICY "Authenticated users can view volunteer profiles"
ON public.volunteer_profiles FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Fix 2: Add auth.uid() validation to claim_rewards function
CREATE OR REPLACE FUNCTION public.claim_rewards(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_claimable_amount NUMERIC;
  v_result jsonb;
BEGIN
  -- SECURITY: Verify caller is authenticated
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Unauthorized: Not authenticated',
      'claimed_amount', 0
    );
  END IF;
  
  -- SECURITY: Verify caller is claiming their own rewards
  IF auth.uid() != p_user_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Forbidden: Cannot claim rewards for another user',
      'claimed_amount', 0
    );
  END IF;

  -- Get current claimable balance
  SELECT COALESCE(balance, 0) INTO v_claimable_amount
  FROM public.user_balances
  WHERE user_id = p_user_id AND currency = 'CAMLY';

  IF v_claimable_amount <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Không có xu nào để nhận',
      'claimed_amount', 0
    );
  END IF;

  -- Update balance: move to claimed (total_withdrawn tracks claimed)
  UPDATE public.user_balances
  SET 
    balance = 0,
    total_withdrawn = total_withdrawn + v_claimable_amount,
    updated_at = now()
  WHERE user_id = p_user_id AND currency = 'CAMLY';

  -- Log the claim transaction
  INSERT INTO public.reward_transactions (
    user_id, action_type, currency, amount, description, status
  ) VALUES (
    p_user_id, 'claim', 'CAMLY', v_claimable_amount, 'Nhận phần thưởng về tài khoản', 'completed'
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Đã nhận thành công!',
    'claimed_amount', v_claimable_amount
  );
END;
$$;

-- Fix 3: Add auth.uid() validation to check_milestones function
CREATE OR REPLACE FUNCTION public.check_milestones(p_user_id uuid)
RETURNS TABLE(milestone_type text, milestone_value integer, is_new boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_posts_count INTEGER;
  v_friends_count INTEGER;
  v_total_camly NUMERIC;
  v_milestone_values INTEGER[] := ARRAY[10, 50, 100, 500, 1000, 5000, 10000];
  v_coin_milestones INTEGER[] := ARRAY[10000, 100000, 500000, 1000000, 5000000, 10000000];
  v_val INTEGER;
BEGIN
  -- SECURITY: Verify caller is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Not authenticated';
  END IF;
  
  -- SECURITY: Verify caller is checking their own milestones
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Forbidden: Cannot check milestones for another user';
  END IF;

  -- Count posts
  SELECT COUNT(*) INTO v_posts_count
  FROM public.feed_posts
  WHERE feed_posts.user_id = p_user_id AND moderation_status = 'approved';

  -- Count friends
  SELECT COUNT(*) INTO v_friends_count
  FROM public.friendships
  WHERE (friendships.user_id = p_user_id OR friend_id = p_user_id) AND status = 'accepted';

  -- Get total Camly earned
  SELECT COALESCE(total_earned, 0) INTO v_total_camly
  FROM public.user_balances
  WHERE user_balances.user_id = p_user_id AND currency = 'CAMLY';

  -- Check posts milestones
  FOREACH v_val IN ARRAY v_milestone_values LOOP
    IF v_posts_count >= v_val THEN
      INSERT INTO public.milestone_achievements (user_id, milestone_type, milestone_value)
      VALUES (p_user_id, 'posts', v_val)
      ON CONFLICT (user_id, milestone_type, milestone_value) DO NOTHING;
      
      IF FOUND THEN
        milestone_type := 'posts';
        milestone_value := v_val;
        is_new := true;
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;

  -- Check friends milestones
  FOREACH v_val IN ARRAY v_milestone_values LOOP
    IF v_friends_count >= v_val THEN
      INSERT INTO public.milestone_achievements (user_id, milestone_type, milestone_value)
      VALUES (p_user_id, 'friends', v_val)
      ON CONFLICT (user_id, milestone_type, milestone_value) DO NOTHING;
      
      IF FOUND THEN
        milestone_type := 'friends';
        milestone_value := v_val;
        is_new := true;
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;

  -- Check coin milestones
  FOREACH v_val IN ARRAY v_coin_milestones LOOP
    IF v_total_camly >= v_val THEN
      INSERT INTO public.milestone_achievements (user_id, milestone_type, milestone_value)
      VALUES (p_user_id, 'coins', v_val)
      ON CONFLICT (user_id, milestone_type, milestone_value) DO NOTHING;
      
      IF FOUND THEN
        milestone_type := 'coins';
        milestone_value := v_val;
        is_new := true;
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;

  RETURN;
END;
$$;