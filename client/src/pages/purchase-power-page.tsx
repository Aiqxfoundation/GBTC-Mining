import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2, Zap, TrendingUp, Calculator, Coins, Activity, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PurchasePowerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [customAmount, setCustomAmount] = useState("");
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  
  const usdtBalance = parseFloat(user?.usdtBalance || '0');
  const currentHashrate = parseFloat(user?.hashPower || '0');

  // Fetch global stats for fair calculation
  const { data: globalStats } = useQuery<{ totalHashrate: number; blockHeight: number }>({
    queryKey: ["/api/global-stats"]
  });
  
  const totalNetworkHashrate = globalStats?.totalHashrate || 10000;
  
  // Fair pricing tiers for different investor levels
  const pricingTiers = [
    { 
      name: "Starter", 
      amount: 10, 
      hashrate: 10,
      color: "from-gray-500 to-gray-600",
      icon: "⚡",
      description: "Perfect for beginners"
    },
    { 
      name: "Basic", 
      amount: 100, 
      hashrate: 100,
      color: "from-orange-400 to-orange-500",
      icon: "🔥",
      description: "Most popular choice"
    },
    { 
      name: "Pro", 
      amount: 500, 
      hashrate: 500,
      color: "from-orange-500 to-orange-600",
      icon: "💎",
      description: "Professional miner"
    },
    { 
      name: "Enterprise", 
      amount: 1000, 
      hashrate: 1000,
      color: "from-orange-600 to-orange-700",
      icon: "🚀",
      description: "Maximum efficiency"
    }
  ];

  // Get amount based on selection
  const getSelectedAmount = () => {
    if (selectedTier) {
      const tier = pricingTiers.find(t => t.name === selectedTier);
      return tier?.amount || 0;
    }
    return parseFloat(customAmount) || 0;
  };

  const selectedAmount = getSelectedAmount();
  
  // Hashrate display helper with proper units
  const getHashrateDisplay = (hashrate: number) => {
    if (hashrate >= 1000000) return `${(hashrate / 1000000).toFixed(2)} PH/s`;
    if (hashrate >= 1000) return `${(hashrate / 1000).toFixed(2)} TH/s`;
    return `${hashrate.toFixed(2)} GH/s`;
  };

  // Calculate fair mining metrics
  const calculateMiningMetrics = (hashrate: number) => {
    const newTotalHashrate = totalNetworkHashrate + hashrate;
    const userShare = ((hashrate / newTotalHashrate) * 100).toFixed(4);
    const blocksPerDay = 144; // Bitcoin standard: 144 blocks per day
    const blockReward = 6.25; // Current GBTC block reward
    const dailyReward = (parseFloat(userShare) / 100) * blocksPerDay * blockReward;
    
    return {
      share: userShare,
      dailyReward: dailyReward.toFixed(8),
      hourlyReward: (dailyReward / 24).toFixed(8),
      roi: ((dailyReward * 365 / selectedAmount) * 100).toFixed(2)
    };
  };

  const metrics = calculateMiningMetrics(currentHashrate + selectedAmount);

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
      <div className="max-w-6xl mx-auto space-y-6">
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
          <p className="text-gray-400">Fair mathematics-based hash power distribution</p>
        </motion.div>

        {/* Current Stats */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-orange-500/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-orange-500" />
                    <p className="text-sm text-gray-400">Your Hashrate</p>
                  </div>
                  <p className="text-3xl font-bold text-orange-500">
                    {getHashrateDisplay(currentHashrate)}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Coins className="w-5 h-5 text-green-500" />
                    <p className="text-sm text-gray-400">USDT Balance</p>
                  </div>
                  <p className="text-3xl font-bold text-green-500">
                    ${usdtBalance.toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <p className="text-sm text-gray-400">Network Hashrate</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-500">
                    {getHashrateDisplay(totalNetworkHashrate)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pricing Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl text-orange-500">Select Investment Plan</CardTitle>
              <CardDescription className="text-gray-400">
                1 USDT = 1 GH/s - Fair pricing for all investors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tiers" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                  <TabsTrigger value="tiers" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    Investment Tiers
                  </TabsTrigger>
                  <TabsTrigger value="custom" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    Custom Amount
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="tiers" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {pricingTiers.map((tier) => (
                      <motion.div
                        key={tier.name}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Card 
                          className={`cursor-pointer transition-all ${
                            selectedTier === tier.name 
                              ? 'ring-2 ring-orange-500 bg-gradient-to-br from-orange-900/20 to-orange-800/20' 
                              : 'bg-gray-800 hover:bg-gray-700'
                          }`}
                          onClick={() => {
                            setSelectedTier(tier.name);
                            setCustomAmount("");
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="text-center space-y-3">
                              <div className="text-4xl">{tier.icon}</div>
                              <h3 className="font-bold text-lg text-white">{tier.name}</h3>
                              <p className="text-xs text-gray-400">{tier.description}</p>
                              <div className="space-y-1">
                                <p className="text-2xl font-bold text-orange-500">${tier.amount}</p>
                                <p className="text-sm text-gray-400">{tier.hashrate} GH/s</p>
                              </div>
                              {selectedTier === tier.name && (
                                <Badge className="bg-orange-500 text-white">Selected</Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="custom" className="mt-6">
                  <Card className="bg-gray-800">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-gray-400 mb-2 block">Enter USDT Amount</label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              value={customAmount}
                              onChange={(e) => {
                                setCustomAmount(e.target.value);
                                setSelectedTier(null);
                              }}
                              placeholder="Enter amount..."
                              className="bg-gray-700 border-gray-600 text-white text-lg"
                              min={1}
                              max={Math.floor(usdtBalance)}
                              data-testid="input-custom-amount"
                            />
                            <Button 
                              variant="outline" 
                              className="border-orange-500 text-orange-500"
                              onClick={() => {
                                setCustomAmount(Math.floor(usdtBalance).toString());
                                setSelectedTier(null);
                              }}
                            >
                              Max
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Available: ${usdtBalance.toFixed(2)} USDT
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Mathematical Calculations Display */}
              {selectedAmount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6"
                >
                  <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-orange-500/30">
                    <CardHeader>
                      <CardTitle className="text-lg text-orange-500 flex items-center gap-2">
                        <Calculator className="w-5 h-5" />
                        Investment Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-400">Investment</p>
                            <p className="text-xl font-bold text-white">${selectedAmount} USDT</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Hashrate</p>
                            <p className="text-xl font-bold text-orange-500">{getHashrateDisplay(selectedAmount)}</p>
                          </div>
                        </div>

                        <div className="h-px bg-gray-700"></div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-400">New Total Hashrate</p>
                            <p className="text-lg font-semibold text-white">
                              {getHashrateDisplay(currentHashrate + selectedAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Mining Pool Share</p>
                            <p className="text-lg font-semibold text-green-500">{metrics.share}%</p>
                          </div>
                        </div>

                        <div className="h-px bg-gray-700"></div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Estimated Daily Rewards</span>
                            <span className="text-sm font-semibold text-green-500">~{metrics.dailyReward} GBTC</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Estimated Hourly Rewards</span>
                            <span className="text-sm font-semibold text-green-500">~{metrics.hourlyReward} GBTC</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Annual ROI</span>
                            <span className="text-sm font-semibold text-orange-500">~{metrics.roi}%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Fair Distribution Info */}
              <Card className="mt-6 bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>• Fair distribution: Rewards proportional to hashrate contribution</p>
                      <p>• No hidden fees: 1 USDT = 1 GH/s for all investors</p>
                      <p>• Instant activation: Mining starts immediately after purchase</p>
                      <p>• Transparent system: All miners share rewards based on mathematics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Purchase Button */}
              <div className="mt-6">
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
                      Purchase {selectedAmount > 0 ? getHashrateDisplay(selectedAmount) : 'Hashrate'}
                    </>
                  )}
                </Button>

                {selectedAmount > usdtBalance && (
                  <p className="text-sm text-red-500 text-center mt-2">
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