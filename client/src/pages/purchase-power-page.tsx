import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function PurchasePowerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [powerAmount, setPowerAmount] = useState([100]);
  
  const usdtBalance = parseFloat(user?.usdtBalance || '0');
  const currentHashrate = parseFloat(user?.hashPower || '0');
  
  // Hashrate display helper
  const getHashrateDisplay = (hashrate: number) => {
    if (hashrate >= 1000000) return `${(hashrate / 1000000).toFixed(2)} PH/s`;
    if (hashrate >= 1000) return `${(hashrate / 1000).toFixed(2)} TH/s`;
    return `${hashrate.toFixed(2)} GH/s`;
  };

  const purchasePowerMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest("POST", "/api/purchase-power", { amount });
      return res.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Hashrate Purchased!", 
        description: `Successfully purchased ${getHashrateDisplay(powerAmount[0])}` 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({ 
        title: "Purchase Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const handlePurchase = () => {
    if (powerAmount[0] > usdtBalance) {
      toast({ 
        title: "Insufficient Balance", 
        description: "You don't have enough USDT", 
        variant: "destructive" 
      });
      return;
    }
    purchasePowerMutation.mutate(powerAmount[0]);
  };

  // Calculate new stats after purchase
  const newHashrate = currentHashrate + powerAmount[0];
  const globalHashrate = 584732.50; // Mock global hashrate in GH/s
  const newShare = ((newHashrate / (globalHashrate + powerAmount[0])) * 100).toFixed(4);

  return (
    <div className="mobile-page">
      {/* Header */}
      <div className="mobile-header">
        <div>
          <h1 className="text-lg font-display font-bold text-primary">PURCHASE HASHRATE</h1>
          <p className="text-xs text-muted-foreground font-mono">1 USDT = 1 GH/s</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground font-mono">AVAILABLE</p>
          <p className="text-sm font-display font-bold text-accent">
            ${usdtBalance.toFixed(2)} USDT
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mobile-content">
        {/* Current Stats */}
        <Card className="mobile-card bg-gradient-to-br from-primary/10 to-chart-4/10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground font-mono mb-1">CURRENT HASHRATE</p>
              <p className="text-2xl font-display font-black text-primary">
                {getHashrateDisplay(currentHashrate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-mono mb-1">USDT BALANCE</p>
              <p className="text-2xl font-display font-black text-accent">
                ${usdtBalance.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        {/* Power Slider */}
        <Card className="mobile-card">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-mono text-muted-foreground">SELECT AMOUNT</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={powerAmount[0]}
                  onChange={(e) => {
                    const val = Math.min(Math.floor(usdtBalance), Math.max(1, parseInt(e.target.value) || 1));
                    setPowerAmount([val]);
                  }}
                  className="w-24 text-right font-display font-black text-primary"
                  min={1}
                  max={Math.floor(usdtBalance)}
                  data-testid="input-power-amount"
                />
                <span className="text-sm font-mono text-muted-foreground">USDT</span>
              </div>
            </div>

            <Slider
              value={powerAmount}
              onValueChange={setPowerAmount}
              max={Math.floor(usdtBalance)}
              min={1}
              step={1}
              className="power-slider"
              data-testid="slider-power-amount"
            />

            <div className="flex justify-between text-xs text-muted-foreground font-mono mt-2">
              <span>1 USDT</span>
              <span>UNLIMITED (Max: {Math.floor(usdtBalance).toLocaleString()} USDT)</span>
            </div>
          </div>

          {/* Conversion Display */}
          <div className="p-4 bg-background rounded-xl text-center">
            <p className="text-xs text-muted-foreground font-mono mb-2">YOU WILL RECEIVE</p>
            <div className="flex items-center justify-center space-x-3">
              <i className="fas fa-microchip text-3xl text-primary"></i>
              <p className="text-3xl font-display font-black text-primary glow-green">
                {getHashrateDisplay(powerAmount[0])}
              </p>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-2">
              (1 GH/s = 1000 MH/s | 1 TH/s = 1000 GH/s | 1 PH/s = 1000 TH/s)
            </p>
          </div>
        </Card>

        {/* After Purchase Preview */}
        <Card className="mobile-card">
          <p className="text-sm font-mono text-muted-foreground mb-3">AFTER PURCHASE</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">New Hashrate</span>
              <span className="text-sm font-display font-bold text-primary">
                {getHashrateDisplay(newHashrate)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Mining Share</span>
              <span className="text-sm font-display font-bold text-chart-4">
                {newShare}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Est. Daily Reward</span>
              <span className="text-sm font-display font-bold text-accent">
                ~{(parseFloat(newShare) * 9 / 100).toFixed(4)} GBTC
              </span>
            </div>
          </div>
        </Card>

        {/* Important Info */}
        <Card className="mobile-card bg-warning/10 border-warning/30">
          <div className="flex items-start space-x-3">
            <i className="fas fa-info-circle text-warning mt-1"></i>
            <div className="text-xs text-muted-foreground">
              <p className="mb-2">• No hashrate without deposit</p>
              <p className="mb-2">• 10% referral commission to your upline</p>
              <p className="mb-2">• Hashrate starts mining immediately</p>
              <p>• Unlimited purchase - buy as much as you want!</p>
            </div>
          </div>
        </Card>

        {/* Purchase Button */}
        <Button
          onClick={handlePurchase}
          disabled={purchasePowerMutation.isPending || powerAmount[0] > usdtBalance || powerAmount[0] < 1}
          className="mobile-btn-primary text-lg"
          data-testid="button-confirm-purchase"
        >
          {purchasePowerMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <i className="fas fa-microchip mr-3"></i>
              PURCHASE {getHashrateDisplay(powerAmount[0])}
            </>
          )}
        </Button>

        {/* Min Deposit Warning */}
        {usdtBalance < 10 && (
          <Card className="mobile-card bg-destructive/10 border-destructive/30">
            <div className="flex items-center space-x-3">
              <i className="fas fa-exclamation-triangle text-destructive"></i>
              <p className="text-xs text-destructive">
                Minimum 10 USDT required for activation
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}