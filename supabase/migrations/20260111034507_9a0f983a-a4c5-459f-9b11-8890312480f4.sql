-- Drop and recreate check_milestones function with fixed output column names
-- to avoid ambiguity between output columns and variable assignments

DROP FUNCTION IF EXISTS public.check_milestones(uuid);

CREATE OR REPLACE FUNCTION public.check_milestones(p_user_id uuid)
 RETURNS TABLE(out_milestone_type text, out_milestone_value integer, out_is_new boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
        out_milestone_type := 'posts';
        out_milestone_value := v_val;
        out_is_new := true;
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
        out_milestone_type := 'friends';
        out_milestone_value := v_val;
        out_is_new := true;
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
        out_milestone_type := 'coins';
        out_milestone_value := v_val;
        out_is_new := true;
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;

  RETURN;
END;
$function$