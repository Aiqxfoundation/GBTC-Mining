import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2, Zap, Calculator, Coins } from "lucide-react";

export default function PurchasePowerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [customAmount, setCustomAmount] = useState("");
  
  const usdtBalance = parseFloat(user?.usdtBalance || '0');
  const currentHashrate = parseFloat(user?.hashPower || '0');

  // Fetch global stats for fair calculation
  const { data: globalStats } = useQuery<{ totalHashrate: number; blockHeight: number; activeMiners: number }>({
    queryKey: ["/api/global-stats"]
  });
  
  const totalNetworkHashrate = globalStats?.totalHashrate || 10000;
  const activeMiners = globalStats?.activeMiners || 1;
  
  const selectedAmount = parseFloat(customAmount) || 0;
  
  // Hashrate display helper with proper units
  const getHashrateDisplay = (hashrate: number) => {
    if (hashrate >= 1000000) return `${(hashrate / 1000000).toFixed(2)} PH/s`;
    if (hashrate >= 1000) return `${(hashrate / 1000).toFixed(2)} TH/s`;
    return `${hashrate.toFixed(2)} GH/s`;
  };

  // Calculate dynamic mining metrics based on network participation
  const calculateDynamicRewards = (userHashrate: number, totalHashrate: number) => {
    // User's share of the network
    const userShare = (userHashrate / totalHashrate) * 100;
    
    // Bitcoin-style block generation
    const blocksPerDay = 144; // Standard: 144 blocks per day (every 10 minutes)
    const baseBlockReward = 6.25; // Current GBTC block reward
    
    // Early stage bonus to encourage growth (gradually decreases as network grows)
    const earlyAdopterMultiplier = Math.max(1, 2 - (activeMiners / 100));
    const adjustedBlockReward = baseBlockReward * earlyAdopterMultiplier;
    
    // User's daily reward based on their share
    const dailyReward = (userShare / 100) * blocksPerDay * adjustedBlockReward;
    
    return {
      userShare: userShare.toFixed(6),
      dailyReward: dailyReward.toFixed(8),
      hourlyReward: (dailyReward / 24).toFixed(8),
      blockReward: adjustedBlockReward.toFixed(2),
      earlyBonus: ((earlyAdopterMultiplier - 1) * 100).toFixed(0)
    };
  };

  // Calculate rewards after purchase
  const afterPurchaseHashrate = currentHashrate + selectedAmount;
  const afterPurchaseTotalHashrate = totalNetworkHashrate + selectedAmount;
  const afterPurchaseRewards = calculateDynamicRewards(afterPurchaseHashrate, afterPurchaseTotalHashrate);

  const purchasePowerMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest("POST", "/api/purchase-power", { amount });
      return res.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Hashrate Purchased Successfully!", 
        description: `You've added ${getHashrateDisplay(selectedAmount)} to your mining power` 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/global-stats"] });
      setLocation("/mining");
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
    if (selectedAmount > usdtBalance) {
      toast({ 
        title: "Insufficient Balance", 
        description: `You need ${selectedAmount} USDT but only have ${usdtBalance.toFixed(2)} USDT`, 
        variant: "destructive" 
      });
      return;
    }
    if (selectedAmount < 1) {
      toast({ 
        title: "Invalid Amount", 
        description: "Minimum purchase is 1 USDT", 
        variant: "destructive" 
      });
      return;
    }
    purchasePowerMutation.mutate(selectedAmount);
  };

  return (
    <div className="mobile-page bg-black">
      {/* Header */}
      <div className="mobile-header bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div>
          <h1 className="text-lg font-medium text-white">Purchase Hash Power</h1>
          <p className="text-xs text-gray-500">1 USDT = 1 GH/s</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Your Hashrate</p>
          <p className="text-sm font-medium text-[#f7931a]">
            {getHashrateDisplay(currentHashrate)}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mobile-content">
        {/* Balance Card */}
        <Card className="p-4 mb-4 bg-gray-950 border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Coins className="w-4 h-4 text-green-500" />
                <p className="text-xs text-gray-500">Available Balance</p>
              </div>
              <p className="text-2xl font-bold text-white">
                ${usdtBalance.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">USDT</p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end space-x-2 mb-1">
                <Zap className="w-4 h-4 text-[#f7931a]" />
                <p className="text-xs text-gray-500">Current Power</p>
              </div>
              <p className="text-xl font-semibold text-[#f7931a]">
                {getHashrateDisplay(currentHashrate)}
              </p>
            </div>
          </div>
        </Card>

        {/* Purchase Card */}
        <Card className="bg-gray-950 border-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-white">Buy Hash Power</CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Invest USDT to increase your mining power
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Input Section */}
              <div>
                <label className="text-xs text-gray-500 mb-2 block">Amount (USDT)</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter amount..."
                    className="bg-black border-gray-800 text-white"
                    min={1}
                    max={Math.floor(usdtBalance)}
                    data-testid="input-custom-amount"
                  />
                  <Button 
                    variant="outline" 
                    className="border-gray-700 text-gray-400 hover:bg-gray-900"
                    onClick={() => setCustomAmount(Math.floor(usdtBalance).toString())}
                  >
                    Max
                  </Button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Min: 1 USDT • Max: ${Math.floor(usdtBalance)} USDT
                </p>
              </div>

              {/* Calculation Display */}
              {selectedAmount > 0 && (
                <Card className="bg-black border-gray-800">
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      {/* Purchase Summary */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">You Pay</p>
                          <p className="text-base font-semibold text-white">${selectedAmount} USDT</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">You Get</p>
                          <p className="text-base font-semibold text-[#f7931a]">{getHashrateDisplay(selectedAmount)}</p>
                        </div>
                      </div>

                      <div className="h-px bg-gray-800"></div>

                      {/* After Purchase */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2">After Purchase</p>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-600">Total Hashrate</span>
                            <span className="text-xs font-medium text-white">
                              {getHashrateDisplay(afterPurchaseHashrate)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-600">Est. Daily GBTC</span>
                            <span className="text-xs font-medium text-green-500">
                              ~{afterPurchaseRewards.dailyReward}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Purchase Button */}
              <Button
                onClick={handlePurchase}
                disabled={purchasePowerMutation.isPending || selectedAmount > usdtBalance || selectedAmount < 1}
                className="w-full h-12 font-medium bg-[#f7931a] hover:bg-[#e88309] text-black disabled:opacity-50"
                data-testid="button-confirm-purchase"
              >
                {purchasePowerMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    {selectedAmount > 0 
                      ? `Purchase ${getHashrateDisplay(selectedAmount)}` 
                      : 'Enter Amount'}
                  </>
                )}
              </Button>

              {selectedAmount > usdtBalance && (
                <p className="text-xs text-red-500 text-center">
                  Insufficient balance. You need ${(selectedAmount - usdtBalance).toFixed(2)} more USDT.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-4 p-4 bg-gray-950 border-gray-800">
          <div className="flex items-start space-x-3">
            <Calculator className="w-4 h-4 text-gray-500 mt-0.5" />
            <div className="space-y-2 text-xs text-gray-500">
              <p>• Hash power starts mining immediately</p>
              <p>• Rewards distributed every 10 minutes</p>
              <p>• No maintenance fees</p>
              <p>• Permanent ownership</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}