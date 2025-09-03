import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2, Zap, Calculator, Coins, Activity, TrendingUp, Cpu, Award } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="mobile-page bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      {/* Bitcoin Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: -100
            }}
            animate={{
              y: window.innerHeight + 100,
              rotate: 360
            }}
            transition={{
              duration: 15 + i * 3,
              repeat: Infinity,
              delay: i * 2,
              ease: "linear"
            }}
          >
            <div className="text-6xl font-bold text-orange-500">₿</div>
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="mobile-header bg-black/80 backdrop-blur-lg border-b border-primary/20">
        <div>
          <h1 className="text-xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            Purchase Hash Power
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            1 USDT = 1 GH/s
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end space-x-1 mb-1">
            <Activity className="w-3 h-3 text-primary animate-pulse" />
            <p className="text-xs text-muted-foreground font-mono">Your Hashrate</p>
          </div>
          <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            {getHashrateDisplay(currentHashrate)}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mobile-content">
        {/* Balance Card with Bitcoin Glow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-4 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 shadow-lg shadow-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
            <div className="relative z-10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-success/20">
                      <Coins className="w-4 h-4 text-success" />
                    </div>
                    <p className="text-xs text-muted-foreground font-mono uppercase">Available Balance</p>
                  </div>
                  <motion.p 
                    className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-success to-chart-3"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ${usdtBalance.toFixed(2)}
                  </motion.p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">USDT</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end space-x-2 mb-2">
                    <p className="text-xs text-muted-foreground font-mono uppercase">Current Power</p>
                    <div className="p-1.5 rounded-lg bg-primary/20">
                      <Zap className="w-4 h-4 text-primary animate-pulse" />
                    </div>
                  </div>
                  <motion.p 
                    className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >
                    {getHashrateDisplay(currentHashrate)}
                  </motion.p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Purchase Card with Bitcoin Theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-black to-gray-900 border-primary/20 shadow-lg shadow-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
            <CardHeader className="pb-4 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                    Buy Hash Power
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-1">
                    Invest USDT to increase your mining power
                  </CardDescription>
                </div>
                <div className="p-2 rounded-xl bg-primary/10">
                  <Cpu className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
            <div className="space-y-4">
              {/* Input Section with Bitcoin Style */}
              <div className="relative">
                <label className="text-xs text-muted-foreground mb-2 block font-mono uppercase">Amount (USDT)</label>
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="Enter amount..."
                        className="bg-black/50 border-primary/30 text-white pl-8 font-mono focus:border-primary focus:ring-2 focus:ring-primary/20"
                        min={1}
                        max={Math.floor(usdtBalance)}
                        data-testid="input-custom-amount"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-sm">$</span>
                    </div>
                    <Button 
                      variant="outline" 
                      className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary font-mono"
                      onClick={() => setCustomAmount(Math.floor(usdtBalance).toString())}
                    >
                      MAX
                    </Button>
                  </div>
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-muted-foreground font-mono">Min: 1 USDT</p>
                    <p className="text-xs text-muted-foreground font-mono">Max: ${Math.floor(usdtBalance)} USDT</p>
                  </div>
                </div>
              </div>

              {/* Calculation Display with Bitcoin Animation */}
              {selectedAmount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 shadow-lg shadow-primary/10">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {/* Purchase Summary with Icons */}
                        <div className="grid grid-cols-2 gap-3">
                          <motion.div 
                            className="bg-black/50 rounded-lg p-3 border border-destructive/20"
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs text-muted-foreground font-mono">You Pay</p>
                              <TrendingUp className="w-3 h-3 text-destructive" />
                            </div>
                            <p className="text-lg font-bold text-white font-mono">${selectedAmount}</p>
                            <p className="text-xs text-muted-foreground">USDT</p>
                          </motion.div>
                          <motion.div 
                            className="bg-black/50 rounded-lg p-3 border border-success/20"
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs text-muted-foreground font-mono">You Get</p>
                              <Award className="w-3 h-3 text-success" />
                            </div>
                            <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent font-mono">
                              {getHashrateDisplay(selectedAmount).split(' ')[0]}
                            </p>
                            <p className="text-xs text-primary">
                              {getHashrateDisplay(selectedAmount).split(' ')[1]}
                            </p>
                          </motion.div>
                        </div>

                        <div className="relative">
                          <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="px-2 bg-background text-xs text-muted-foreground">•</span>
                          </div>
                        </div>

                        {/* After Purchase Stats */}
                        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-3 border border-primary/20">
                          <p className="text-xs text-primary font-mono mb-3 uppercase">After Purchase</p>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-1">
                                <Cpu className="w-3 h-3 text-primary" />
                                <span className="text-xs text-muted-foreground font-mono">Total Hashrate</span>
                              </div>
                              <span className="text-sm font-bold text-white font-mono">
                                {getHashrateDisplay(afterPurchaseHashrate)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-1">
                                <Activity className="w-3 h-3 text-success animate-pulse" />
                                <span className="text-xs text-muted-foreground font-mono">Est. Daily GBTC*</span>
                              </div>
                              <motion.span 
                                className="text-sm font-bold text-success font-mono"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                ~{afterPurchaseRewards.dailyReward}
                              </motion.span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Purchase Button with Bitcoin Glow */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handlePurchase}
                  disabled={purchasePowerMutation.isPending || selectedAmount > usdtBalance || selectedAmount < 1}
                  className="w-full h-14 font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-black disabled:opacity-50 shadow-lg shadow-primary/30 transition-all font-mono uppercase"
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
              </motion.div>

              {selectedAmount > usdtBalance && (
                <p className="text-xs text-red-500 text-center">
                  Insufficient balance. You need ${(selectedAmount - usdtBalance).toFixed(2)} more USDT.
                </p>
              )}
            </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Card with Bitcoin Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="mt-4 bg-gradient-to-br from-black to-gray-900 border-primary/20 shadow-lg shadow-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calculator className="w-4 h-4 text-primary" />
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p className="flex items-center"><span className="text-primary mr-1">•</span> Hash power starts mining immediately</p>
                  <p className="flex items-center"><span className="text-primary mr-1">•</span> Rewards distributed every 1 hour</p>
                  <p className="flex items-center"><span className="text-primary mr-1">•</span> No maintenance fees</p>
                  <p className="flex items-center"><span className="text-primary mr-1">•</span> Permanent ownership</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Important Note with Bitcoin Warning Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="mt-3 bg-gradient-to-r from-warning/10 to-warning/5 border-warning/30 shadow-lg shadow-warning/10">
            <CardContent className="p-3">
              <div className="text-xs space-y-1">
                <p className="font-bold text-warning flex items-center">
                  <Activity className="w-3 h-3 mr-1 animate-pulse" />
                  * Important Note:
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Your estimated GBTC rewards are based on the current global hashrate. As more miners join and total network hashrate increases, the difficulty increases and rewards are fairly distributed based on each user's hash contribution to the network.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}