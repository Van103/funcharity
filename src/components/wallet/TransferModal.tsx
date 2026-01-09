import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { 
  Send, 
  ArrowRight,
  CheckCircle, 
  Loader2,
  Search,
  User,
  AlertCircle
} from "lucide-react";

interface TransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
}

interface UserSearchResult {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export function TransferModal({ open, onOpenChange, currentBalance }: TransferModalProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"search" | "confirm" | "processing" | "success">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [transferResult, setTransferResult] = useState<{ amount: number; to_user: string } | null>(null);

  const MIN_TRANSFER = 100;

  useEffect(() => {
    if (open) {
      setStep("search");
      setSearchQuery("");
      setAmount("");
      setMessage("");
      setSelectedUser(null);
      setSearchResults([]);
      setTransferResult(null);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchUsers(searchQuery.trim());
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchUsers = async (query: string) => {
    setSearching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .neq("user_id", user.id)
        .or(`full_name.ilike.%${query}%`)
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const transferMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) throw new Error("No user selected");
      
      const { data, error } = await supabase.rpc("transfer_camly", {
        p_to_user_id: selectedUser.user_id,
        p_amount: parseFloat(amount),
        p_message: message || null,
      });

      if (error) throw error;
      
      const result = data as { success: boolean; message: string; amount?: number; to_user?: string };
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result;
    },
    onSuccess: (data) => {
      setTransferResult({ amount: data.amount!, to_user: data.to_user || selectedUser?.full_name || "" });
      setStep("success");
      queryClient.invalidateQueries({ queryKey: ["user-balances"] });
      queryClient.invalidateQueries({ queryKey: ["reward-transactions"] });
      toast.success("Chuyển tiền thành công!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể chuyển tiền");
      setStep("search");
    },
  });

  const handleTransfer = () => {
    setStep("processing");
    transferMutation.mutate();
  };

  const isValidAmount = parseFloat(amount) >= MIN_TRANSFER && parseFloat(amount) <= currentBalance;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Chuyển Camly Coin
          </DialogTitle>
          <DialogDescription>
            Chuyển Camly Coin cho bạn bè trong cộng đồng
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <AnimatePresence mode="wait">
            {step === "search" && (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Balance Display */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Số dư hiện tại</span>
                    <Badge variant="secondary" className="text-lg font-bold">
                      🪙 {currentBalance.toLocaleString()} Camly
                    </Badge>
                  </div>
                </div>

                {/* User Search */}
                <div className="space-y-2">
                  <Label htmlFor="search">Tìm người nhận</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Nhập tên người dùng..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Search Results */}
                {searching && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                )}

                {!searching && searchResults.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {searchResults.map((user) => (
                      <button
                        key={user.user_id}
                        onClick={() => setSelectedUser(user)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          selectedUser?.user_id === user.user_id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.full_name || "Người dùng"}</span>
                        {selectedUser?.user_id === user.user_id && (
                          <CheckCircle className="w-5 h-5 text-primary ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Không tìm thấy người dùng</p>
                  </div>
                )}

                {/* Selected User & Amount */}
                {selectedUser && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 pt-4 border-t"
                  >
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={selectedUser.avatar_url || undefined} />
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{selectedUser.full_name || "Người dùng"}</p>
                        <p className="text-xs text-muted-foreground">Người nhận</p>
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                      <Label htmlFor="amount">Số lượng Camly</Label>
                      <Input
                        id="amount"
                        type="number"
                        min={MIN_TRANSFER}
                        max={currentBalance}
                        placeholder="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="text-lg"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Tối thiểu: {MIN_TRANSFER}</span>
                        <span>Tối đa: {currentBalance.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Quick Amounts */}
                    <div className="flex gap-2">
                      {[1000, 5000, 10000].map((val) => (
                        <Button
                          key={val}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setAmount(Math.min(val, currentBalance).toString())}
                          disabled={val > currentBalance}
                        >
                          {val.toLocaleString()}
                        </Button>
                      ))}
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message">Lời nhắn (tùy chọn)</Label>
                      <Input
                        id="message"
                        placeholder="Chúc mừng sinh nhật!"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={100}
                      />
                    </div>

                    <Button
                      onClick={() => setStep("confirm")}
                      disabled={!isValidAmount}
                      className="w-full"
                    >
                      Tiếp tục
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === "confirm" && selectedUser && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-4">
                  <h4 className="font-semibold text-center">Xác nhận chuyển tiền</h4>
                  
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber-500">🪙 {parseInt(amount).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Camly Coin</p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-muted-foreground" />
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={selectedUser.avatar_url || undefined} />
                      <AvatarFallback>
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="text-center">
                    <p className="font-medium">{selectedUser.full_name || "Người dùng"}</p>
                    {message && (
                      <p className="text-sm text-muted-foreground italic mt-1">"{message}"</p>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-start gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                    <p className="text-muted-foreground">
                      Giao dịch không thể hoàn tác sau khi xác nhận.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep("search")} className="flex-1">
                    Quay lại
                  </Button>
                  <Button onClick={handleTransfer} className="flex-1">
                    Xác nhận chuyển
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-8 text-center space-y-4"
              >
                <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
                <div>
                  <h4 className="font-semibold">Đang xử lý...</h4>
                  <p className="text-sm text-muted-foreground">
                    Vui lòng không đóng cửa sổ này
                  </p>
                </div>
              </motion.div>
            )}

            {step === "success" && transferResult && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                </motion.div>
                <div>
                  <h4 className="font-semibold text-lg">Chuyển thành công!</h4>
                  <p className="text-sm text-muted-foreground">
                    Đã chuyển <span className="font-bold text-amber-500">{transferResult.amount.toLocaleString()} Camly</span> cho{" "}
                    <span className="font-medium">{transferResult.to_user}</span>
                  </p>
                </div>
                <Button onClick={() => onOpenChange(false)} className="w-full">
                  Đóng
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
