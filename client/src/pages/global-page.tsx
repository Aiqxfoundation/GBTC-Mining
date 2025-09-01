import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Activity, TrendingUp, Users, Zap, Globe, Clock, Coins, Database } from "lucide-react";
import { motion } from "framer-motion";

export default function GlobalPage() {
  const [currentHash, setCurrentHash] = useState("");
  const [activeMiners, setActiveMiners] = useState(1847);
  const [totalDeposits, setTotalDeposits] = useState(584732.50);
  const [blocksToday, setBlocksToday] = useState(87);
  const [networkStats, setNetworkStats] = useState({
    difficulty: "53.91T",
    hashrate: "584.73 PH/s",
    blockHeight: 871234,
    totalSupply: 21000000,
    circulating: 1312500,
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

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMiners(prev => prev + Math.floor(Math.random() * 3) - 1);
      setBlocksToday(prev => prev + (Math.random() > 0.9 ? 1 : 0));
      setNetworkStats(prev => ({
        ...prev,
        blockHeight: prev.blockHeight + (Math.random() > 0.9 ? 1 : 0),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-500">Online</span>
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
              <div className="text-green-400">[NETWORK] Active Miners: {activeMiners.toLocaleString()}</div>
              <div className="text-blue-400">[BLOCKS] Generated Today: {blocksToday}</div>
              <div className="text-yellow-400">[HASH] Network Hash: 0x{currentHash.substring(0, 16)}...</div>
              <div className="text-purple-400">[SUPPLY] Mined: {((networkStats.circulating / networkStats.totalSupply) * 100).toFixed(2)}% of 21M</div>
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
          <Card className="bg-gradient-to-br from-[#f7931a]/10 to-transparent border-[#f7931a]/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-[#f7931a]" />
              <span className="text-xs text-green-400">+2.3%</span>
            </div>
            <div className="text-sm text-gray-500">Total Hashrate</div>
            <div className="text-xl font-bold text-[#f7931a]">{networkStats.hashrate}</div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-green-500" />
              <span className="text-xs text-green-400">+47</span>
            </div>
            <div className="text-sm text-gray-500">Active Miners</div>
            <div className="text-xl font-bold text-green-500">{activeMiners.toLocaleString()}</div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <Database className="w-5 h-5 text-purple-500" />
              <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
            </div>
            <div className="text-sm text-gray-500">Block Height</div>
            <div className="text-xl font-bold text-purple-500">#{networkStats.blockHeight.toLocaleString()}</div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span className="text-xs text-gray-400">53.91T</span>
            </div>
            <div className="text-sm text-gray-500">Network Difficulty</div>
            <div className="text-xl font-bold text-blue-500">{networkStats.difficulty}</div>
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
                  {(networkStats.circulating / 1000000).toFixed(2)}M / 21M GBTC
                </span>
              </div>
              <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#f7931a] to-[#ff9416]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(networkStats.circulating / networkStats.totalSupply) * 100}%` }}
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
                <div className="text-lg font-bold text-[#f7931a]">{((networkStats.circulating / networkStats.totalSupply) * 100).toFixed(2)}%</div>
                <div className="text-xs text-gray-500">Mined</div>
              </div>
              <div className="text-center p-2 rounded bg-gray-900">
                <div className="text-lg font-bold text-green-500">6.25</div>
                <div className="text-xs text-gray-500">Per Block</div>
              </div>
              <div className="text-center p-2 rounded bg-gray-900">
                <div className="text-lg font-bold text-purple-500">10min</div>
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
            <div className="text-xs text-gray-500 mb-1">Total Deposits</div>
            <div className="text-lg font-bold text-accent">${(totalDeposits / 1000).toFixed(1)}K</div>
          </Card>
          <Card className="bg-gray-950 border-gray-800 p-3">
            <div className="text-xs text-gray-500 mb-1">Blocks Today</div>
            <div className="text-lg font-bold text-primary">{blocksToday}</div>
          </Card>
          <Card className="bg-gray-950 border-gray-800 p-3">
            <div className="text-xs text-gray-500 mb-1">24h Volume</div>
            <div className="text-lg font-bold text-green-500">$2.4M</div>
          </Card>
          <Card className="bg-gray-950 border-gray-800 p-3">
            <div className="text-xs text-gray-500 mb-1">Hash/USD Rate</div>
            <div className="text-lg font-bold text-purple-500">1 GH/s = 1 USDT</div>
          </Card>
        </motion.div>

        {/* Live Activity Feed */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gray-950 border-gray-800 p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              Network Activity
            </h3>
            <div className="space-y-2">
              {[
                { type: 'block', text: `Block #${networkStats.blockHeight} mined`, time: 'Just now', color: 'text-[#f7931a]' },
                { type: 'reward', text: '6.25 GBTC distributed', time: '2 mins ago', color: 'text-green-500' },
                { type: 'miner', text: 'New miner joined', time: '3 mins ago', color: 'text-purple-500' },
                { type: 'deposit', text: '$500 USDT deposited', time: '5 mins ago', color: 'text-blue-500' },
                { type: 'power', text: '1000 GH/s purchased', time: '7 mins ago', color: 'text-[#f7931a]' },
                { type: 'difficulty', text: 'Difficulty adjusted +2.1%', time: '1 hour ago', color: 'text-red-500' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                  className="flex items-center justify-between p-2 rounded bg-gray-900"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.color.replace('text-', 'bg-')}`}></div>
                    <span className="text-xs text-gray-400">{item.text}</span>
                  </div>
                  <span className="text-xs text-gray-600">{item.time}</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes slideLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}