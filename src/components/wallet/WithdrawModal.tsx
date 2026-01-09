import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Coins, 
  Wallet, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Info,
  ExternalLink
} from "lucide-react";
import { useRequestWithdrawal, useWithdrawalRequests } from "@/hooks/useWithdrawal";

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress: string | null;
  currentBalance: number;
  onWithdrawSuccess?: () => void;
}

export function WithdrawModal({ open, onOpenChange, walletAddress, currentBalance, onWithdrawSuccess }: WithdrawModalProps) {
  const [step, setStep] = useState<"input" | "confirm" | "processing" | "success">("input");
  const [amount, setAmount] = useState("");
  const { data: withdrawalHistory } = useWithdrawalRequests();
  const requestWithdrawal = useRequestWithdrawal();

  // Conversion rate: 1 Camly Coin = 0.0001 MATIC (example)
  const COIN_TO_MATIC_RATE = 0.0001;
  const MIN_WITHDRAW = 10000;
  const MAX_WITHDRAW = 1000000;

  useEffect(() => {
    if (open) {
      setStep("input");
      setAmount("");
    }
  }, [open]);

  const maticAmount = parseFloat(amount || "0") * COIN_TO_MATIC_RATE;
  const isValidAmount = parseFloat(amount) >= MIN_WITHDRAW && parseFloat(amount) <= Math.min(MAX_WITHDRAW, currentBalance);

  const handleWithdraw = async () => {
    if (!walletAddress) return;

    setStep("processing");
    
    try {
      await requestWithdrawal.mutateAsync({
        amount: parseFloat(amount),
        walletAddress,
      });
      
      setStep("success");
      onWithdrawSuccess?.();
    } catch (error) {
      setStep("input");
    }
  };

  const shortenAddress = (addr: string) => `${addr.slice(0, 10)}...${addr.slice(-8)}`;

  const pendingWithdrawals = withdrawalHistory?.filter(w => w.status === "pending" || w.status === "processing") || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            Rút Camly Coin
          </DialogTitle>
          <DialogDescription>
            Chuyển đổi Camly Coin thành crypto và rút về ví của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <AnimatePresence mode="wait">
            {step === "input" && (
              <motion.div
                key="input"
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

                {/* Pending Withdrawals Warning */}
                {pendingWithdrawals.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-start gap-2 text-sm">
                      <Info className="w-4 h-4 text-amber-500 mt-0.5" />
                      <p className="text-muted-foreground">
                        Bạn có {pendingWithdrawals.length} yêu cầu rút tiền đang chờ xử lý.
                      </p>
                    </div>
                  </div>
                )}

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Số lượng muốn rút</Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      min={MIN_WITHDRAW}
                      max={Math.min(MAX_WITHDRAW, currentBalance)}
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pr-20 text-lg"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      Camly
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Tối thiểu: {MIN_WITHDRAW.toLocaleString()} Camly</span>
                    <span>Tối đa: {Math.min(MAX_WITHDRAW, currentBalance).toLocaleString()} Camly</span>
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex gap-2">
                  {[10000, 50000, 100000].map((val) => (
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setAmount(Math.min(currentBalance, MAX_WITHDRAW).toString())}
                    disabled={currentBalance < MIN_WITHDRAW}
                  >
                    Tất cả
                  </Button>
                </div>

                {/* Conversion Preview */}
                {amount && parseFloat(amount) > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>🪙 {parseInt(amount).toLocaleString()}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-primary">≈ {maticAmount.toFixed(4)} MATIC</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tỷ giá: 10,000 Camly = 1 MATIC
                    </p>
                  </motion.div>
                )}

                {/* Wallet Address */}
                {walletAddress ? (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 text-sm">
                      <Wallet className="w-4 h-4 text-green-500" />
                      <span className="text-muted-foreground">Ví nhận:</span>
                      <code className="font-mono text-xs">{shortenAddress(walletAddress)}</code>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      Vui lòng kết nối ví trước
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  onClick={() => setStep("confirm")}
                  disabled={!isValidAmount || !walletAddress}
                  className="w-full"
                >
                  Tiếp tục
                </Button>
              </motion.div>
            )}

            {step === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
                  <h4 className="font-semibold">Xác nhận rút tiền</h4>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Số lượng</span>
                    <span className="font-semibold">🪙 {parseInt(amount).toLocaleString()} Camly</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nhận được</span>
                    <span className="font-semibold text-primary">{maticAmount.toFixed(4)} MATIC</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ví nhận</span>
                    <code className="font-mono text-xs">{shortenAddress(walletAddress!)}</code>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-start gap-2 text-sm">
                    <Info className="w-4 h-4 text-amber-500 mt-0.5" />
                    <p className="text-muted-foreground">
                      Yêu cầu sẽ được xử lý trong vòng 24-48 giờ. Số dư sẽ bị trừ ngay khi gửi yêu cầu.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep("input")} className="flex-1">
                    Quay lại
                  </Button>
                  <Button onClick={handleWithdraw} className="flex-1">
                    Xác nhận rút
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

            {step === "success" && (
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
                  <h4 className="font-semibold text-lg">Yêu cầu đã được gửi!</h4>
                  <p className="text-sm text-muted-foreground">
                    {parseInt(amount).toLocaleString()} Camly sẽ được chuyển đổi thành {maticAmount.toFixed(4)} MATIC và gửi về ví của bạn.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => window.open(`https://polygonscan.com/address/${walletAddress}`, "_blank")}
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Xem trên PolygonScan
                </Button>
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
