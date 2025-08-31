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

  const blockProgress = ((600 - blockTimer) / 600) * 100;

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
    <div className="mobile-page">
      {/* Header */}
      <div className="mobile-header">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 cyber-border rounded-xl flex items-center justify-center glow-bitcoin">
            <img src={bitcoinLogo} alt="GBTC" className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-primary">GBTC MINING</h1>
            <p className="text-xs text-muted-foreground font-mono">
              {isInactive ? "⚠️ INACTIVE" : "✓ ACTIVE"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground font-mono">BALANCE</p>
          <p className="text-sm font-display font-bold text-primary">
            {parseFloat(user?.gbtcBalance || '0').toFixed(4)} GBTC
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mobile-content">
        {/* Top Stats Bar */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="mobile-card">
            <p className="text-xs text-muted-foreground font-mono mb-1">USDT BALANCE</p>
            <p className="text-xl font-display font-black text-accent">
              ${parseFloat(user?.usdtBalance || '0').toFixed(2)}
            </p>
          </Card>
          <Card className="mobile-card">
            <p className="text-xs text-muted-foreground font-mono mb-1">MY HASHRATE</p>
            <p className="text-xl font-display font-black text-primary">
              {getHashrateDisplay(myHashrate)}
            </p>
          </Card>
        </div>

        {/* Advanced Bitcoin Block Mining Animation */}
        <Card className="mobile-card p-6 bg-gradient-to-br from-card to-background overflow-hidden">
          <div className="flex flex-col items-center relative">
            {/* Hash Stream Animation */}
            <div className="hash-stream">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="hash-line"
                  style={{
                    left: `${20 + i * 20}%`,
                    animationDelay: `${i * 0.6}s`
                  }}
                >
                  {currentHash.substring(i * 12, i * 12 + 12)}
                </div>
              ))}
            </div>

            <div className="relative mb-4">
              <div className="bitcoin-block">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 cyber-border rounded-lg bg-black/80 backdrop-blur flex flex-col items-center justify-center mining-rig">
                    <img src={bitcoinLogo} alt="Mining" className="w-12 h-12 mb-2" />
                    <div className="text-xs font-mono text-primary">
                      BLOCK #{Math.floor(820000 + blockTimer / 60)}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground mt-1">
                      {miningActive ? 'MINING...' : 'IDLE'}
                    </div>
                  </div>
                </div>
                {/* Mining Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-secondary/30"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    stroke="url(#mining-gradient)"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 90}`}
                    strokeDashoffset={`${2 * Math.PI * 90 * (1 - blockProgress / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                  <defs>
                    <linearGradient id="mining-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="50%" stopColor="hsl(var(--chart-4))" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            <div className="text-center w-full">
              <div className="difficulty-badge mb-3">
                DIFFICULTY: {difficulty}T
              </div>
              <p className="text-xs text-muted-foreground font-mono mb-2">NEXT BLOCK IN</p>
              <p className="text-4xl font-display font-black text-primary glow-green">
                {formatTime(blockTimer)}
              </p>
              <div className="hashrate-meter mt-4 mb-2">
                <div className="hashrate-fill" style={{ width: `${blockProgress}%` }} />
              </div>
              <p className="text-sm text-muted-foreground font-mono">
                Block Reward: {currentBlockReward} GBTC
              </p>
            </div>
          </div>
        </Card>

        {/* Mining Stats */}
        <Card className="mobile-card">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-mono">My Hashrate</span>
              <span className="text-sm font-display font-bold text-primary">
                {getHashrateDisplay(myHashrate)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-mono">Network Hashrate</span>
              <span className="text-sm font-display font-bold">
                {getHashrateDisplay(globalHashrate)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-mono">Mining Power</span>
              <span className="text-sm font-display font-bold text-chart-4">
                {globalHashrate > 0 ? ((myHashrate / globalHashrate) * 100).toFixed(4) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-mono">Est. Reward</span>
              <span className="text-sm font-display font-bold text-accent">
                {myEstimatedReward.toFixed(6)} GBTC
              </span>
            </div>
          </div>
        </Card>

        {/* Unclaimed Rewards */}
        <Card className="mobile-card bg-gradient-to-br from-primary/10 to-chart-4/10">
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground font-mono mb-2">UNCLAIMED REWARDS</p>
            <p className="text-3xl font-display font-black text-primary">
              {unclaimedGBTC.toFixed(6)} GBTC
            </p>
            {lastClaimed && (
              <p className="text-xs text-muted-foreground font-mono mt-2">
                Last claimed: {hoursSinceLastClaim}h ago
              </p>
            )}
          </div>

          <button
            onClick={handleClaim}
            disabled={unclaimedGBTC === 0 || claimRewardsMutation.isPending}
            className="claim-button w-full relative"
            data-testid="button-claim-rewards"
          >
            {showClaimWarning && (
              <span className="claim-warning">!</span>
            )}
            <i className="fas fa-hand-holding-usd mr-3"></i>
            CLAIM REWARDS
          </button>

          {isInactive && (
            <div className="mt-3 p-3 bg-destructive/20 rounded-lg">
              <p className="text-xs text-destructive text-center font-mono">
                ⚠️ You are inactive! Claim now to resume mining.
              </p>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/power">
            <Button className="mobile-btn-primary h-auto" data-testid="button-purchase-power">
              <div className="py-2">
                <i className="fas fa-bolt text-2xl mb-2"></i>
                <p className="text-xs">Purchase Power</p>
              </div>
            </Button>
          </Link>
          
          <Link href="/transfer">
            <Button className="mobile-btn bg-chart-4 text-primary-foreground h-auto" data-testid="button-transfer">
              <div className="py-2">
                <i className="fas fa-exchange-alt text-2xl mb-2"></i>
                <p className="text-xs">Transfer</p>
              </div>
            </Button>
          </Link>
          
          <Link href="/deposit">
            <Button className="mobile-btn-accent h-auto" data-testid="button-deposit">
              <div className="py-2">
                <i className="fas fa-wallet text-2xl mb-2"></i>
                <p className="text-xs">Deposit</p>
              </div>
            </Button>
          </Link>
          
          <Link href="/withdraw">
            <Button className="mobile-btn bg-chart-3 text-primary-foreground h-auto" data-testid="button-withdraw">
              <div className="py-2">
                <i className="fas fa-money-bill-wave text-2xl mb-2"></i>
                <p className="text-xs">Withdraw</p>
              </div>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}