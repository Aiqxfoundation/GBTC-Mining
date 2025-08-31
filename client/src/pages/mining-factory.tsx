import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Hammer, Cpu, TrendingUp, Clock, Zap, Award, Hash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MiningFactory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isMining, setIsMining] = useState(false);
  const [currentHash, setCurrentHash] = useState("");
  const [hashPool, setHashPool] = useState<string[]>([]);
  const [nextBlockTime, setNextBlockTime] = useState("00:00");
  const [hammerAnimation, setHammerAnimation] = useState(false);

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
    refetchInterval: 30000, // Check every 30 seconds instead of 10
    enabled: !!user,
  });

  // Mining animation effect
  useEffect(() => {
    if (hashPower > 0) {
      setIsMining(true);
      const interval = setInterval(() => {
        setHammerAnimation(prev => !prev);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsMining(false);
    }
  }, [hashPower]);

  // Generate realistic hash strings
  useEffect(() => {
    if (!isMining) return;

    const generateHash = () => {
      const chars = '0123456789abcdef';
      let hash = '';
      for (let i = 0; i < 64; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)];
      }
      return hash;
    };

    const interval = setInterval(() => {
      const newHash = generateHash();
      setCurrentHash(newHash);
      setHashPool(prev => {
        const updated = [newHash, ...prev.slice(0, 4)];
        return updated;
      });
    }, 100); // Fast hash generation for visual effect

    return () => clearInterval(interval);
  }, [isMining]);

  // Countdown timer for next block
  useEffect(() => {
    const timer = setInterval(() => {
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

  // Claim single block mutation
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

  // Claim all blocks mutation
  const claimAllMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/claim-all-blocks");
      return res.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "All Blocks Claimed!", 
        description: `Successfully claimed ${data.totalReward} GBTC from ${data.count} blocks` 
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

  // Calculate mining stats
  const totalSupply = 21000000;
  const blockHeight = globalStats?.blockHeight || 1;
  const globalHashrate = globalStats?.totalHashrate || 0;
  const circulation = globalStats?.circulation || 0;
  const currentBlockReward = globalStats?.currentBlockReward || 6.25;
  const networkShare = globalHashrate > 0 ? ((hashPower / globalHashrate) * 100) : 0;
  const estimatedDaily = globalHashrate > 0 ? ((144 * currentBlockReward) * (hashPower / globalHashrate)) : 0;

  const formatHashrate = (rate: number) => {
    if (rate >= 1000000) return `${(rate / 1000000).toFixed(2)} PH/s`;
    if (rate >= 1000) return `${(rate / 1000).toFixed(2)} TH/s`;
    return `${rate.toFixed(2)} GH/s`;
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const diff = expires - now;
    
    if (diff <= 0) return "EXPIRED";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const totalUnclaimedReward = unclaimedBlocks?.reduce((sum: number, block: any) => 
    sum + parseFloat(block.reward), 0
  ) || 0;

  return (
    <div className="mobile-page bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Header */}
      <div className="mobile-header bg-black/80 backdrop-blur-lg border-b border-primary/20">
        <div>
          <h1 className="text-xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            MINING FACTORY
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            GBTC BLOCKCHAIN NETWORK
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground font-mono">BALANCE</p>
          <p className="text-lg font-display font-bold text-accent">
            {gbtcBalance.toFixed(8)} GBTC
          </p>
        </div>
      </div>

      <div className="mobile-content">
        {/* Mining Animation Section */}
        <Card className="mobile-card bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isMining ? 'bg-success animate-pulse' : 'bg-destructive'}`}></div>
                <span className="text-sm font-mono text-primary">
                  {isMining ? 'MINING ACTIVE' : 'MINING INACTIVE'}
                </span>
              </div>
              <span className="text-sm font-mono text-accent">
                {formatHashrate(hashPower)}
              </span>
            </div>

            {/* Golden Hammer Mining Animation */}
            <div className="flex justify-center my-6">
              <div className="relative">
                <motion.div
                  animate={hammerAnimation ? { rotate: -30, y: -10 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-6xl"
                >
                  🔨
                </motion.div>
                <motion.div
                  animate={isMining ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                >
                  <div className="w-16 h-3 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-sm shadow-lg"></div>
                </motion.div>
              </div>
            </div>

            {/* Hash Display */}
            {isMining && (
              <div className="bg-black/50 rounded-lg p-3 mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Hash className="w-4 h-4 text-primary" />
                  <span className="text-xs font-mono text-primary">CALCULATING HASHES</span>
                </div>
                <div className="font-mono text-[10px] text-green-400 break-all">
                  {currentHash}
                </div>
                <div className="mt-2 space-y-1">
                  {hashPool.map((hash, index) => (
                    <motion.div
                      key={`${hash}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1 - (index * 0.2), x: 0 }}
                      className="font-mono text-[9px] text-green-400/60 truncate"
                    >
                      {hash}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Network Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="mobile-card bg-black/50 border-primary/20">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-muted-foreground uppercase">Total Supply</span>
                <Award className="w-4 h-4 text-primary/50" />
              </div>
              <p className="text-lg font-bold text-primary">{(totalSupply / 1000000).toFixed(0)}M</p>
              <p className="text-[10px] text-muted-foreground">GBTC</p>
            </div>
          </Card>

          <Card className="mobile-card bg-black/50 border-accent/20">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-muted-foreground uppercase">Circulation</span>
                <TrendingUp className="w-4 h-4 text-accent/50" />
              </div>
              <p className="text-lg font-bold text-accent">{circulation.toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground">GBTC</p>
            </div>
          </Card>

          <Card className="mobile-card bg-black/50 border-chart-3/20">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-muted-foreground uppercase">Block Height</span>
                <Cpu className="w-4 h-4 text-chart-3/50" />
              </div>
              <p className="text-lg font-bold text-chart-3">#{blockHeight}</p>
              <p className="text-[10px] text-muted-foreground">CURRENT</p>
            </div>
          </Card>

          <Card className="mobile-card bg-black/50 border-warning/20">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-muted-foreground uppercase">Next Block</span>
                <Clock className="w-4 h-4 text-warning/50 animate-pulse" />
              </div>
              <p className="text-lg font-bold text-warning">{nextBlockTime}</p>
              <p className="text-[10px] text-muted-foreground">COUNTDOWN</p>
            </div>
          </Card>
        </div>

        {/* Personal Mining Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Card className="mobile-card bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <div className="p-2 text-center">
              <Zap className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">Network Share</p>
              <p className="text-sm font-bold text-primary">{networkShare.toFixed(4)}%</p>
            </div>
          </Card>

          <Card className="mobile-card bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
            <div className="p-2 text-center">
              <Hammer className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">Your Hashrate</p>
              <p className="text-sm font-bold text-accent">{formatHashrate(hashPower)}</p>
            </div>
          </Card>

          <Card className="mobile-card bg-gradient-to-br from-success/10 to-transparent border-success/20">
            <div className="p-2 text-center">
              <TrendingUp className="w-5 h-5 text-success mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">Est. Daily</p>
              <p className="text-sm font-bold text-success">{estimatedDaily.toFixed(4)}</p>
            </div>
          </Card>
        </div>

        {/* Unclaimed Blocks Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-mono text-primary">UNCLAIMED BLOCKS</p>
            {unclaimedBlocks && unclaimedBlocks.length > 1 && (
              <Button
                onClick={() => claimAllMutation.mutate()}
                disabled={claimAllMutation.isPending}
                size="sm"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                data-testid="button-claim-all"
              >
                {claimAllMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Award className="w-4 h-4 mr-2" />
                )}
                CLAIM ALL ({totalUnclaimedReward.toFixed(8)} GBTC)
              </Button>
            )}
          </div>

          {blocksLoading ? (
            <Card className="mobile-card bg-black/50 border-primary/20">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            </Card>
          ) : unclaimedBlocks && unclaimedBlocks.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {unclaimedBlocks.map((block: any) => (
                <Card 
                  key={block.id} 
                  className="mobile-card bg-gradient-to-r from-black/50 to-primary/5 border-primary/20"
                >
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded flex items-center justify-center">
                          <span className="text-xs font-bold">#{block.blockNumber}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary">BLOCK #{block.blockNumber}</p>
                          <p className="text-[9px] font-mono text-muted-foreground truncate max-w-[120px]">
                            {block.txHash}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-accent">
                          {parseFloat(block.reward).toFixed(8)}
                        </p>
                        <p className="text-[10px] text-primary">GBTC</p>
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
                          <>
                            <Award className="w-3 h-3 mr-1" />
                            CLAIM
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mobile-card bg-black/50 border-primary/20">
              <div className="text-center py-8">
                <Hammer className="w-10 h-10 text-muted-foreground mb-3 mx-auto" />
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
          <Card className="mobile-card bg-gradient-to-r from-destructive/10 to-destructive/5 border-destructive/30 mt-4">
            <div className="flex items-center space-x-3 p-3">
              <Zap className="w-6 h-6 text-destructive" />
              <div>
                <p className="text-sm font-semibold text-destructive">Mining Power Required</p>
                <p className="text-xs text-muted-foreground">
                  Purchase hashrate to start mining and earning GBTC rewards
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}