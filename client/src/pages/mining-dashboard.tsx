import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import bitcoinLogo from "@assets/file_00000000221c61fab63936953b889556_1756633909848.png";

export default function MiningDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [blockTimer, setBlockTimer] = useState(600); // 10 minutes in seconds
  const [lastClaimed, setLastClaimed] = useState<Date | null>(null);
  const [currentHash, setCurrentHash] = useState<string>('');  
  const [miningActive, setMiningActive] = useState(true);
  const [blockProgress, setBlockProgress] = useState(0);

  // Calculate hours since last claim
  const getHoursSinceLastClaim = () => {
    if (!lastClaimed) return 0;
    const diff = Date.now() - lastClaimed.getTime();
    return Math.floor(diff / (1000 * 60 * 60));
  };

  const hoursSinceLastClaim = getHoursSinceLastClaim();
  const showClaimWarning = hoursSinceLastClaim > 18;
  const isInactive = hoursSinceLastClaim >= 24;

  // Block timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setBlockTimer(prev => {
        if (prev <= 1) {
          return 600; // Reset to 10 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    setBlockProgress(((600 - blockTimer) / 600) * 100);
  }, [blockTimer]);

  // Convert to real hashrate units
  const myHashrate = parseFloat(user?.hashPower || '0');
  const getHashrateDisplay = (hashrate: number) => {
    if (hashrate >= 1000000) return `${(hashrate / 1000000).toFixed(2)} PH/s`;
    if (hashrate >= 1000) return `${(hashrate / 1000).toFixed(2)} TH/s`;
    return `${hashrate.toFixed(2)} GH/s`;
  };

  const globalHashrate = 584732.50; // GH/s
  const currentBlockReward = 6.25;
  const myEstimatedReward = globalHashrate > 0 ? (myHashrate / globalHashrate) * currentBlockReward : 0;
  const unclaimedGBTC = parseFloat(user?.unclaimedBalance || '0');
  const difficulty = 47.8; // Mining difficulty in T

  // Generate random hash
  useEffect(() => {
    const generateHash = () => {
      const chars = '0123456789abcdef';
      let hash = '0000';
      for (let i = 0; i < 60; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)];
      }
      setCurrentHash(hash);
    };
    const interval = setInterval(generateHash, 100);
    return () => clearInterval(interval);
  }, []);

  const claimRewardsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/claim-rewards");
      return res.json();
    },
    onSuccess: () => {
      setLastClaimed(new Date());
      toast({ 
        title: "Rewards Claimed!", 
        description: "Your mining rewards have been added to your balance." 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Claim Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const handleClaim = () => {
    claimRewardsMutation.mutate();
  };

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 bitcoin-grid opacity-20"></div>

      {/* Hash Rain Effect */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute font-mono text-xs text-green-500/20"
            style={{
              left: `${12.5 * i}%`,
              animation: `hash-stream ${10 + i * 2}s linear infinite`,
              animationDelay: `${i * 0.5}s`
            }}
          >
            {currentHash.substring(0, 8)}
          </div>
        ))}
      </div>

      <div className="relative z-10 p-4 space-y-4">
        {/* Mining Status Terminal */}
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="flex items-center space-x-2">
              <div className={`terminal-dot ${miningActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div className="terminal-dot bg-yellow-500"></div>
              <div className="terminal-dot bg-gray-500"></div>
            </div>
            <span className="ml-auto text-xs text-muted-foreground font-mono">
              Mining Node #{user?.id?.toString().padStart(6, '0') || '000000'}
            </span>
          </div>
          <div className="terminal-content space-y-1">
            <div className="text-green-500">[SYSTEM] Mining operation {miningActive ? 'ACTIVE' : 'PAUSED'}</div>
            <div className="text-cyan-500">[HASH] Processing: 0x{currentHash.substring(0, 32)}...</div>
            <div className="text-yellow-500">[POOL] Connected to GBTC Mining Pool</div>
            <div className="text-green-500">[STATS] Hashrate: {getHashrateDisplay(myHashrate)}</div>
            <div className="text-blue-500">[BLOCK] Progress: {blockProgress.toFixed(1)}%</div>
          </div>
        </div>

        {/* Main Mining Stats */}
        <Card className="mining-block">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-bold">Mining Operation</h2>
            <div className={`px-3 py-1 rounded-full text-xs font-mono flex items-center ${
              miningActive ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-red-500/20 text-red-500'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${miningActive ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
              {miningActive ? 'MINING' : 'PAUSED'}
            </div>
          </div>

          {/* Hashrate Display */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="data-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground uppercase">Your Hashrate</span>
                <i className="fas fa-microchip text-primary"></i>
              </div>
              <div className="text-2xl font-mono font-bold text-gradient">
                {getHashrateDisplay(myHashrate)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Network Share: {((myHashrate / globalHashrate) * 100).toFixed(4)}%
              </div>
            </div>

            <div className="data-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground uppercase">Mining Power</span>
                <i className="fas fa-bolt text-chart-4"></i>
              </div>
              <div className="text-2xl font-mono font-bold text-gradient">
                {myHashrate.toFixed(0)}
              </div>
              <div className="text-xs text-accent mt-1">
                +{myEstimatedReward.toFixed(6)} GBTC/block
              </div>
            </div>
          </div>

          {/* Block Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground uppercase">Current Block Mining</span>
              <span className="text-xs font-mono text-primary">{formatTime(blockTimer)}</span>
            </div>
            <div className="h-3 bg-background rounded-full overflow-hidden border border-border">
              <div 
                className="h-full bg-gradient-to-r from-primary to-chart-4 transition-all duration-1000"
                style={{ width: `${blockProgress}%` }}
              >
                <div className="h-full bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Block #871235</span>
              <span>Est. Reward: {currentBlockReward} GBTC</span>
            </div>
          </div>

          {/* Mining Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 rounded-lg bg-background">
              <div className="text-xl font-mono font-bold text-chart-2">87</div>
              <div className="text-xs text-muted-foreground">Blocks Today</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-background">
              <div className="text-xl font-mono font-bold text-chart-3">{difficulty}T</div>
              <div className="text-xs text-muted-foreground">Difficulty</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-background">
              <div className="text-xl font-mono font-bold text-chart-4">1,847</div>
              <div className="text-xs text-muted-foreground">Active Miners</div>
            </div>
          </div>
        </Card>

        {/* Rewards Section */}
        <Card className="mining-block relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/20 to-transparent rounded-full blur-2xl"></div>
          
          <h3 className="text-lg font-heading font-bold mb-4">Mining Rewards</h3>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">Unclaimed Rewards</div>
                <div className="text-3xl font-mono font-bold text-gradient-green">
                  {unclaimedGBTC.toFixed(8)} GBTC
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  ≈ ${(unclaimedGBTC * 0.0156).toFixed(2)} USD
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-warning mb-1">⚠️ Claim within 24h</div>
                <div className="text-xs text-muted-foreground">or lose 50%</div>
              </div>
            </div>

            <Button 
              className="w-full btn-primary"
              onClick={handleClaim}
              disabled={unclaimedGBTC === 0 || claimRewardsMutation.isPending}
              data-testid="button-claim-rewards"
            >
              {claimRewardsMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-coins mr-2"></i>
                  CLAIM {unclaimedGBTC.toFixed(4)} GBTC
                </>
              )}
            </Button>

            {unclaimedGBTC > 0 && showClaimWarning && (
              <div className="mt-3 p-2 rounded-lg bg-warning/10 border border-warning/30">
                <div className="text-xs text-warning">
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  Rewards expire in {24 - hoursSinceLastClaim} hours
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Mining History */}
        <Card className="mining-block">
          <h3 className="text-lg font-heading font-bold mb-4">Recent Blocks</h3>
          <div className="space-y-2">
            {[
              { block: 871234, reward: 0.0234, time: '2 mins ago', status: 'confirmed' },
              { block: 871233, reward: 0.0229, time: '12 mins ago', status: 'confirmed' },
              { block: 871232, reward: 0.0241, time: '22 mins ago', status: 'confirmed' },
              { block: 871231, reward: 0.0218, time: '32 mins ago', status: 'confirmed' },
              { block: 871230, reward: 0.0236, time: '42 mins ago', status: 'confirmed' },
            ].map((item) => (
              <div key={item.block} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                    <i className="fas fa-cube text-primary text-xs"></i>
                  </div>
                  <div>
                    <div className="text-sm font-mono">Block #{item.block}</div>
                    <div className="text-xs text-muted-foreground">{item.time}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-accent">+{item.reward} GBTC</div>
                  <div className="text-xs text-green-500">
                    <i className="fas fa-check-circle mr-1"></i>
                    {item.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="data-card">
            <div className="text-xs text-muted-foreground mb-1">24h Earnings</div>
            <div className="text-xl font-mono font-bold text-gradient-green">0.5432 GBTC</div>
            <div className="text-xs text-accent">+12.5%</div>
          </Card>
          <Card className="data-card">
            <div className="text-xs text-muted-foreground mb-1">Total Mined</div>
            <div className="text-xl font-mono font-bold text-gradient">127.384 GBTC</div>
            <div className="text-xs text-muted-foreground">All time</div>
          </Card>
        </div>
      </div>
    </div>
  );
}