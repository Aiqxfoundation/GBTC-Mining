import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Cpu, TrendingUp, Clock, Zap, Award, Hash, Activity, Blocks, Binary, Shield, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    refetchInterval: 5000,
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
    refetchInterval: 30000, // Check every 30 seconds instead of 10
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
          setTimeout(() => setShowNewBlock(false), 2000);
          
          // Add new block animation
          setBlockAnimations(prev => [...prev, Date.now()]);
          setTimeout(() => {
            setBlockAnimations(prev => prev.slice(1));
          }, 3000);
          
          return 0;
        }
        return prev + (hashPower / 1000); // Progress based on hash power
      });
    }, 100);

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

            {/* Pickaxe Mining Animation */}
            <div className="flex justify-center my-6 relative">
              <div className="relative w-48 h-48 flex items-center justify-center">
                
                {/* Star burst effects at top */}
                {isMining && (
                  <>
                    <motion.div
                      className="absolute top-8 left-1/2 -translate-x-8"
                      animate={{
                        opacity: [0.5, 1, 0.5],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <div className="relative">
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-16 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"
                            style={{
                              transform: `rotate(${i * 45}deg)`,
                              transformOrigin: 'center',
                            }}
                          />
                        ))}
                        <div className="absolute -inset-2 bg-white rounded-full blur-xl opacity-60"></div>
                      </div>
                    </motion.div>
                    
                    <motion.div
                      className="absolute top-8 left-1/2 translate-x-8"
                      animate={{
                        opacity: [0.5, 1, 0.5],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5,
                      }}
                    >
                      <div className="relative">
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-16 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"
                            style={{
                              transform: `rotate(${i * 45}deg)`,
                              transformOrigin: 'center',
                            }}
                          />
                        ))}
                        <div className="absolute -inset-2 bg-white rounded-full blur-xl opacity-60"></div>
                      </div>
                    </motion.div>
                  </>
                )}

                {/* Circular gear border with pickaxe */}
                <motion.div
                  className="relative w-32 h-32"
                  animate={isMining ? {
                    rotate: [0, 360],
                  } : {}}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  {/* Outer gear teeth */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 128 128">
                    <g transform="translate(64, 64)">
                      {[...Array(8)].map((_, i) => (
                        <rect
                          key={i}
                          x="-6"
                          y="-60"
                          width="12"
                          height="20"
                          rx="2"
                          fill="url(#orangeGradient)"
                          transform={`rotate(${i * 45})`}
                          opacity={isMining ? 1 : 0.5}
                        />
                      ))}
                      <circle
                        cx="0"
                        cy="0"
                        r="50"
                        fill="none"
                        stroke="url(#orangeGradient)"
                        strokeWidth="3"
                        opacity={isMining ? 1 : 0.5}
                      />
                    </g>
                    <defs>
                      <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="50%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ea580c" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Central pickaxe icon */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={isMining ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, -10, 10, 0],
                    } : {}}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="relative">
                      {/* Pickaxe shape */}
                      <svg width="60" height="60" viewBox="0 0 60 60" className="drop-shadow-2xl">
                        <g transform="translate(30, 30)">
                          {/* Handle */}
                          <rect
                            x="-3"
                            y="-20"
                            width="6"
                            height="40"
                            fill="#8b4513"
                            rx="2"
                          />
                          {/* Pickaxe head - left */}
                          <path
                            d="M -20 -15 L -5 -10 L -5 -5 L -20 0 Z"
                            fill="url(#pickGradient)"
                          />
                          {/* Pickaxe head - right */}
                          <path
                            d="M 20 -15 L 5 -10 L 5 -5 L 20 0 Z"
                            fill="url(#pickGradient)"
                          />
                          {/* Center connector */}
                          <rect
                            x="-8"
                            y="-12"
                            width="16"
                            height="8"
                            fill="url(#pickGradient)"
                            rx="1"
                          />
                        </g>
                        <defs>
                          <linearGradient id="pickGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="50%" stopColor="#f97316" />
                            <stop offset="100%" stopColor="#dc2626" />
                          </linearGradient>
                        </defs>
                      </svg>
                      
                      {/* Glow effect */}
                      {isMining && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          animate={{
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                          }}
                        >
                          <div className="w-20 h-20 bg-orange-500 rounded-full blur-2xl opacity-50"></div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>

                {/* Mining particles */}
                {isMining && (
                  <>
                    {[...Array(12)].map((_, index) => (
                      <motion.div
                        key={`particle-${index}`}
                        className="absolute"
                        initial={{
                          x: 0,
                          y: 0,
                          opacity: 0,
                        }}
                        animate={{
                          x: [0, (Math.random() - 0.5) * 100],
                          y: [0, (Math.random() - 0.5) * 100],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.2,
                          ease: "easeOut",
                        }}
                      >
                        <div className="w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg"></div>
                      </motion.div>
                    ))}
                  </>
                )}

                {/* Block found animation */}
                <AnimatePresence>
                  {showNewBlock && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 1 }}
                      exit={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <div className="bg-success/20 rounded-lg p-4 border-2 border-success">
                        <Sparkles className="w-8 h-8 text-success" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mining progress ring */}
                {isMining && (
                  <svg className="absolute inset-0 w-32 h-32 -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-primary/20"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="60"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-accent"
                      strokeDasharray={`${(miningProgress / 100) * 377} 377`}
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>

              {/* Mined blocks floating animation */}
              <AnimatePresence>
                {blockAnimations.map((timestamp) => (
                  <motion.div
                    key={timestamp}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                    animate={{ 
                      x: Math.random() * 200 - 100, 
                      y: -150, 
                      opacity: 0,
                      scale: 1
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 3 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-success to-accent rounded shadow-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Mining Stats */}
            {isMining && (
              <div className="bg-black/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-primary">NONCE:</span>
                  <span className="text-accent">{nonce.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-primary">DIFFICULTY:</span>
                  <span className="text-accent">0x{Math.floor(Math.random() * 1000000).toString(16)}</span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: `${miningProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>
            )}

            {/* Hash Display */}
            {isMining && (
              <div className="bg-black/50 rounded-lg p-3 mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Hash className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-xs font-mono text-primary">CALCULATING HASHES</span>
                  <Activity className="w-3 h-3 text-accent animate-pulse" />
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
              <Cpu className="w-5 h-5 text-accent mx-auto mb-1" />
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
              {unclaimedBlocks.map((block: any, index: number) => (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="mobile-card bg-gradient-to-r from-black/50 to-primary/5 border-primary/20 overflow-hidden">
                    <div className="p-3 relative">
                      {/* Block pattern background */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="grid grid-cols-8 h-full">
                          {[...Array(8)].map((_, i) => (
                            <div key={i} className="border-r border-primary/20"></div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <motion.div 
                              className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg"
                              animate={{ rotate: [0, 5, -5, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Blocks className="w-5 h-5 text-white" />
                            </motion.div>
                            <div>
                              <p className="text-sm font-bold text-primary">BLOCK #{block.blockNumber}</p>
                              <p className="text-[9px] font-mono text-muted-foreground truncate max-w-[120px]">
                                {block.txHash}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <motion.p 
                              className="text-base font-bold text-accent"
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {parseFloat(block.reward).toFixed(8)}
                            </motion.p>
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
                    </div>
                  </Card>
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