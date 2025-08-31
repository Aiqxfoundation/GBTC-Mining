import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Zap, Cpu, Clock, TrendingUp, Coins } from "lucide-react";

export default function MiningFactory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [runningHashes, setRunningHashes] = useState<string[]>([]);
  const [nextBlockTime, setNextBlockTime] = useState("00:00");
  const [currentTime, setCurrentTime] = useState(Date.now());

  const hashPower = parseFloat(user?.hashPower || '0');
  const gbtcBalance = parseFloat(user?.gbtcBalance || '0');

  // Fetch global mining stats
  const { data: globalStats } = useQuery({
    queryKey: ["/api/global-stats"],
    refetchInterval: 5000,
  });

  // Fetch unclaimed blocks
  const { data: unclaimedBlocks, isLoading: blocksLoading } = useQuery({
    queryKey: ["/api/unclaimed-blocks"],
    refetchInterval: 10000,
    enabled: !!user,
  });

  // Generate smooth scrolling hashes
  useEffect(() => {
    if (hashPower <= 0) return;

    const generateHash = () => {
      const chars = '0123456789abcdef';
      let hash = '0x';
      for (let i = 0; i < 64; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)];
      }
      return hash;
    };

    const interval = setInterval(() => {
      setRunningHashes(prev => {
        const newHashes = [...prev];
        if (newHashes.length >= 10) {
          newHashes.shift();
        }
        newHashes.push(generateHash());
        return newHashes;
      });
    }, 1000);

    // Initialize with some hashes
    setRunningHashes(Array(5).fill(0).map(() => generateHash()));

    return () => clearInterval(interval);
  }, [hashPower]);

  // Update countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
      
      // Calculate time until next block (10-minute intervals)
      const now = new Date();
      const minutesInCycle = now.getMinutes() % 10;
      const secondsInCycle = now.getSeconds();
      const totalSecondsRemaining = (10 - minutesInCycle - 1) * 60 + (60 - secondsInCycle);
      
      const minutes = Math.floor(totalSecondsRemaining / 60);
      const seconds = totalSecondsRemaining % 60;
      
      setNextBlockTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Claim block mutation
  const claimBlockMutation = useMutation({
    mutationFn: async (blockId: string) => {
      const res = await apiRequest("POST", "/api/claim-block", { blockId });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Block Claimed!", 
        description: `Successfully claimed ${data.reward} GBTC` 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/unclaimed-blocks"] });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Claim Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const formatHashrate = (hashrate: number) => {
    if (hashrate >= 1000000000) return `${(hashrate / 1000000000).toFixed(2)} P`;
    if (hashrate >= 1000000) return `${(hashrate / 1000000).toFixed(2)} T`;
    if (hashrate >= 1000) return `${(hashrate / 1000).toFixed(2)} G`;
    if (hashrate >= 1) return `${hashrate.toFixed(2)} M`;
    return `${(hashrate * 1000).toFixed(2)} K`;
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const diff = expires - now;
    
    if (diff <= 0) return "EXPIRED";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Calculate stats
  const totalSupply = 2100000000; // 2.1 Billion
  const circulation = globalStats?.circulation || 217340000;
  const blockHeight = globalStats?.blockHeight || 43469;
  const globalHashrate = globalStats?.totalHashrate || 712110;
  const hashGains = hashPower > 0 ? (parseFloat(user?.unclaimedRewards || '0') / hashPower * 1000).toFixed(8) : '0.00000000';
  const myMiners = globalStats?.activeMiners || 4;

  return (
    <div className="mobile-page bg-black">
      {/* Header */}
      <div className="mobile-header bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-display font-black text-primary glow-green">
            MINING FACTORY
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            GBTC BLOCKCHAIN NETWORK
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground font-mono">BALANCE</p>
          <p className="text-lg font-display font-bold text-accent glow-gold">
            {gbtcBalance.toFixed(8)} GBTC
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mobile-content">
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Total Supply */}
          <Card className="mobile-card bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-mono mb-1">TotalSupply</p>
                <p className="text-lg font-display font-bold text-primary">
                  {(totalSupply / 1000000000).toFixed(1)} Bn
                </p>
              </div>
              <Coins className="w-5 h-5 text-primary/50" />
            </div>
          </Card>

          {/* Circulation */}
          <Card className="mobile-card bg-gradient-to-br from-accent/10 to-transparent border-accent/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-mono mb-1">Circulation</p>
                <p className="text-lg font-display font-bold text-accent">
                  {(circulation / 1000000).toFixed(2)} Mn
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-accent/50" />
            </div>
          </Card>

          {/* Block Height */}
          <Card className="mobile-card bg-gradient-to-br from-chart-3/10 to-transparent border-chart-3/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-mono mb-1">BlockHeight</p>
                <p className="text-lg font-display font-bold text-chart-3">
                  {blockHeight.toLocaleString()}
                </p>
              </div>
              <Cpu className="w-5 h-5 text-chart-3/50" />
            </div>
          </Card>

          {/* Hashrate */}
          <Card className="mobile-card bg-gradient-to-br from-chart-4/10 to-transparent border-chart-4/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-mono mb-1">Hashrate</p>
                <p className="text-lg font-display font-bold text-chart-4">
                  {formatHashrate(globalHashrate)} H
                </p>
              </div>
              <Zap className="w-5 h-5 text-chart-4/50" />
            </div>
          </Card>

          {/* Hash Gains */}
          <Card className="mobile-card bg-gradient-to-br from-success/10 to-transparent border-success/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-mono mb-1">HashGains</p>
                <p className="text-lg font-display font-bold text-success">
                  {hashGains} <span className="text-xs">M/B</span>
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-success/50" />
            </div>
          </Card>

          {/* Next Block */}
          <Card className="mobile-card bg-gradient-to-br from-warning/10 to-transparent border-warning/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-mono mb-1">NextBlock</p>
                <p className="text-lg font-display font-bold text-warning">
                  {nextBlockTime}
                </p>
              </div>
              <Clock className="w-5 h-5 text-warning/50 animate-pulse" />
            </div>
          </Card>
        </div>

        {/* Personal Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* My Hash */}
          <Card className="mobile-card bg-black border-primary/30">
            <div>
              <p className="text-xs text-muted-foreground font-mono mb-1">MyHash</p>
              <p className="text-base font-display font-bold text-primary">
                {formatHashrate(hashPower / 1000)} K
              </p>
            </div>
          </Card>

          {/* Contributed */}
          <Card className="mobile-card bg-black border-accent/30">
            <div>
              <p className="text-xs text-muted-foreground font-mono mb-1">Contributed</p>
              <p className="text-base font-display font-bold text-accent">
                {(hashPower / 1000).toFixed(2)} K
              </p>
              <p className="text-[10px] text-muted-foreground">Rules</p>
            </div>
          </Card>

          {/* My Miners */}
          <Card className="mobile-card bg-black border-chart-3/30">
            <div>
              <p className="text-xs text-muted-foreground font-mono mb-1">MyMiners</p>
              <p className="text-base font-display font-bold text-chart-3">
                {myMiners} <span className="text-xs">ppl</span>
              </p>
            </div>
          </Card>
        </div>

        {/* Transaction Hashes (Non-vibrating) */}
        {hashPower > 0 && (
          <Card className="mobile-card bg-black border-primary/30 overflow-hidden mb-4">
            <div className="mb-2">
              <p className="text-xs font-mono text-primary">PROCESSING TRANSACTIONS</p>
            </div>
            <div className="bg-black/50 rounded p-3 font-mono text-[10px] space-y-1 h-24 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none z-10"></div>
              {runningHashes.map((hash, index) => (
                <div
                  key={`${hash}-${index}`}
                  className="truncate transition-all duration-500"
                  style={{
                    opacity: 1 - (index * 0.15),
                    color: index === runningHashes.length - 1 ? '#00ff00' : '#00ff0080',
                    transform: `translateY(${index === runningHashes.length - 1 ? '0' : '0'})`,
                  }}
                >
                  {hash}
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <p className="text-xs text-muted-foreground font-mono">
                Mining at {formatHashrate(hashPower / 1000)} KH/s
              </p>
            </div>
          </Card>
        )}

        {/* Unclaimed Blocks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-mono text-primary">UNCLAIMED BLOCKS</p>
            <p className="text-xs text-muted-foreground font-mono">
              Claim within 24 hours
            </p>
          </div>

          {blocksLoading ? (
            <Card className="mobile-card bg-black border-primary/30">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            </Card>
          ) : unclaimedBlocks && unclaimedBlocks.length > 0 ? (
            <div className="space-y-2">
              {unclaimedBlocks.map((block: any) => (
                <Card 
                  key={block.id} 
                  className="mobile-card bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-5 h-5 text-primary animate-pulse" />
                      <div>
                        <p className="text-sm font-display font-bold text-primary">
                          BLOCK #{block.blockNumber}
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground truncate max-w-[150px]">
                          {block.txHash}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-display font-black text-accent glow-gold">
                        {parseFloat(block.reward).toFixed(8)}
                      </p>
                      <p className="text-xs text-primary">GBTC</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className={`text-xs font-mono px-2 py-1 rounded ${
                      getTimeRemaining(block.expiresAt) === 'EXPIRED' 
                        ? 'bg-destructive/20 text-destructive' 
                        : 'bg-warning/20 text-warning'
                    }`}>
                      <Clock className="w-3 h-3 inline mr-1" />
                      {getTimeRemaining(block.expiresAt)}
                    </div>
                    
                    <Button
                      onClick={() => claimBlockMutation.mutate(block.id)}
                      disabled={
                        claimBlockMutation.isPending || 
                        getTimeRemaining(block.expiresAt) === 'EXPIRED'
                      }
                      className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                      size="sm"
                      data-testid={`button-claim-${block.id}`}
                    >
                      {claimBlockMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>CLAIM</>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mobile-card bg-black border-primary/30">
              <div className="text-center py-8">
                <Cpu className="w-10 h-10 text-muted-foreground mb-3 mx-auto" />
                <p className="text-sm text-muted-foreground">No blocks to claim</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {hashPower > 0 
                    ? "New blocks appear every 10 minutes" 
                    : "Purchase hashrate to start mining"}
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* No Hashrate Warning */}
        {hashPower <= 0 && (
          <Card className="mobile-card bg-destructive/10 border-destructive/30 mt-4">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-sm font-semibold text-destructive">Mining Inactive</p>
                <p className="text-xs text-muted-foreground">
                  Purchase hashrate to start mining GBTC
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}