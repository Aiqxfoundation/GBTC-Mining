import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Cpu, TrendingUp, Clock, Zap, Award, Hash, Activity, Blocks, Binary, Shield, Sparkles, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

export default function MiningFactory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isMining, setIsMining] = useState(false);
  const [currentHash, setCurrentHash] = useState("");
  const [hashPool, setHashPool] = useState<string[]>([]);
  const [nextBlockTime, setNextBlockTime] = useState("00:00");
  const [miningProgress, setMiningProgress] = useState(0);
  const [blockAnimations, setBlockAnimations] = useState<number[]>([]);
  const [showNewBlock, setShowNewBlock] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [isBlockForm, setIsBlockForm] = useState(false);
  const [flyingCoins, setFlyingCoins] = useState<Array<{id: string, amount: number, x: number, y: number}>>([]);

  const hashPower = parseFloat(user?.hashPower || '0');
  const gbtcBalance = parseFloat(user?.gbtcBalance || '0');

  // Fetch global mining stats
  const { data: globalStats } = useQuery<{
    totalHashrate: number;
    blockHeight: number;
    totalBlocksMined: number;
    circulation: number;
    currentBlockReward: number;
    activeMiners: number;
  }>({
    queryKey: ["/api/global-stats"],
    staleTime: Infinity,
    gcTime: Infinity // Cache permanently
  });

  // Fetch unclaimed blocks
  const { data: unclaimedBlocks, isLoading: blocksLoading } = useQuery<Array<{
    id: string;
    blockNumber: number;
    reward: string;
    txHash: string;
    expiresAt: string;
    claimed: boolean;
  }>>({
    queryKey: ["/api/unclaimed-blocks"],
    staleTime: 300000, // Cache for 5 minutes
    gcTime: 600000,
    enabled: !!user,
  });

  // Mining animation effect
  useEffect(() => {
    if (hashPower > 0) {
      setIsMining(true);
    } else {
      setIsMining(false);
    }
  }, [hashPower]);

  // Transform to block form every 3-4 seconds
  useEffect(() => {
    if (!isMining) return;
    
    const interval = setInterval(() => {
      setIsBlockForm(true);
      setTimeout(() => {
        setIsBlockForm(false);
      }, 500); // Faster transform animation
    }, 2000); // More frequent transforms
    
    return () => clearInterval(interval);
  }, [isMining]);

  // Mining progress animation
  useEffect(() => {
    if (!isMining) {
      setMiningProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setMiningProgress(prev => {
        if (prev >= 100) {
          // Show block found animation
          setShowNewBlock(true);
          setTimeout(() => setShowNewBlock(false), 500); // Faster block animation
          
          // Add new block animation
          setBlockAnimations(prev => [...prev, Date.now()]);
          setTimeout(() => {
            setBlockAnimations(prev => prev.slice(1));
          }, 1000); // Faster block removal
          
          return 0;
        }
        return prev + (hashPower / 1000); // Progress based on hash power
      });
    }, 50); // Faster progress updates

    return () => clearInterval(interval);
  }, [isMining, hashPower]);

  // Nonce counter for mining simulation
  useEffect(() => {
    if (!isMining) return;
    
    const interval = setInterval(() => {
      setNonce(prev => prev + Math.floor(Math.random() * 100000));
    }, 100);
    
    return () => clearInterval(interval);
  }, [isMining]);

  // Generate realistic hash strings
  useEffect(() => {
    if (!isMining) return;

    const generateHash = () => {
      const chars = '0123456789abcdef';
      let hash = '0x';
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
      const res = await apiRequest("POST", `/api/claim-block/${blockId}`);
      return res.json();
    },
    onSuccess: (data, blockId) => {
      // Find the block that was claimed to get the reward amount
      const claimedBlock = unclaimedBlocks?.find((block: any) => block.id === blockId);
      if (claimedBlock) {
        // Get the position of the claim button
        const claimButton = document.querySelector(`[data-testid="button-claim-${blockId}"]`);
        if (claimButton) {
          const rect = claimButton.getBoundingClientRect();
          const gbtcBox = document.getElementById('gbtc-box');
          const gbtcRect = gbtcBox?.getBoundingClientRect();
          
          if (gbtcRect) {
            // Add flying coin animation
            setFlyingCoins(prev => [...prev, {
              id: `coin-${Date.now()}`,
              amount: parseFloat(claimedBlock.reward),
              x: rect.left - gbtcRect.left - gbtcRect.width / 2,
              y: rect.top - gbtcRect.top - gbtcRect.height / 2
            }]);
          }
        }
      }
      
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

  // Calculate mining stats based on mathematical distribution
  const totalSupply = 2100000; // 2.1M max supply
  const blockHeight = globalStats?.blockHeight || 1;
  const totalBlockHeight = globalStats?.totalBlockHeight || globalStats?.totalBlocksMined || blockHeight;
  const globalHashrate = globalStats?.totalHashrate || 0;
  const circulation = globalStats?.circulation || 0;
  const currentBlockReward = globalStats?.currentBlockReward || 50;
  const networkShare = globalHashrate > 0 ? ((hashPower / globalHashrate) * 100) : 0;
  const blocksPerDay = 24; // 1 hour per block = 24 blocks/day
  const estimatedDaily = globalHashrate > 0 ? ((blocksPerDay * currentBlockReward) * (hashPower / globalHashrate)) : 0;

  const formatHashrate = (rate: number) => {
    if (rate >= 1000000) return `${(rate / 1000000).toFixed(2)} PH/s`;
    if (rate >= 1000) return `${(rate / 1000).toFixed(2)} TH/s`;
    return `${rate.toFixed(2)} GH/s`;
  };

  const formatUTCTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toUTCString().replace('GMT', 'UTC');
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const diff = expires - now;
    
    if (diff <= 0) return "EXPIRED";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
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
      </div>

      <div className="mobile-content">
        {/* Mining Status - Professional Design */}
        <div className="bg-black/60 backdrop-blur-sm border border-gray-800 rounded-lg p-4 mb-3 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isMining ? 'bg-orange-500 animate-pulse' : 'bg-gray-600'}`}></div>
              <span className="text-[10px] font-mono text-gray-400 uppercase">
                {isMining ? 'Mining Active' : 'Inactive'}
              </span>
            </div>
            <span className="text-xs font-mono text-white">
              {formatHashrate(hashPower)}
            </span>
          </div>

          {/* Simplified Mining Visualization */}
          <div className="flex justify-center my-6">
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Minimalist Core */}
              <motion.div
                className={`w-20 h-20 rounded-full ${isMining ? 'bg-gradient-to-br from-orange-500 to-orange-600' : 'bg-gray-800'} flex items-center justify-center`}
                animate={isMining ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-2xl font-bold text-white">₿</span>
              </motion.div>
              
              {/* Simple Rings */}
              {isMining && (
                <>
                  {[0, 1].map((ring) => (
                    <motion.div
                      key={ring}
                      className="absolute rounded-full border border-orange-500/30"
                      initial={{ width: 80, height: 80, opacity: 0 }}
                      animate={{
                        width: [80, 120],
                        height: [80, 120],
                        opacity: [0.5, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: ring * 1
                      }}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
          
          {/* Mining Info Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] mt-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Height:</span>
              <span className="text-white font-mono">#{blockHeight}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Reward:</span>
              <span className="text-white font-mono">{currentBlockReward} GBTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Network:</span>
              <span className="text-white font-mono">{formatHashrate(globalHashrate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Your Share:</span>
              <span className="text-orange-500 font-mono">{networkShare.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Network Stats - Professional Bitcoin Design */}
        <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-lg p-3 mb-3">
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <p className="text-[9px] text-gray-500 uppercase font-mono mb-1">Supply</p>
              <p className="text-sm font-bold text-white">{(totalSupply / 1000000).toFixed(1)}M</p>
            </div>
            <div className="text-center border-l border-gray-800 pl-3">
              <p className="text-[9px] text-gray-500 uppercase font-mono mb-1">Circulation</p>
              <p className="text-sm font-bold text-white">{circulation.toFixed(0)}</p>
            </div>
            <div className="text-center border-l border-gray-800 pl-3">
              <p className="text-[9px] text-gray-500 uppercase font-mono mb-1">Height</p>
              <p className="text-sm font-bold text-white">#{blockHeight}</p>
            </div>
            <div className="text-center border-l border-gray-800 pl-3">
              <p className="text-[9px] text-gray-500 uppercase font-mono mb-1">Next</p>
              <p className="text-sm font-bold text-white">{nextBlockTime}</p>
            </div>
          </div>
        </div>

        {/* GBTC Balance - Professional Orange Accent */}
        <div className="bg-black/60 backdrop-blur-sm border border-gray-800 rounded-lg p-4 mb-4 relative" id="gbtc-box">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">₿</span>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-mono">GBTC Balance</p>
                <motion.p 
                  className="text-xl font-bold text-orange-500"
                  key={gbtcBalance}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {gbtcBalance.toFixed(6)}
                </motion.p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase">Value</p>
              <p className="text-sm font-bold text-white">${(gbtcBalance * 0.001).toFixed(2)}</p>
            </div>
          </div>
          
          {/* Flying Coins - Minimalist */}
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            {flyingCoins.map((coin) => (
              <motion.div
                key={coin.id}
                className="absolute"
                initial={{ 
                  x: coin.x, 
                  y: coin.y, 
                  scale: 0.5,
                  opacity: 0
                }}
                animate={{
                  x: [coin.x, 0],
                  y: [coin.y, -20],
                  scale: [0.5, 1, 0.8],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 1.5,
                  ease: "easeOut"
                }}
                onAnimationComplete={() => {
                  setFlyingCoins(prev => prev.filter(c => c.id !== coin.id));
                }}
                style={{ 
                  left: '50%', 
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xs">₿</span>
                </div>
                <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] font-bold px-1 py-0.5 rounded">
                  +{coin.amount.toFixed(2)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Personal Mining Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <Card className="mobile-card bg-gradient-to-br from-yellow-900/20 to-transparent border-yellow-500/30">
            <div className="p-1.5 text-center">
              <Zap className="w-4 h-4 text-yellow-400 mx-auto mb-0.5" />
              <p className="text-[8px] text-yellow-200/70">Share</p>
              <p className="text-[11px] font-bold text-yellow-400">{networkShare.toFixed(2)}%</p>
            </div>
          </Card>

          <Card className="mobile-card bg-gradient-to-br from-yellow-900/20 to-transparent border-yellow-500/30">
            <div className="p-1.5 text-center">
              <Cpu className="w-4 h-4 text-yellow-400 mx-auto mb-0.5" />
              <p className="text-[8px] text-yellow-200/70">Power</p>
              <p className="text-[11px] font-bold text-yellow-400">{formatHashrate(hashPower)}</p>
            </div>
          </Card>

          <Card className="mobile-card bg-gradient-to-br from-yellow-900/20 to-transparent border-yellow-500/30">
            <div className="p-1.5 text-center">
              <TrendingUp className="w-4 h-4 text-yellow-400 mx-auto mb-0.5" />
              <p className="text-[8px] text-yellow-200/70">Daily ⃿</p>
              <p className="text-[11px] font-bold text-yellow-400">{estimatedDaily.toFixed(3)}</p>
            </div>
          </Card>
        </div>

        {/* Pending Rewards - Clean List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-mono text-gray-400 uppercase">Pending Rewards</p>
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
              {unclaimedBlocks.map((block: any, index: number) => (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Clean Line Item Design for Blocks */}
                  <div className="bg-black/40 backdrop-blur-sm border-l-2 border-orange-500 p-3 mb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-900 border border-gray-700 rounded flex items-center justify-center">
                          <span className="text-orange-500 font-bold text-xs">₿</span>
                        </div>
                        <div>
                          <p className="text-xs font-mono text-white">Block #{block.blockNumber}</p>
                          <p className="text-[9px] text-gray-500">
                            {formatUTCTime(block.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-sm font-bold text-orange-500">
                            {parseFloat(block.reward).toFixed(4)}
                          </p>
                          <p className="text-[9px] text-gray-500 uppercase">GBTC</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                            getTimeRemaining(block.expiresAt) === 'EXPIRED' 
                              ? 'bg-red-900/30 text-red-400' 
                              : 'bg-gray-800 text-gray-400'
                          }`}>
                            {getTimeRemaining(block.expiresAt)}
                          </div>
                          
                          <button
                            onClick={() => claimBlockMutation.mutate(block.id)}
                            disabled={
                              claimBlockMutation.isPending || 
                              getTimeRemaining(block.expiresAt) === 'EXPIRED'
                            }
                            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-800 disabled:text-gray-600 text-white px-3 py-1 rounded text-[10px] font-bold transition-colors"
                            data-testid={`button-claim-${block.id}`}
                          >
                            {claimBlockMutation.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              'CLAIM'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="mobile-card bg-black/50 border-primary/20">
              <div className="text-center py-8">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block"
                >
                  <Blocks className="w-10 h-10 text-muted-foreground mb-3 mx-auto" />
                </motion.div>
                <p className="text-sm text-muted-foreground">No blocks to claim</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {hashPower > 0 
                    ? "New blocks appear every 1 hour" 
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