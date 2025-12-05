import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Plus, Trash2, Coins, Wallet } from "lucide-react";

// Standard ERC20 ABI for balanceOf, name, symbol, decimals
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

interface TokenConfig {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  isCustom?: boolean;
}

interface WalletBalancesProps {
  walletAddress: string | null;
}

// Default tokens to track (on Ethereum mainnet)
const DEFAULT_TOKENS: Omit<TokenConfig, "balance">[] = [
  {
    address: "native",
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  {
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
    name: "Wrapped Bitcoin",
    symbol: "WBTC",
    decimals: 8,
  },
];

export function WalletBalances({ walletAddress }: WalletBalancesProps) {
  const [tokens, setTokens] = useState<TokenConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTokenAddress, setNewTokenAddress] = useState("");
  const [addingToken, setAddingToken] = useState(false);
  const [showAddToken, setShowAddToken] = useState(false);
  const { toast } = useToast();

  const fetchBalances = useCallback(async () => {
    if (!walletAddress) return;

    setLoading(true);
    try {
      // Check if MetaMask is available
      if (!window.ethereum) {
        toast({
          title: "Lỗi",
          description: "Vui lòng cài đặt MetaMask để xem số dư",
          variant: "destructive",
        });
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const updatedTokens: TokenConfig[] = [];

      // Load custom tokens from localStorage
      const savedCustomTokens = localStorage.getItem(`customTokens_${walletAddress}`);
      const customTokens: Omit<TokenConfig, "balance">[] = savedCustomTokens 
        ? JSON.parse(savedCustomTokens) 
        : [];

      const allTokenConfigs = [...DEFAULT_TOKENS, ...customTokens.map(t => ({ ...t, isCustom: true }))];

      for (const tokenConfig of allTokenConfigs) {
        try {
          if (tokenConfig.address === "native") {
            // Fetch ETH balance
            const balance = await provider.getBalance(walletAddress);
            const formattedBalance = ethers.formatEther(balance);
            updatedTokens.push({
              ...tokenConfig,
              balance: parseFloat(formattedBalance).toFixed(6),
            });
          } else {
            // Fetch ERC20 token balance
            const contract = new ethers.Contract(tokenConfig.address, ERC20_ABI, provider);
            const balance = await contract.balanceOf(walletAddress);
            const formattedBalance = ethers.formatUnits(balance, tokenConfig.decimals);
            updatedTokens.push({
              ...tokenConfig,
              balance: parseFloat(formattedBalance).toFixed(6),
            });
          }
        } catch (error) {
          console.error(`Error fetching balance for ${tokenConfig.symbol}:`, error);
          updatedTokens.push({
            ...tokenConfig,
            balance: "0.000000",
          });
        }
      }

      setTokens(updatedTokens);
    } catch (error: any) {
      console.error("Error fetching balances:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải số dư ví",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [walletAddress, toast]);

  useEffect(() => {
    if (walletAddress) {
      fetchBalances();
    }
  }, [walletAddress, fetchBalances]);

  const addCustomToken = async () => {
    if (!newTokenAddress || !walletAddress) return;

    // Validate address format
    if (!ethers.isAddress(newTokenAddress)) {
      toast({
        title: "Lỗi",
        description: "Địa chỉ token không hợp lệ",
        variant: "destructive",
      });
      return;
    }

    // Check if already added
    if (tokens.find(t => t.address.toLowerCase() === newTokenAddress.toLowerCase())) {
      toast({
        title: "Lỗi",
        description: "Token này đã được thêm",
        variant: "destructive",
      });
      return;
    }

    setAddingToken(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(newTokenAddress, ERC20_ABI, provider);

      // Fetch token info
      const [name, symbol, decimals] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
      ]);

      const newToken: Omit<TokenConfig, "balance"> = {
        address: newTokenAddress,
        name,
        symbol,
        decimals: Number(decimals),
        isCustom: true,
      };

      // Save to localStorage
      const savedCustomTokens = localStorage.getItem(`customTokens_${walletAddress}`);
      const customTokens: Omit<TokenConfig, "balance">[] = savedCustomTokens 
        ? JSON.parse(savedCustomTokens) 
        : [];
      customTokens.push(newToken);
      localStorage.setItem(`customTokens_${walletAddress}`, JSON.stringify(customTokens));

      // Fetch balance and add to list
      const balance = await contract.balanceOf(walletAddress);
      const formattedBalance = ethers.formatUnits(balance, decimals);
      
      setTokens(prev => [...prev, {
        ...newToken,
        balance: parseFloat(formattedBalance).toFixed(6),
      }]);

      setNewTokenAddress("");
      setShowAddToken(false);
      toast({
        title: "Thành công",
        description: `Đã thêm token ${symbol}`,
      });
    } catch (error: any) {
      console.error("Error adding token:", error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm token. Vui lòng kiểm tra địa chỉ hợp đồng.",
        variant: "destructive",
      });
    } finally {
      setAddingToken(false);
    }
  };

  const removeCustomToken = (address: string) => {
    if (!walletAddress) return;

    // Remove from localStorage
    const savedCustomTokens = localStorage.getItem(`customTokens_${walletAddress}`);
    if (savedCustomTokens) {
      const customTokens = JSON.parse(savedCustomTokens).filter(
        (t: TokenConfig) => t.address.toLowerCase() !== address.toLowerCase()
      );
      localStorage.setItem(`customTokens_${walletAddress}`, JSON.stringify(customTokens));
    }

    // Remove from state
    setTokens(prev => prev.filter(t => t.address.toLowerCase() !== address.toLowerCase()));
    
    toast({
      title: "Đã xóa",
      description: "Token đã được xóa khỏi danh sách",
    });
  };

  const getTokenIcon = (symbol: string) => {
    switch (symbol) {
      case "ETH":
        return "⟠";
      case "WBTC":
        return "₿";
      default:
        return "🪙";
    }
  };

  if (!walletAddress) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chưa kết nối ví</h3>
          <p className="text-muted-foreground">
            Vui lòng kết nối ví MetaMask để xem số dư token
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-secondary" />
          Số Dư Ví
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddToken(!showAddToken)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Thêm Token
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBalances}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Token Form */}
        {showAddToken && (
          <div className="p-4 border border-border rounded-lg bg-background/50 space-y-3">
            <Label htmlFor="tokenAddress">Địa chỉ hợp đồng Token (ERC20)</Label>
            <div className="flex gap-2">
              <Input
                id="tokenAddress"
                placeholder="0x..."
                value={newTokenAddress}
                onChange={(e) => setNewTokenAddress(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={addCustomToken}
                disabled={addingToken || !newTokenAddress}
              >
                {addingToken ? "Đang thêm..." : "Thêm"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Nhập địa chỉ hợp đồng ERC20 để theo dõi số dư token (ví dụ: Happy Camly Coin)
            </p>
          </div>
        )}

        {/* Token List */}
        {loading && tokens.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map((token) => (
              <div
                key={token.address}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-background/30 hover:bg-background/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-xl">
                    {getTokenIcon(token.symbol)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{token.name}</span>
                      {token.isCustom && (
                        <Badge variant="outline" className="text-xs">
                          Tùy chỉnh
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{token.symbol}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-lg">{token.balance}</div>
                    <div className="text-sm text-muted-foreground">{token.symbol}</div>
                  </div>
                  {token.isCustom && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeCustomToken(token.address)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Wallet Address Display */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Địa chỉ ví: <span className="font-mono">{walletAddress}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
