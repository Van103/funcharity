import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  wallet_address: string;
  status: string;
  tx_hash: string | null;
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
}

export function useWithdrawalRequests() {
  return useQuery({
    queryKey: ["withdrawal-requests"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as WithdrawalRequest[];
    },
  });
}

export function useRequestWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, walletAddress }: { amount: number; walletAddress: string }) => {
      const { data, error } = await supabase.rpc("request_withdrawal", {
        p_amount: amount,
        p_wallet_address: walletAddress,
      });

      if (error) throw error;
      
      const result = data as { success: boolean; message: string; request_id?: string; amount?: number };
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-balances"] });
      queryClient.invalidateQueries({ queryKey: ["reward-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawal-requests"] });
      toast.success("Yêu cầu rút tiền đã được gửi!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể gửi yêu cầu rút tiền");
    },
  });
}
