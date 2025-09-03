import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Bitcoin, Clock, Lock, TrendingUp, Hash, DollarSign, Calendar, CheckCircle, Zap, Trophy, Gem, Crown, Cpu } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

// Custom Slider with Timer Icon Handle
const TimerSlider = ({ value, onValueChange, min, max, step, className }: any) => (
  <SliderPrimitive.Root
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    value={value}
    onValueChange={onValueChange}
    min={min}
    max={max}
    step={step}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-700">
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-yellow-500 to-yellow-600" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-yellow-500 bg-black shadow-lg ring-offset-background transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
      <Clock className="h-4 w-4 text-yellow-500" />
    </SliderPrimitive.Thumb>
  </SliderPrimitive.Root>
);

// Custom Slider with BTC Icon Handle
const BtcSlider = ({ value, onValueChange, min, max, step, className }: any) => (
  <SliderPrimitive.Root
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    value={value}
    onValueChange={onValueChange}
    min={min}
    max={max}
    step={step}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-700">
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-[#f7931a] to-[#ffb347]" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7931a] shadow-lg ring-offset-background transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
      <span className="text-black font-bold text-lg">₿</span>
    </SliderPrimitive.Thumb>
  </SliderPrimitive.Root>
);

// Custom Slider with Hashrate Icon Handle
const HashSlider = ({ value, onValueChange, min, max, step, className, disabled }: any) => (
  <SliderPrimitive.Root
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    value={value}
    onValueChange={onValueChange}
    min={min}
    max={max}
    step={step}
    disabled={disabled}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-700">
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-green-500 to-green-600" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-green-500 bg-black shadow-lg ring-offset-background transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
      <Cpu className="h-4 w-4 text-green-500" />
    </SliderPrimitive.Thumb>
  </SliderPrimitive.Root>
);

// Function to calculate APR based on lock time (months)
const calculateAPR = (months: number): number => {
  // Linear interpolation: 5% at 3 months to 65% at 120 months (10 years)
  // APR = 5 + (months - 3) * (65 - 5) / (120 - 3)
  const minMonths = 3;
  const maxMonths = 120;
  const minAPR = 5;
  const maxAPR = 65;
  
  const clampedMonths = Math.max(minMonths, Math.min(maxMonths, months));
  const apr = minAPR + ((clampedMonths - minMonths) * (maxAPR - minAPR)) / (maxMonths - minMonths);
  return Math.round(apr * 10) / 10; // Round to 1 decimal place
};

// Function to format months into readable duration
const formatDuration = (months: number): string => {
  if (months < 12) {
    return `${months} Month${months !== 1 ? 's' : ''}`;
  } else if (months % 12 === 0) {
    const years = months / 12;
    return `${years} Year${years !== 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return `${years} Year${years !== 1 ? 's' : ''} ${remainingMonths} Month${remainingMonths !== 1 ? 's' : ''}`;
  }
};

export default function BtcStakingEnhanced() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [btcSliderValue, setBtcSliderValue] = useState([0]);
  const [hashrateSliderValue, setHashrateSliderValue] = useState([0]);
  const [lockMonths, setLockMonths] = useState([12]); // Default to 1 year (12 months)
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch BTC prices and hashrate info with real-time updates
  const { data: priceData } = useQuery<{
    btcPrice: string;
    hashratePrice: string;
    requiredHashratePerBTC: string;
    timestamp: string;
  }>({
    queryKey: ['/api/btc/prices'],
    refetchInterval: 10000, // Refresh every 10 seconds
    refetchIntervalInBackground: true,
  });

  // Fetch user's BTC balance with real-time updates
  const { data: balanceData } = useQuery<{
    btcBalance: string;
  }>({
    queryKey: ['/api/btc/balance'],
    enabled: !!user,
    refetchInterval: 3000, // Refresh every 3 seconds
    refetchIntervalInBackground: true,
  });

  // Fetch user's active stakes with real-time updates
  const { data: stakesData } = useQuery<{
    stakes: any[];
    currentBtcPrice: string;
    totalStaked: string;
    totalDailyRewards: string;
  }>({
    queryKey: ['/api/btc/stakes'],
    enabled: !!user,
    refetchInterval: 5000, // Refresh every 5 seconds
    refetchIntervalInBackground: true,
  });

  // Create stake mutation
  const stakeMutation = useMutation({
    mutationFn: async (data: { btcAmount: string; months: number; apr: number }) => {
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
        description: `Your BTC is now locked for ${formatDuration(months)} earning ${apr}% APR`,
        className: "bg-green-800 text-white",
      });
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
  
  // Calculate maximum BTC that can be staked based on available hashrate
  const maxBtcBasedOnHashrate = btcPrice > 0 ? userHashPower / btcPrice : 0;
  const maxBtcAllowed = Math.min(btcBalance, maxBtcBasedOnHashrate);
  
  // Automatically initialize sliders to 100% of available resources
  useEffect(() => {
    if (!isInitialized && maxBtcAllowed > 0 && btcPrice > 0) {
      // Set to 100% of what's possible based on both limits
      setBtcSliderValue([maxBtcAllowed]);
      // Set hashrate to match the BTC amount
      setHashrateSliderValue([maxBtcAllowed * btcPrice]);
      setIsInitialized(true);
    }
  }, [btcBalance, userHashPower, btcPrice, maxBtcAllowed, isInitialized]);
  
  const btcAmount = btcSliderValue[0];
  const hashrateAmount = hashrateSliderValue[0];
  const months = lockMonths[0];
  const apr = calculateAPR(months);
  
  // Calculate returns based on lock time
  const dailyReward = (btcAmount * apr / 100 / 365);
  const totalReturn = (btcAmount * apr / 100 * (months / 12));
  const totalWithPrincipal = btcAmount + totalReturn;
  const dollarValue = btcAmount * btcPrice;
  const dollarReturn = totalReturn * btcPrice;

  // Update hashrate slider when BTC slider changes
  // Automatically sync hashrate with BTC amount
  useEffect(() => {
    if (btcPrice > 0) {
      const requiredHashrate = btcAmount * btcPrice;
      setHashrateSliderValue([requiredHashrate]);
    }
  }, [btcAmount, btcPrice]);

  const handleStake = () => {
    stakeMutation.mutate({
      btcAmount: btcAmount.toString(),
      months: months,
      apr: apr,
    });
  };

  return (
    <div className="mobile-page bg-black relative overflow-hidden">
      {/* Animated Bitcoin Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#f7931a]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#ffb347]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-[#f7931a]/5 to-[#ffb347]/5 rounded-full blur-2xl animate-spin-slow" />
      </div>
      {/* Premium Bitcoin Header */}
      <div className="mobile-header backdrop-blur-md bg-black/50 border-b-2 border-[#f7931a]/50 shadow-2xl relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-[#f7931a]/10 via-transparent to-[#ffb347]/10" />
        <div className="flex items-center justify-between relative">
          <div className="flex items-center">
            <Button
              onClick={() => setLocation('/wallet')}
              variant="ghost"
              size="sm"
              className="p-0 mr-3 hover:bg-[#f7931a]/20 transition-all duration-300 hover:scale-110"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5 text-[#f7931a] drop-shadow-glow" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="text-3xl animate-bounce-slow">₿</span>
                <div className="absolute inset-0 text-3xl blur-md opacity-50">₿</div>
              </div>
              <h1 className="text-lg font-black tracking-wider">
                <span className="text-[#f7931a]">BTC</span>
                <span className="text-white ml-1">STAKING</span>
                <span className="text-[#ffb347] ml-1 text-xs align-super">PRO</span>
              </h1>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#f7931a] to-[#ffb347] blur-md" />
            <Badge className="relative bg-gradient-to-r from-[#f7931a] to-[#ffb347] text-black font-black px-3 py-1 shadow-glow">
              <span className="text-lg">{apr}%</span>
              <span className="text-xs ml-1">APR</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Premium Content */}
      <div className="mobile-content relative z-10">
        {/* Floating Stats Cards */}
        <div className="relative mb-4">
          <Card className="p-5 backdrop-blur-xl bg-gradient-to-br from-black/80 via-[#1a0e00]/50 to-black/80 border-2 border-[#f7931a]/40 shadow-2xl relative overflow-hidden group hover:border-[#f7931a]/60 transition-all duration-500">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #f7931a 0, #f7931a 1px, transparent 1px, transparent 15px)', backgroundSize: '20px 20px' }} />
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#f7931a]/20 rounded-full blur-3xl group-hover:bg-[#f7931a]/30 transition-all duration-500" />
            
            <div className="flex items-center justify-between relative">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-[#f7931a] to-[#ffb347] rounded-2xl shadow-glow animate-pulse-slow">
                    <span className="text-3xl text-black font-black">₿</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-[#f7931a]/70 font-semibold uppercase tracking-wider">Live Price</p>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping delay-100" />
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping delay-200" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-white">
                    <span className="text-[#f7931a]">$</span>{priceData?.btcPrice ? Number(priceData.btcPrice).toLocaleString() : '0'}
                  </p>
                </div>
              </div>
              <div className="text-right bg-black/50 backdrop-blur-sm rounded-xl px-3 py-2 border border-[#f7931a]/20">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <p className="text-xs text-[#f7931a]/70 font-semibold uppercase tracking-wider">Your Balance</p>
                  <div className="relative">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                  </div>
                </div>
                <p className="text-xl font-black">
                  <span className="text-[#f7931a]">₿</span>
                  <span className="text-white ml-1">{btcBalance.toFixed(8)}</span>
                </p>
                <p className="text-xs text-[#ffb347] font-medium">
                  ≈ ${(btcBalance * btcPrice).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="stake" className="mt-6">
          <TabsList className="grid w-full grid-cols-2 bg-black/50 backdrop-blur-md border-2 border-[#f7931a]/30 p-1 rounded-2xl shadow-glow">
            <TabsTrigger 
              value="stake" 
              className="rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#f7931a] data-[state=active]:to-[#ffb347] data-[state=active]:text-black data-[state=active]:font-black data-[state=active]:shadow-glow data-[state=inactive]:text-gray-400"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <span>CREATE</span>
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="active" 
              className="rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#f7931a] data-[state=active]:to-[#ffb347] data-[state=active]:text-black data-[state=active]:font-black data-[state=active]:shadow-glow data-[state=inactive]:text-gray-400"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">📊</span>
                <span>ACTIVE</span>
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stake" className="mt-4">
            <Card className="p-4 bg-gradient-to-br from-[#1a1a1a] to-black border-[#f7931a]/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-24 h-24 bg-[#f7931a]/10 rounded-full blur-2xl" />
              {/* Lock Time Slider */}
              <div className="mb-6 relative">
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-[#f7931a] font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Lock Duration
                  </Label>
                  <div className="text-right bg-[#f7931a]/10 px-3 py-1 rounded-lg border border-[#f7931a]/30">
                    <p className="text-lg font-bold text-[#f7931a]">{formatDuration(months)}</p>
                    <p className="text-xs text-green-400">
                      APR: {apr}%
                    </p>
                  </div>
                </div>
                <TimerSlider
                  value={lockMonths}
                  onValueChange={setLockMonths}
                  min={3}
                  max={120}
                  step={1}
                  className="mb-2"
                  data-testid="slider-lock-time"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>3 Months</span>
                  <span>10 Years</span>
                </div>
              </div>

              <Separator className="mb-6 bg-gray-700" />

              {/* BTC Amount Slider */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-[#f7931a] font-semibold flex items-center gap-2">
                    <span className="text-lg">₿</span>
                    BTC Amount
                  </Label>
                  <div className="text-right bg-[#f7931a]/10 px-3 py-1 rounded-lg border border-[#f7931a]/30">
                    <p className="text-lg font-bold text-[#f7931a]">
                      {btcAmount.toFixed(8)} BTC
                      {maxBtcAllowed > 0 && (
                        <span className="text-xs text-green-400 ml-1">
                          ({(btcAmount / maxBtcAllowed * 100).toFixed(0)}%)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      ≈ ${(btcAmount * btcPrice).toLocaleString()}
                    </p>
                  </div>
                </div>
                <BtcSlider
                  value={btcSliderValue}
                  onValueChange={(value: number[]) => {
                    // Ensure value doesn't exceed max allowed
                    const safeValue = value.map((v: number) => Math.min(v, maxBtcAllowed));
                    setBtcSliderValue(safeValue);
                  }}
                  min={0}
                  max={maxBtcAllowed > 0 ? maxBtcAllowed : 0.001}
                  step={maxBtcAllowed > 0 ? maxBtcAllowed / 100 : 0.001}
                  className="mb-2"
                  data-testid="slider-btc-amount"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0 BTC</span>
                  <span>
                    {maxBtcAllowed > 0 ? (
                      <>
                        {maxBtcAllowed.toFixed(8)} BTC (100% Max)
                        {maxBtcBasedOnHashrate < btcBalance ? 
                          <span className="text-yellow-500"> - Hashrate limited</span> : 
                          <span className="text-blue-500"> - Balance limited</span>
                        }
                      </>
                    ) : '0 BTC'}
                  </span>
                </div>
              </div>

              {/* Hashrate Amount Slider */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-green-400 font-semibold flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    GBTC Hashrate Required
                  </Label>
                  <div className="text-right bg-green-500/10 px-3 py-1 rounded-lg border border-green-500/30">
                    <p className="text-lg font-bold text-green-400">
                      {hashrateAmount.toFixed(0)} GH/s
                      {userHashPower > 0 && (
                        <span className="text-xs text-green-300 ml-1">
                          ({(hashrateAmount / userHashPower * 100).toFixed(0)}%)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      {userHashPower >= hashrateAmount ? '✓ Ready' : `Need ${(hashrateAmount - userHashPower).toFixed(0)} more`}
                    </p>
                  </div>
                </div>
                <HashSlider
                  value={hashrateSliderValue}
                  onValueChange={setHashrateSliderValue}
                  min={0}
                  max={userHashPower > 0 ? userHashPower : btcPrice * 10}
                  step={userHashPower > 0 ? userHashPower / 100 : 100}
                  className="mb-2"
                  disabled={true}
                  data-testid="slider-hashrate-amount"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0 GH/s</span>
                  <span>
                    {userHashPower > 0 ? 
                      `${userHashPower.toLocaleString()} GH/s (100% Available)` : 
                      `${(btcPrice * 10).toLocaleString()} GH/s`
                    }
                  </span>
                </div>
              </div>

              <Separator className="mb-6 bg-gray-700" />

              {/* Returns Calculator */}
              <div className="bg-gradient-to-br from-[#1a1a1a] via-[#0d0d0d] to-black rounded-xl p-4 mb-6 border border-[#f7931a]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl" />
                <h3 className="text-[#f7931a] font-bold mb-3 flex items-center gap-2 relative">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Projected Returns
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Daily Rewards</span>
                    <span className="text-sm font-medium text-white">
                      {dailyReward.toFixed(8)} BTC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Total Return</span>
                    <span className="text-sm font-medium text-green-400">
                      +{totalReturn.toFixed(8)} BTC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Total After {formatDuration(months)}</span>
                    <span className="text-sm font-bold text-[#f7931a]">
                      {totalWithPrincipal.toFixed(8)} BTC
                    </span>
                  </div>
                  <Separator className="bg-gray-700 my-2" />
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Dollar Value</span>
                    <span className="text-sm font-medium text-white">
                      ${dollarValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Dollar Return</span>
                    <span className="text-sm font-medium text-green-400">
                      +${dollarReturn.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Requirements Check */}
              <div className="bg-gradient-to-r from-[#f7931a]/10 to-[#f7931a]/5 border border-[#f7931a]/30 rounded-xl p-4 mb-6">
                <p className="text-sm font-bold text-[#f7931a] mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Auto-Balance Status (100% Optimized)
                </p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li className="flex items-center gap-1">
                    <CheckCircle className={`w-3 h-3 ${btcBalance >= btcAmount ? 'text-green-400' : 'text-gray-600'}`} />
                    BTC: Using {btcBalance > 0 ? ((btcAmount / btcBalance) * 100).toFixed(0) : '0'}% of {btcBalance.toFixed(8)} BTC
                  </li>
                  <li className="flex items-center gap-1">
                    <CheckCircle className={`w-3 h-3 ${userHashPower >= hashrateAmount ? 'text-green-400' : 'text-gray-600'}`} />
                    Hashrate: Using {userHashPower > 0 ? ((hashrateAmount / userHashPower) * 100).toFixed(0) : '0'}% of {userHashPower.toLocaleString()} GH/s
                  </li>
                  <li className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-yellow-400" />
                    Lock Period: {formatDuration(months)} @ {apr}% APR
                  </li>
                  <li className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    Auto-set to maximum: {maxBtcAllowed.toFixed(8)} BTC
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleStake}
                className="w-full bg-gradient-to-r from-[#f7931a] to-[#ffb347] hover:from-[#ffb347] hover:to-[#f7931a] text-black font-bold text-lg py-6 rounded-xl shadow-lg shadow-[#f7931a]/30 transition-all duration-300 transform hover:scale-[1.02]"
                disabled={
                  btcBalance < btcAmount ||
                  userHashPower < hashrateAmount ||
                  stakeMutation.isPending ||
                  btcAmount <= 0
                }
                data-testid="button-create-stake"
              >
                {stakeMutation.isPending ? (
                  "Creating Stake..."
                ) : btcAmount <= 0 ? (
                  "Select BTC Amount to Stake"
                ) : btcBalance < btcAmount ? (
                  `Insufficient BTC (Need ${(btcAmount - btcBalance).toFixed(8)} more)`
                ) : userHashPower < hashrateAmount ? (
                  `Insufficient Hashrate (Need ${(hashrateAmount - userHashPower).toFixed(0)} more GH/s)`
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Lock {btcAmount.toFixed(8)} BTC for {formatDuration(months)} @ {apr}% APR
                  </>
                )}
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="mt-4">
            <Card className="p-4 bg-gradient-to-br from-[#1a1a1a] to-black border-[#f7931a]/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl" />
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
                  
                  {stakesData.stakes.map((stake: any) => {
                    const stakeMonths = stake.lockMonths || 12; // Default to 12 if not set
                    
                    return (
                      <div key={stake.id} className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-white" />
                            <div>
                              <p className="text-white font-medium">
                                {parseFloat(stake.btcAmount).toFixed(8)} BTC
                              </p>
                              <p className="text-xs text-gray-400">
                                Staked {new Date(stake.stakedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-[#f7931a] text-black">
                            {stake.aprRate}% APR
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
                              {parseFloat(stake.gbtcHashrate).toFixed(0)} GH/s
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
                              className="bg-[#f7931a] h-2 rounded-full transition-all"
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
                    );
                  })}
                  
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
                    Create your first stake to start earning up to 65% APR
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
            Dynamic APR Formula
          </h3>
          <div className="space-y-3 text-xs">
            <div className="bg-[#1a1a1a] rounded p-3">
              <p className="text-gray-400 mb-2">APR increases with lock duration:</p>
              <div className="space-y-1 text-gray-500">
                <div className="flex justify-between">
                  <span>3 Months</span>
                  <span className="text-green-400">5% APR</span>
                </div>
                <div className="flex justify-between">
                  <span>1 Year</span>
                  <span className="text-green-400">12% APR</span>
                </div>
                <div className="flex justify-between">
                  <span>5 Years</span>
                  <span className="text-green-400">40% APR</span>
                </div>
                <div className="flex justify-between">
                  <span>10 Years</span>
                  <span className="text-green-400">65% APR</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-[#f7931a]" />
              <p className="text-gray-400">
                Longer lock periods earn higher rewards
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}