import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Gift {
  id: string;
  name: string;
  emoji: string;
  price: number;
  animation?: 'float' | 'burst' | 'rain' | 'spin';
}

interface GiftTransaction {
  id: string;
  sender_id: string;
  receiver_id: string;
  gift_id: string;
  gift_name: string;
  gift_emoji: string;
  gift_price: number;
  stream_id: string | null;
  created_at: string;
}

export function useLiveGifts(streamerId?: string, streamId?: string) {
  const [userCoins, setUserCoins] = useState<number>(0);
  const [totalCoinsReceived, setTotalCoinsReceived] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [recentGifts, setRecentGifts] = useState<GiftTransaction[]>([]);

  // Fetch user's coin balance
  const fetchUserCoins = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_coins')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUserCoins(data.balance);
      } else {
        // Create initial coin record if doesn't exist
        const { data: newData, error: insertError } = await supabase
          .from('user_coins')
          .insert({ user_id: user.id, balance: 100 })
          .select('balance')
          .single();

        if (!insertError && newData) {
          setUserCoins(newData.balance);
        }
      }
    } catch (error) {
      console.error('Error fetching user coins:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch total coins received for the streamer during this stream
  const fetchTotalCoinsReceived = useCallback(async () => {
    if (!streamerId) return;

    try {
      let query = supabase
        .from('gift_transactions')
        .select('gift_price')
        .eq('receiver_id', streamerId);

      if (streamId) {
        query = query.eq('stream_id', streamId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const total = data?.reduce((sum, t) => sum + t.gift_price, 0) || 0;
      setTotalCoinsReceived(total);
    } catch (error) {
      console.error('Error fetching total coins received:', error);
    }
  }, [streamerId, streamId]);

  // Send a gift
  const sendGift = useCallback(async (
    gift: Gift, 
    receiverId: string, 
    currentStreamId?: string
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vui lòng đăng nhập để gửi quà');
        return false;
      }

      if (userCoins < gift.price) {
        toast.error('Không đủ xu! Vui lòng nạp thêm.');
        return false;
      }

      // Deduct coins from sender
      const { error: updateError } = await supabase
        .from('user_coins')
        .update({ 
          balance: userCoins - gift.price
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Update total_spent separately
      const { data: currentData } = await supabase
        .from('user_coins')
        .select('total_spent')
        .eq('user_id', user.id)
        .single();

      if (currentData) {
        await supabase
          .from('user_coins')
          .update({ total_spent: currentData.total_spent + gift.price })
          .eq('user_id', user.id);
      }

      // Add coins to receiver
      const { data: receiverCoins } = await supabase
        .from('user_coins')
        .select('balance, total_earned')
        .eq('user_id', receiverId)
        .maybeSingle();

      if (receiverCoins) {
        await supabase
          .from('user_coins')
          .update({ 
            balance: receiverCoins.balance + gift.price,
            total_earned: receiverCoins.total_earned + gift.price
          })
          .eq('user_id', receiverId);
      } else {
        // Create coin record for receiver if doesn't exist
        await supabase
          .from('user_coins')
          .insert({ 
            user_id: receiverId, 
            balance: gift.price,
            total_earned: gift.price
          });
      }

      // Record the transaction
      const { error: transactionError } = await supabase
        .from('gift_transactions')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          gift_id: gift.id,
          gift_name: gift.name,
          gift_emoji: gift.emoji,
          gift_price: gift.price,
          stream_id: currentStreamId || null
        });

      if (transactionError) throw transactionError;

      // Update local state
      setUserCoins(prev => prev - gift.price);
      
      return true;
    } catch (error) {
      console.error('Error sending gift:', error);
      toast.error('Không thể gửi quà. Vui lòng thử lại.');
      return false;
    }
  }, [userCoins]);

  // Subscribe to real-time gift transactions
  useEffect(() => {
    if (!streamerId) return;

    const channel = supabase
      .channel('gift-transactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'gift_transactions',
          filter: `receiver_id=eq.${streamerId}`
        },
        (payload) => {
          const newGift = payload.new as GiftTransaction;
          setRecentGifts(prev => [newGift, ...prev.slice(0, 9)]);
          setTotalCoinsReceived(prev => prev + newGift.gift_price);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [streamerId]);

  useEffect(() => {
    fetchUserCoins();
    if (streamerId) {
      fetchTotalCoinsReceived();
    }
  }, [fetchUserCoins, fetchTotalCoinsReceived, streamerId]);

  return {
    userCoins,
    totalCoinsReceived,
    isLoading,
    recentGifts,
    sendGift,
    refreshCoins: fetchUserCoins
  };
}
