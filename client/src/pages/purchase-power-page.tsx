import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2, Zap, Calculator, Coins, Activity, TrendingUp, Cpu, Award, Gauge, Hash } from "lucide-react";

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
  
  // Memoized hashrate display helper
  const getHashrateDisplay = useMemo(() => (hashrate: number) => {
    if (hashrate >= 1000000) return `${(hashrate / 1000000).toFixed(2)} PH/s`;
    if (hashrate >= 1000) return `${(hashrate / 1000).toFixed(2)} TH/s`;
    return `${hashrate.toFixed(2)} GH/s`;
  }, []);

  // Calculate dynamic mining metrics based on network participation
  const calculateDynamicRewards = (userHashrate: number, totalHashrate: number) => {
    // Prevent division by zero
    if (totalHashrate <= 0) {
      return {
        userShare: "0.000000",
        dailyReward: "0.00000000",
        hourlyReward: "0.00000000",
        blockReward: "50",
        earlyBonus: "0"
      };
    }
    
    // User's share of the network
    const userShare = (userHashrate / totalHashrate) * 100;
    
    // Bitcoin-style block generation
    const blocksPerDay = 24; // 24 blocks per day (1 block per hour)
    const baseBlockReward = 50; // Current GBTC block reward
    
    // User's daily reward based on their share of the network
    // This will decrease as more miners join the network
    const dailyReward = (userShare / 100) * blocksPerDay * baseBlockReward;
    
    return {
      userShare: userShare.toFixed(6),
      dailyReward: dailyReward > 0 ? dailyReward.toFixed(8) : "0.00000000",
      hourlyReward: dailyReward > 0 ? (dailyReward / 24).toFixed(8) : "0.00000000",
      blockReward: baseBlockReward.toFixed(2),
      earlyBonus: "0" // Remove early bonus for clarity
    };
  };

  // Memoized calculations for better performance
  const afterPurchaseHashrate = useMemo(() => currentHashrate + selectedAmount, [currentHashrate, selectedAmount]);
  const afterPurchaseTotalHashrate = useMemo(() => totalNetworkHashrate + selectedAmount, [totalNetworkHashrate, selectedAmount]);
  const afterPurchaseRewards = useMemo(() => calculateDynamicRewards(afterPurchaseHashrate, afterPurchaseTotalHashrate), [afterPurchaseHashrate, afterPurchaseTotalHashrate]);

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
    <div className="mobile-page bg-white relative overflow-hidden">
      {/* Bitcoin Pattern Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-50 pointer-events-none"></div>

      {/* Header - Bitcoin Style */}
      <div className="mobile-header bg-gradient-to-r from-orange-500 to-orange-600 border-b-2 border-orange-600 shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center">
            <span className="text-2xl mr-2">₿</span> HASH POWER
          </h1>
          <p className="text-xs text-white/80 font-mono">
            1 USDT = 1 GH/s
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end space-x-1 mb-1">
            <Gauge className="w-3 h-3 text-white" />
            <p className="text-xs text-white/80 font-mono">CURRENT</p>
          </div>
          <p className="text-lg font-bold text-white">
            {getHashrateDisplay(currentHashrate)}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mobile-content">
        {/* Bitcoin Style Balance Card */}
        <Card className="mb-4 bg-white border-2 border-orange-200 shadow-lg">
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {/* USDT Balance */}
              <div className="bg-green-50 rounded-lg p-3 border-2 border-green-300">
                <div className="flex items-center justify-between mb-2">
                  <Coins className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-700 font-mono font-bold">USDT</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  ${usdtBalance.toFixed(2)}
                </p>
                <p className="text-xs text-green-600 mt-1">Available</p>
              </div>
              {/* Current Hashrate */}
              <div className="bg-orange-50 rounded-lg p-3 border-2 border-orange-300">
                <div className="flex items-center justify-between mb-2">
                  <Hash className="w-4 h-4 text-orange-600" />
                  <span className="text-xs text-orange-700 font-mono font-bold">POWER</span>
                </div>
                <p className="text-xl font-bold text-orange-600">
                  {currentHashrate.toFixed(0)}
                </p>
                <p className="text-xs text-orange-600 mt-1">GH/s</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Purchase Card with Bitcoin Theme */}
        <div>
          <Card className="bg-white border-2 border-orange-200 shadow-lg">
            <CardHeader className="pb-4 bg-gradient-to-r from-orange-100 to-orange-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-gray-800">
                    Buy Hash Power
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-600">
                    Invest USDT to increase your mining power
                  </CardDescription>
                </div>
                <div className="text-3xl text-orange-500">
                  ₿
                </div>
              </div>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
              {/* Input Section with Bitcoin Style */}
              <div className="relative">
                <label className="text-sm text-gray-700 mb-2 block font-bold">AMOUNT (USDT)</label>
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="Enter amount..."
                        className="bg-white border-2 border-orange-300 text-gray-800 pl-8 font-mono text-lg font-bold focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        min={1}
                        max={Math.floor(usdtBalance)}
                        data-testid="input-custom-amount"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 text-lg font-bold">$</span>
                    </div>
                    <Button 
                      variant="outline" 
                      className="border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-bold"
                      onClick={() => setCustomAmount(Math.floor(usdtBalance).toString())}
                    >
                      MAX
                    </Button>
                  </div>
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-gray-600 font-semibold">Min: 1 USDT</p>
                    <p className="text-xs text-gray-600 font-semibold">Max: ${Math.floor(usdtBalance)} USDT</p>
                  </div>
                </div>
              </div>

              {/* Calculation Display with Bitcoin Animation */}
              {selectedAmount > 0 && (
                <div>
                  <Card className="bg-orange-50 border-2 border-orange-300">
                    <CardContent className="p-3">
                      <div className="space-y-4">
                        {/* Purchase Summary with Icons */}
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="bg-red-100 border-2 border-red-400 rounded p-2">
                            <p className="text-xs text-red-700 font-bold mb-1">You Pay</p>
                            <p className="text-lg font-bold text-red-600">${selectedAmount}</p>
                            <p className="text-xs text-red-600 font-semibold">USDT</p>
                          </div>
                          <div className="bg-green-100 border-2 border-green-400 rounded p-2">
                            <p className="text-xs text-green-700 font-bold mb-1">You Get</p>
                            <p className="text-lg font-bold text-green-600">
                              {getHashrateDisplay(selectedAmount).split(' ')[0]}
                            </p>
                            <p className="text-xs text-green-600 font-semibold">
                              {getHashrateDisplay(selectedAmount).split(' ')[1]}
                            </p>
                          </div>
                        </div>

                        <div className="h-px bg-orange-300"></div>

                        {/* After Purchase Stats */}
                        <div className="bg-white border-2 border-orange-400 rounded p-3">
                          <p className="text-sm text-orange-600 font-bold mb-2">AFTER PURCHASE</p>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Total Power:</span>
                              <span className="text-sm font-bold text-orange-600">
                                {getHashrateDisplay(afterPurchaseHashrate)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Est. Daily:</span>
                              <span className="text-sm font-bold text-green-600">
                                ~{afterPurchaseRewards.dailyReward} GBTC
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Purchase Button with Bitcoin Glow */}
              <div className="hover:scale-[1.02] active:scale-[0.98] transition-transform">
                <Button
                  onClick={handlePurchase}
                  disabled={purchasePowerMutation.isPending || selectedAmount > usdtBalance || selectedAmount < 1}
                  className="w-full h-12 font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white disabled:opacity-50 shadow-lg"
                  data-testid="button-confirm-purchase"
                >
                  {purchasePowerMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      {selectedAmount > 0 
                        ? `Purchase ${getHashrateDisplay(selectedAmount)}` 
                        : 'Enter Amount'}
                    </>
                  )}
                </Button>
              </div>

              {selectedAmount > usdtBalance && (
                <div className="bg-red-100 border-2 border-red-400 rounded p-2 mt-2">
                  <p className="text-sm text-red-600 font-semibold text-center">
                    Insufficient balance. You need ${(selectedAmount - usdtBalance).toFixed(2)} more USDT.
                  </p>
                </div>
              )}
            </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Card - Bitcoin Style */}
        <Card className="mt-4 bg-orange-50 border-2 border-orange-200">
          <CardContent className="p-3">
            <div className="flex items-start space-x-2">
              <Calculator className="w-4 h-4 text-orange-600 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="text-gray-700">• Hash power starts mining immediately</p>
                <p className="text-gray-700">• Rewards distributed every 1 hour</p>
                <p className="text-gray-700">• No maintenance fees</p>
                <p className="text-gray-700">• Permanent ownership</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Important Note - Bitcoin Warning */}
        <Card className="mt-3 bg-yellow-50 border-2 border-yellow-400">
          <CardContent className="p-3">
            <div className="text-xs space-y-1">
              <p className="font-bold text-yellow-700 flex items-center">
                <Activity className="w-3 h-3 mr-1" />
                * Important Note:
              </p>
              <p className="text-gray-600 leading-relaxed">
                Your estimated GBTC rewards are based on the current global hashrate. As more miners join and total network hashrate increases, the difficulty increases and rewards are fairly distributed based on each user's hash contribution to the network.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}