import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2, Zap, Calculator, Coins, Activity, TrendingUp, Cpu, Award, Gauge, Hash, Wallet, ArrowRight } from "lucide-react";

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
    <div className="mobile-page bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Professional Header */}
      <div className="mobile-header bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b-2 border-orange-500 shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center">
            <Zap className="w-5 h-5 mr-2 text-orange-400" />
            Purchase Hash Power
          </h1>
          <p className="text-xs text-gray-300 mt-0.5">
            1 USDT = 1 GH/s Mining Power
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 mb-1">Your Power</p>
          <p className="text-lg font-bold text-orange-400">
            {getHashrateDisplay(currentHashrate)}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mobile-content space-y-4 px-4 py-4">
        {/* Balance Display Card */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Wallet className="w-5 h-5 text-green-600" />
                <span className="text-xs text-gray-500 font-medium">BALANCE</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">${usdtBalance.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Available USDT</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Cpu className="w-5 h-5 text-orange-600" />
                <span className="text-xs text-gray-500 font-medium">MINING</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{currentHashrate.toFixed(0)}</p>
              <p className="text-xs text-gray-500 mt-1">GH/s Power</p>
            </CardContent>
          </Card>
        </div>

        {/* Purchase Card */}
        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-gray-800">
                  Buy Mining Power
                </CardTitle>
                <CardDescription className="text-xs text-gray-600 mt-1">
                  Increase your hash rate to earn more GBTC
                </CardDescription>
              </div>
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">₿</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 space-y-4">
            {/* Amount Input */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Purchase Amount (USDT)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
                  <Input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter amount..."
                    className="pl-8 pr-4 h-12 text-lg font-semibold bg-gray-50 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    min={1}
                    max={Math.floor(usdtBalance)}
                    data-testid="input-custom-amount"
                  />
                </div>
                <Button 
                  variant="outline"
                  className="h-12 px-4 border-gray-300 hover:border-orange-500 hover:bg-orange-50 font-semibold"
                  onClick={() => setCustomAmount(Math.floor(usdtBalance).toString())}
                >
                  MAX
                </Button>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-500">Min: 1 USDT</span>
                <span className="text-xs text-gray-500">Max: ${Math.floor(usdtBalance)} USDT</span>
              </div>
            </div>

            {/* Calculation Display */}
            {selectedAmount > 0 && (
              <div className="space-y-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">You Pay</p>
                    <p className="text-xl font-bold text-gray-800">${selectedAmount}</p>
                    <p className="text-xs text-gray-500">USDT</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">You Get</p>
                    <p className="text-xl font-bold text-orange-600">{selectedAmount}</p>
                    <p className="text-xs text-gray-500">GH/s</p>
                  </div>
                </div>
                
                <div className="h-px bg-orange-300"></div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">New Total Power:</span>
                    <span className="text-sm font-bold text-gray-800">{getHashrateDisplay(afterPurchaseHashrate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Est. Daily GBTC:</span>
                    <span className="text-sm font-bold text-green-600">~{afterPurchaseRewards.dailyReward}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Purchase Button */}
            <Button
              onClick={handlePurchase}
              disabled={purchasePowerMutation.isPending || selectedAmount > usdtBalance || selectedAmount < 1}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* Error Message */}
            {selectedAmount > usdtBalance && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600 text-center">
                  Insufficient balance. You need ${(selectedAmount - usdtBalance).toFixed(2)} more USDT.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Cards */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Calculator className="w-5 h-5 text-orange-500 mt-0.5" />
              <div className="space-y-2 text-sm text-gray-700">
                <p>• Hash power starts mining immediately</p>
                <p>• Rewards distributed every 1 hour</p>
                <p>• No maintenance fees</p>
                <p>• Permanent ownership</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-orange-50 border border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <Activity className="w-4 h-4 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-1">Important Note</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Your estimated GBTC rewards are based on the current global hashrate. As more miners join and total network hashrate increases, the difficulty increases and rewards are fairly distributed based on each user's hash contribution to the network.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}