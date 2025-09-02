import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Activity, TrendingUp, Users, Zap, Globe, Clock, Coins, Database, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

interface GlobalStats {
  userCount: number;
  totalDeposits: string;
  activeMinerCount: number;
  totalHashPower: number;
  hashRateDisplay: string;
  blockHeight: number;
  blockReward: number;
  circulatingSupply: number;
  maxSupply: number;
  supplyProgress: number;
  blocksToday: number;
  networkDifficulty: string;
  blockTime: string;
  nextHalving: number;
  halvingProgress: number;
}

export default function GlobalPage() {
  const [currentHash, setCurrentHash] = useState("");

  // Fetch real global statistics
  const { data: stats, isLoading } = useQuery<GlobalStats>({
    queryKey: ["/api/global-stats"],
    refetchInterval: 5000, // Refresh every 5 seconds for live updates
  });

  // Generate random hash for visual effect
  useEffect(() => {
    const interval = setInterval(() => {
      const hash = Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      setCurrentHash(hash);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#f7931a] animate-spin" />
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatUSDT = (amount: string) => {
    const num = parseFloat(amount || '0');
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0" 
          style={{ 
            backgroundImage: `repeating-linear-gradient(0deg, #f7931a 0, #f7931a 1px, transparent 1px, transparent 40px),
                             repeating-linear-gradient(90deg, #f7931a 0, #f7931a 1px, transparent 1px, transparent 40px)`,
            backgroundSize: '40px 40px'
          }}>
        </div>
      </div>

      {/* Hash Streams Background */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="fixed text-[#f7931a] opacity-5 font-mono text-xs overflow-hidden"
          style={{
            top: `${30 * i + 20}%`,
            left: 0,
            right: 0,
            animation: `slideLeft ${20 + i * 5}s linear infinite`,
          }}
        >
          {currentHash.repeat(10)}
        </div>
      ))}

      <div className="relative z-10 p-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Globe className="w-6 h-6 text-[#f7931a]" />
                Global Network
              </h1>
              <p className="text-sm text-gray-500">Real-time mining statistics</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Network Status</div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-[#f7931a] rounded-full animate-pulse"></div>
                <span className="text-sm text-[#f7931a]">Online</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Live Terminal */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="bg-gray-950 border-gray-800 p-0 overflow-hidden">
            <div className="bg-gray-900 px-3 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-xs text-gray-500 font-mono">GBTC Network Monitor</span>
            </div>
            <div className="p-4 font-mono text-xs space-y-1">
              <div className="text-[#f7931a]">[{new Date().toLocaleTimeString()}] GLOBAL NETWORK STATUS</div>
              <div className="text-gray-400">[NETWORK] Active Miners: {stats?.activeMinerCount || 0}</div>
              <div className="text-gray-400">[BLOCKS] Generated Today: {stats?.blocksToday || 0}</div>
              <div className="text-[#f7931a]">[HASH] Current Block: #{stats?.blockHeight || 1}</div>
              <div className="text-gray-400">[SUPPLY] Mined: {stats?.supplyProgress?.toFixed(4) || 0}% of 21M</div>
              <div className="text-[#f7931a]">[POWER] Total Hash: {stats?.hashRateDisplay || '0 GH/s'}</div>
            </div>
          </Card>
        </motion.div>

        {/* Main Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <Card className="bg-gray-950 border-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-[#f7931a]" />
              <Activity className="w-4 h-4 text-[#f7931a] animate-pulse" />
            </div>
            <div className="text-sm text-gray-500">Total Hashrate</div>
            <div className="text-xl font-bold text-[#f7931a]">{stats?.hashRateDisplay || '0 GH/s'}</div>
          </Card>

          <Card className="bg-gray-950 border-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-[#f7931a]" />
              <span className="text-xs text-[#f7931a]">LIVE</span>
            </div>
            <div className="text-sm text-gray-500">Active Miners</div>
            <div className="text-xl font-bold text-white">{stats?.activeMinerCount || 0}</div>
          </Card>

          <Card className="bg-gray-950 border-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <Database className="w-5 h-5 text-[#f7931a]" />
              <Activity className="w-4 h-4 text-[#f7931a] animate-pulse" />
            </div>
            <div className="text-sm text-gray-500">Block Height</div>
            <div className="text-xl font-bold text-white">#{stats?.blockHeight || 1}</div>
          </Card>

          <Card className="bg-gray-950 border-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-[#f7931a]" />
              <span className="text-xs text-gray-400">{stats?.networkDifficulty || '0T'}</span>
            </div>
            <div className="text-sm text-gray-500">Network Difficulty</div>
            <div className="text-xl font-bold text-white">{stats?.networkDifficulty || '0T'}</div>
          </Card>
        </motion.div>

        {/* Supply Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <Card className="bg-gray-950 border-gray-800 p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#f7931a]" />
              GBTC Supply Progress
            </h3>
            
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-xs text-gray-500">Circulating Supply</span>
                <span className="text-xs font-mono text-[#f7931a]">
                  {formatNumber(stats?.circulatingSupply || 0)} / 21M GBTC
                </span>
              </div>
              <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#f7931a] to-[#ff9416]"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(stats?.supplyProgress || 0, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <div className="h-full bg-white/20 animate-pulse"></div>
                </motion.div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                🏁 Exchange listing at 25% (5.25M GBTC)
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 rounded bg-gray-900">
                <div className="text-lg font-bold text-[#f7931a]">{stats?.supplyProgress?.toFixed(4) || 0}%</div>
                <div className="text-xs text-gray-500">Mined</div>
              </div>
              <div className="text-center p-2 rounded bg-gray-900">
                <div className="text-lg font-bold text-[#f7931a]">{stats?.blockReward || 6.25}</div>
                <div className="text-xs text-gray-500">Per Block</div>
              </div>
              <div className="text-center p-2 rounded bg-gray-900">
                <div className="text-lg font-bold text-white">10min</div>
                <div className="text-xs text-gray-500">Block Time</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Additional Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <Card className="bg-gray-950 border-gray-800 p-3">
            <div className="text-xs text-gray-500 mb-1">Total Users</div>
            <div className="text-lg font-bold text-[#f7931a]">{stats?.userCount || 0}</div>
          </Card>
          <Card className="bg-gray-950 border-gray-800 p-3">
            <div className="text-xs text-gray-500 mb-1">Total Deposits</div>
            <div className="text-lg font-bold text-[#f7931a]">{formatUSDT(stats?.totalDeposits || '0')}</div>
          </Card>
          <Card className="bg-gray-950 border-gray-800 p-3">
            <div className="text-xs text-gray-500 mb-1">Blocks Today</div>
            <div className="text-lg font-bold text-white">{stats?.blocksToday || 0}</div>
          </Card>
          <Card className="bg-gray-950 border-gray-800 p-3">
            <div className="text-xs text-gray-500 mb-1">Hash/USD Rate</div>
            <div className="text-lg font-bold text-[#f7931a]">1 GH/s = 1 USDT</div>
          </Card>
        </motion.div>

        {/* Network Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gray-950 border-gray-800 p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#f7931a]" />
              Network Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between p-2 rounded bg-gray-900">
                <span className="text-xs text-gray-400">Total Hash Power</span>
                <span className="text-xs text-[#f7931a] font-mono">{stats?.totalHashPower?.toFixed(2) || 0} GH/s</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-gray-900">
                <span className="text-xs text-gray-400">Current Block</span>
                <span className="text-xs text-white font-mono">#{stats?.blockHeight || 1}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-gray-900">
                <span className="text-xs text-gray-400">Block Reward</span>
                <span className="text-xs text-[#f7931a] font-mono">{stats?.blockReward || 6.25} GBTC</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-gray-900">
                <span className="text-xs text-gray-400">Next Halving</span>
                <span className="text-xs text-white font-mono">Block #{stats?.nextHalving || 210000}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-gray-900">
                <span className="text-xs text-gray-400">Halving Progress</span>
                <span className="text-xs text-[#f7931a] font-mono">{stats?.halvingProgress?.toFixed(1) || 0}%</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-gray-900">
                <span className="text-xs text-gray-400">Registered Users</span>
                <span className="text-xs text-white font-mono">{stats?.userCount || 0}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}