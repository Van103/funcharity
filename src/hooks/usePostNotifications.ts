import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function usePostNotifications(currentUserId: string | null) {
  const { toast } = useToast();

  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }, []);

  const fetchUserProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("user_id", userId)
      .single();
    return data;
  }, []);

  const createNotification = useCallback(async (
    userId: string,
    title: string,
    message: string,
    type: "comment_reply" | "donation_received",
    data?: Record<string, any>
  ) => {
    try {
      await supabase.from("notifications").insert({
        user_id: userId,
        title,
        message,
        type,
        is_read: false,
        data: data || {},
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    // Subscribe to new reactions on user's posts
    const reactionChannel = supabase
      .channel('post-reactions-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feed_reactions',
        },
        async (payload) => {
          const reaction = payload.new as any;
          
          // Don't notify for own reactions
          if (reaction.user_id === currentUserId) return;

          // Check if the post belongs to current user
          const { data: post } = await supabase
            .from('feed_posts')
            .select('user_id, content')
            .eq('id', reaction.feed_post_id)
            .single();

          if (post?.user_id === currentUserId) {
            const reactor = await fetchUserProfile(reaction.user_id);
            const reactorName = reactor?.full_name || "Ai đó";
            const postPreview = post.content?.substring(0, 30) || "bài viết của bạn";

            // Play sound
            playNotificationSound();

            // Show toast
            toast({
              title: "Lượt thích mới",
              description: `${reactorName} đã thích ${postPreview}...`,
            });

            // Create persistent notification
            await createNotification(
              currentUserId,
              "Lượt thích mới",
              `${reactorName} đã thích bài viết của bạn`,
              "donation_received", // Using existing type that fits
              { 
                sender_id: reaction.user_id, 
                sender_avatar_url: reactor?.avatar_url,
                post_id: reaction.feed_post_id,
                reaction_type: reaction.reaction_type
              }
            );
          }
        }
      )
      .subscribe();

    // Subscribe to new comments on user's posts
    const commentChannel = supabase
      .channel('post-comments-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feed_comments',
        },
        async (payload) => {
          const comment = payload.new as any;
          
          // Don't notify for own comments
          if (comment.user_id === currentUserId) return;

          // Check if the post belongs to current user
          const { data: post } = await supabase
            .from('feed_posts')
            .select('user_id, content')
            .eq('id', comment.feed_post_id)
            .single();

          if (post?.user_id === currentUserId) {
            const commenter = await fetchUserProfile(comment.user_id);
            const commenterName = commenter?.full_name || "Ai đó";
            const commentPreview = comment.content?.substring(0, 30) || "";

            // Play sound
            playNotificationSound();

            // Show toast
            toast({
              title: "Bình luận mới",
              description: `${commenterName}: ${commentPreview}...`,
            });

            // Create persistent notification
            await createNotification(
              currentUserId,
              "Bình luận mới",
              `${commenterName} đã bình luận: "${commentPreview}..."`,
              "comment_reply",
              { 
                sender_id: comment.user_id, 
                sender_avatar_url: commenter?.avatar_url,
                post_id: comment.feed_post_id,
                comment_id: comment.id
              }
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reactionChannel);
      supabase.removeChannel(commentChannel);
    };
  }, [currentUserId, toast, fetchUserProfile, createNotification, playNotificationSound]);
}
