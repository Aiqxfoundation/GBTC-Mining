import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Bitcoin, Clock, Lock, TrendingUp, Hash, DollarSign, Calendar, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";

export default function BtcMiningPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [stakeAmount, setStakeAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch BTC prices and hashrate info
  const { data: priceData } = useQuery<{
    btcPrice: string;
    hashratePrice: string;
    btcPerHashrate: string;
    timestamp: string;
  }>({
    queryKey: ['/api/btc/prices'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch user's BTC balance
  const { data: balanceData } = useQuery<{
    btcBalance: string;
  }>({
    queryKey: ['/api/btc/balance'],
    enabled: !!user,
  });

  // Fetch user's active stakes
  const { data: stakesData } = useQuery<{
    stakes: any[];
    currentBtcPrice: string;
    totalStaked: string;
    totalDailyRewards: string;
  }>({
    queryKey: ['/api/btc/stakes'],
    enabled: !!user,
  });

  // Create stake mutation
  const stakeMutation = useMutation({
    mutationFn: async (data: { btcAmount: string; useHashrate: boolean }) => {
      const response = await fetch('/api/btc/stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create stake');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Stake Created Successfully",
        description: "Your BTC is now locked for 1 year earning 20% APR",
        className: "bg-green-800 text-white",
      });
      setStakeAmount("");
      queryClient.invalidateQueries({ queryKey: ['/api/btc/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/btc/stakes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Staking Failed",
        description: error.message || "Failed to create stake",
        variant: "destructive",
      });
    },
  });

  const btcBalance = parseFloat(balanceData?.btcBalance || "0");
  const btcPrice = parseFloat(priceData?.btcPrice || "0");
  const userHashPower = parseFloat(user?.hashPower || "0");
  
  const requiredHashrate = parseFloat(stakeAmount || "0") * 1000;
  const dailyReward = parseFloat(stakeAmount || "0") * 0.20 / 365;
  const yearlyReward = parseFloat(stakeAmount || "0") * 0.20;

  const handleStake = () => {
    if (parseFloat(stakeAmount) < 1) {
      toast({
        title: "Invalid Amount",
        description: "Minimum stake is 1 BTC",
        variant: "destructive",
      });
      return;
    }

    if (btcBalance < parseFloat(stakeAmount)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough BTC",
        variant: "destructive",
      });
      return;
    }

    if (userHashPower < requiredHashrate) {
      toast({
        title: "Insufficient Hashrate",
        description: `You need ${requiredHashrate} GH/s but only have ${userHashPower} GH/s`,
        variant: "destructive",
      });
      return;
    }

    stakeMutation.mutate({
      btcAmount: stakeAmount,
      useHashrate: true,
    });
  };

  return (
    <div className="mobile-page bg-[#1a1a1a]">
      {/* Header */}
      <div className="mobile-header bg-[#1a1a1a] border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              onClick={() => setLocation('/wallet')}
              variant="ghost"
              size="sm"
              className="p-0 mr-3"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Button>
            <h1 className="text-lg font-medium text-white">BTC Staking System</h1>
          </div>
          <Badge className="bg-[#f7931a] text-black">20% APR</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="mobile-content">
        {/* Real-time Price Display */}
        <Card className="p-4 bg-gradient-to-r from-[#f7931a]/20 to-[#f7931a]/10 border-[#f7931a]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bitcoin className="w-6 h-6 text-[#f7931a]" />
              <div>
                <p className="text-xs text-gray-400">Bitcoin Price</p>
                <p className="text-xl font-bold text-white">
                  ${priceData?.btcPrice ? Number(priceData.btcPrice).toLocaleString() : '0'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">1 GH/s =</p>
              <p className="text-sm font-medium text-[#f7931a]">
                {priceData?.btcPerHashrate || '0'} BTC
              </p>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="stake" className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-[#242424]">
            <TabsTrigger value="stake" className="data-[state=active]:bg-[#f7931a] data-[state=active]:text-black">
              Create Stake
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-[#f7931a] data-[state=active]:text-black">
              Active Stakes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stake" className="mt-4">
            <Card className="p-4 bg-[#242424] border-gray-800">
              {/* Balance Display */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[#1a1a1a] rounded p-3">
                  <p className="text-xs text-gray-400 mb-1">BTC Balance</p>
                  <p className="text-lg font-bold text-white" data-testid="text-btc-balance">
                    {btcBalance.toFixed(8)} BTC
                  </p>
                </div>
                <div className="bg-[#1a1a1a] rounded p-3">
                  <p className="text-xs text-gray-400 mb-1">Hash Power</p>
                  <p className="text-lg font-bold text-green-400" data-testid="text-hashpower">
                    {userHashPower} GH/s
                  </p>
                </div>
              </div>

              <Separator className="mb-4 bg-gray-700" />

              {/* Staking Form */}
              <div className="space-y-4">
                <div>
                  <Label className="text-white mb-2">Stake Amount (BTC)</Label>
                  <Input
                    type="number"
                    placeholder="Minimum 1 BTC"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    min="1"
                    step="0.1"
                    className="bg-[#1a1a1a] border-gray-700 text-white"
                    data-testid="input-stake-amount"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Required hashrate: {requiredHashrate.toFixed(2)} GH/s
                  </p>
                </div>

                {/* Staking Info */}
                {stakeAmount && parseFloat(stakeAmount) >= 1 && (
                  <div className="bg-[#1a1a1a] rounded p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">Lock Period</span>
                      </div>
                      <span className="text-sm font-medium text-white">1 Year</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-400">APR Rate</span>
                      </div>
                      <span className="text-sm font-medium text-green-400">20%</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#f7931a]" />
                        <span className="text-sm text-gray-400">Daily Rewards</span>
                      </div>
                      <span className="text-sm font-medium text-[#f7931a]">
                        {dailyReward.toFixed(8)} BTC
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-400">Total Return</span>
                      </div>
                      <span className="text-sm font-medium text-blue-400">
                        {yearlyReward.toFixed(8)} BTC
                      </span>
                    </div>
                  </div>
                )}

                {/* Requirements */}
                <div className="bg-yellow-900/20 border border-yellow-600/30 rounded p-3">
                  <p className="text-xs text-yellow-400 mb-2">Requirements:</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li className="flex items-center gap-1">
                      <CheckCircle className={`w-3 h-3 ${btcBalance >= 1 ? 'text-green-400' : 'text-gray-600'}`} />
                      Minimum 1 BTC balance
                    </li>
                    <li className="flex items-center gap-1">
                      <CheckCircle className={`w-3 h-3 ${userHashPower >= 1000 ? 'text-green-400' : 'text-gray-600'}`} />
                      Equal GBTC hashrate (1000 GH/s per BTC)
                    </li>
                    <li className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-yellow-400" />
                      1 year time lock commitment
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={handleStake}
                  className="w-full bg-[#f7931a] hover:bg-[#f7931a]/90 text-black font-medium"
                  disabled={
                    !stakeAmount || 
                    parseFloat(stakeAmount) < 1 ||
                    btcBalance < parseFloat(stakeAmount) ||
                    userHashPower < requiredHashrate ||
                    stakeMutation.isPending
                  }
                  data-testid="button-create-stake"
                >
                  {stakeMutation.isPending ? (
                    "Creating Stake..."
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Lock {stakeAmount || '0'} BTC for 1 Year
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="mt-4">
            <Card className="p-4 bg-[#242424] border-gray-800">
              {stakesData?.stakes && stakesData.stakes.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-medium">Your Stakes</h3>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Total Daily Rewards</p>
                      <p className="text-lg font-bold text-[#f7931a]">
                        {stakesData.totalDailyRewards} BTC
                      </p>
                    </div>
                  </div>
                  
                  {stakesData.stakes.map((stake: any) => (
                    <div key={stake.id} className="bg-[#1a1a1a] rounded p-4 border border-gray-700">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-white font-medium">
                            {parseFloat(stake.btcAmount).toFixed(8)} BTC
                          </p>
                          <p className="text-xs text-gray-400">
                            Staked {new Date(stake.stakedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={`${stake.status === 'active' ? 'bg-green-600' : 'bg-gray-600'} text-white`}>
                          {stake.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-gray-400">Daily Reward</p>
                          <p className="text-[#f7931a] font-medium">
                            {parseFloat(stake.dailyReward).toFixed(8)} BTC
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Total Earned</p>
                          <p className="text-green-400 font-medium">
                            {parseFloat(stake.totalRewardsPaid).toFixed(8)} BTC
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Locked Hashrate</p>
                          <p className="text-white font-medium">
                            {parseFloat(stake.gbtcHashrate).toFixed(2)} GH/s
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Unlock Date</p>
                          <p className="text-white font-medium">
                            {new Date(stake.unlockAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>
                            {Math.floor(
                              ((new Date().getTime() - new Date(stake.stakedAt).getTime()) /
                                (new Date(stake.unlockAt).getTime() - new Date(stake.stakedAt).getTime())) * 100
                            )}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-[#f7931a] h-2 rounded-full"
                            style={{
                              width: `${Math.min(100, Math.floor(
                                ((new Date().getTime() - new Date(stake.stakedAt).getTime()) /
                                  (new Date(stake.unlockAt).getTime() - new Date(stake.stakedAt).getTime())) * 100
                              ))}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="bg-blue-900/20 border border-blue-600/30 rounded p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <p className="text-xs text-blue-400">
                        Daily rewards are paid at 00:00 UTC
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bitcoin className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No active stakes</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Create your first stake to start earning 20% APR
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card className="mt-4 p-4 bg-[#242424] border-gray-800">
          <h3 className="text-[#f7931a] font-medium mb-3 flex items-center gap-2">
            <Hash className="w-4 h-4" />
            How BTC Staking Works
          </h3>
          <div className="space-y-2 text-xs text-gray-400">
            <p>• Stake minimum 1 BTC + equivalent GBTC hashrate</p>
            <p>• Your funds are locked for exactly 1 year</p>
            <p>• Earn 20% APR paid daily in BTC at 00:00 UTC</p>
            <p>• Staked hashrate continues GBTC mining operations</p>
            <p>• BTC price tracked in real-time from market data</p>
            <p>• Rewards compound automatically to your BTC balance</p>
          </div>
        </Card>
      </div>
    </div>
  );
}