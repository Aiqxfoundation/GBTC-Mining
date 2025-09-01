import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2, Zap, TrendingUp, Calculator, Coins, Activity, Info, Users, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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

  // Calculate rewards for current hashrate
  const currentRewards = calculateDynamicRewards(currentHashrate, totalNetworkHashrate);
  
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Bitcoin branding */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center animate-pulse">
              <span className="text-white text-2xl">₿</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Hashrate Market
            </h1>
          </div>
          <p className="text-gray-400">Bitcoin-style proportional reward distribution</p>
        </motion.div>

        {/* Network Stats */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-orange-500/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-orange-500" />
                    <p className="text-sm text-gray-400">Your Hashrate</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-500">
                    {getHashrateDisplay(currentHashrate)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {currentRewards.userShare}% of network
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Coins className="w-5 h-5 text-green-500" />
                    <p className="text-sm text-gray-400">USDT Balance</p>
                  </div>
                  <p className="text-2xl font-bold text-green-500">
                    ${usdtBalance.toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <p className="text-sm text-gray-400">Network Hash</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-500">
                    {getHashrateDisplay(totalNetworkHashrate)}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    <p className="text-sm text-gray-400">Active Miners</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-500">
                    {activeMiners}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Purchase Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl text-orange-500">Purchase Hashrate</CardTitle>
              <CardDescription className="text-gray-400">
                1 USDT = 1 GH/s - Fair pricing for everyone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Input Section */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Enter Investment Amount (USDT)</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Enter amount..."
                      className="bg-gray-800 border-gray-700 text-white text-lg"
                      min={1}
                      max={Math.floor(usdtBalance)}
                      data-testid="input-custom-amount"
                    />
                    <Button 
                      variant="outline" 
                      className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
                      onClick={() => setCustomAmount(Math.floor(usdtBalance).toString())}
                    >
                      Max
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Available: ${usdtBalance.toFixed(2)} USDT • Min: 1 USDT • Max: Unlimited
                  </p>
                </div>

                {/* Dynamic Reward Calculation */}
                {selectedAmount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-orange-500/30">
                      <CardHeader>
                        <CardTitle className="text-lg text-orange-500 flex items-center gap-2">
                          <Calculator className="w-5 h-5" />
                          Mining Calculation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Purchase Summary */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-400">You Pay</p>
                              <p className="text-xl font-bold text-white">${selectedAmount} USDT</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">You Get</p>
                              <p className="text-xl font-bold text-orange-500">{getHashrateDisplay(selectedAmount)}</p>
                            </div>
                          </div>

                          <div className="h-px bg-gray-700"></div>

                          {/* After Purchase Stats */}
                          <div>
                            <p className="text-sm font-semibold text-gray-300 mb-2">After Purchase:</p>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-gray-400">Your Total Hashrate</p>
                                <p className="text-lg font-semibold text-white">
                                  {getHashrateDisplay(afterPurchaseHashrate)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Your Network Share</p>
                                <p className="text-lg font-semibold text-green-500">
                                  {afterPurchaseRewards.userShare}%
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="h-px bg-gray-700"></div>

                          {/* Estimated Rewards */}
                          <div>
                            <p className="text-sm font-semibold text-gray-300 mb-2">Estimated Rewards:</p>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-400">Daily GBTC</span>
                                <span className="text-sm font-semibold text-green-500">
                                  ~{afterPurchaseRewards.dailyReward} GBTC
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-400">Hourly GBTC</span>
                                <span className="text-sm font-semibold text-green-500">
                                  ~{afterPurchaseRewards.hourlyReward} GBTC
                                </span>
                              </div>
                              {parseFloat(afterPurchaseRewards.earlyBonus) > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-400">Early Adopter Bonus</span>
                                  <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                                    +{afterPurchaseRewards.earlyBonus}%
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Reward System Info */}
                <Card className="bg-yellow-900/10 border-yellow-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div className="text-sm text-gray-300 space-y-1">
                        <p className="font-semibold text-yellow-500">Reward System</p>
                        <p>• Rewards decrease as more miners join (like real Bitcoin)</p>
                        <p>• Your share = Your Hashrate ÷ Total Network Hashrate</p>
                        <p>• Early miners get bonus rewards while network grows</p>
                        <p>• All miners share 900 GBTC daily (144 blocks × 6.25 GBTC)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Purchase Button */}
                <Button
                  onClick={handlePurchase}
                  disabled={purchasePowerMutation.isPending || selectedAmount > usdtBalance || selectedAmount < 1}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50"
                  data-testid="button-confirm-purchase"
                >
                  {purchasePowerMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Processing Transaction...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      {selectedAmount > 0 
                        ? `Purchase ${getHashrateDisplay(selectedAmount)}` 
                        : 'Enter Amount to Purchase'}
                    </>
                  )}
                </Button>

                {selectedAmount > usdtBalance && (
                  <p className="text-sm text-red-500 text-center">
                    Insufficient balance. You need ${(selectedAmount - usdtBalance).toFixed(2)} more USDT.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}