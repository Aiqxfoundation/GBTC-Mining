import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
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

  // Calculate hashrate display
  // Improved hashrate calculations with better mathematics
  const userHashrate = parseFloat(user?.hashPower || '0');
  const globalHashrate = 584732.50; // Base global hashrate in GH/s
  const networkGrowthFactor = 1.0012; // 0.12% hourly growth
  const currentHour = new Date().getHours();
  const dynamicGlobalHashrate = globalHashrate * Math.pow(networkGrowthFactor, currentHour);
  
  const getHashrateDisplay = (hashrate: number) => {
    if (hashrate >= 1000000) return `${(hashrate / 1000000).toFixed(3)} PH/s`;
    if (hashrate >= 1000) return `${(hashrate / 1000).toFixed(3)} TH/s`;
    if (hashrate >= 1) return `${hashrate.toFixed(2)} GH/s`;
    return `${(hashrate * 1000).toFixed(0)} MH/s`;
  };
  
  // Calculate user's mining share more accurately
  const userMiningShare = userHashrate > 0 ? (userHashrate / dynamicGlobalHashrate) * 100 : 0;
  const estimatedDailyRewards = userHashrate > 0 ? (userMiningShare / 100) * 6.25 * 144 : 0; // 144 blocks per day

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bitcoin-grid opacity-30"></div>
      
      {/* Hash Streams */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="hash-stream"
          style={{
            left: `${20 * i + 10}%`,
            animationDelay: `${i * 1.5}s`,
            fontSize: '0.6rem',
            opacity: 0.15
          }}
        >
          {currentHash}
        </div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 p-4 space-y-6">
        {/* Global Network Header */}
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-dot bg-red-500"></div>
            <div className="terminal-dot bg-yellow-500"></div>
            <div className="terminal-dot bg-green-500"></div>
            <span className="ml-2 text-xs text-muted-foreground">GBTC Global Network Monitor</span>
          </div>
          <div className="terminal-content">
            <div className="text-green-500 font-mono text-xs space-y-1">
              <div className="text-primary">[{new Date().toLocaleTimeString()}] GLOBAL NETWORK STATUS</div>
              <div>[NETWORK] Active Miners: {activeMiners.toLocaleString()}</div>
              <div>[BLOCKS] Generated Today: {blocksToday}</div>
              <div>[HASH] Network Hash: 0x{currentHash.substring(0, 16)}...</div>
              <div>[SUPPLY] Mined: {((networkStats.circulating / networkStats.totalSupply) * 100).toFixed(2)}% of 21M</div>
            </div>
          </div>
        </div>

        {/* Global Statistics Grid */}
        <Card className="mining-block">
          <h2 className="text-sm font-heading font-bold text-muted-foreground uppercase tracking-wider mb-4">
            🌍 Global Network Statistics
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="data-card">
              <div className="stat-label">Total Hashrate</div>
              <div className="stat-value text-primary">{networkStats.hashrate}</div>
            </div>
            <div className="data-card">
              <div className="stat-label">Active Miners</div>
              <div className="stat-value text-accent">{activeMiners.toLocaleString()}</div>
            </div>
            <div className="data-card">
              <div className="stat-label">Block Height</div>
              <div className="stat-value text-chart-3">#{networkStats.blockHeight.toLocaleString()}</div>
            </div>
            <div className="data-card">
              <div className="stat-label">Network Difficulty</div>
              <div className="stat-value text-chart-4">{networkStats.difficulty}</div>
            </div>
            <div className="data-card">
              <div className="stat-label">Total Deposits</div>
              <div className="stat-value text-accent">${(totalDeposits / 1000).toFixed(1)}K</div>
            </div>
            <div className="data-card">
              <div className="stat-label">Blocks Today</div>
              <div className="stat-value text-primary">{blocksToday}</div>
            </div>
          </div>
        </Card>

        {/* Supply Progress */}
        <Card className="mining-block">
          <h3 className="text-sm font-heading font-bold text-muted-foreground uppercase tracking-wider mb-3">
            📊 GBTC Supply Progress
          </h3>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Circulating Supply</span>
              <span className="text-sm font-mono text-primary">
                {(networkStats.circulating / 1000000).toFixed(2)}M / 21M GBTC
              </span>
            </div>
            <div className="h-4 bg-background rounded-full overflow-hidden border border-border">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                style={{ width: `${(networkStats.circulating / networkStats.totalSupply) * 100}%` }}
              >
                <div className="h-full bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              🏁 Exchange listing at 25% (5.25M GBTC)
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-background">
              <div className="text-lg font-mono font-bold text-chart-2">{((networkStats.circulating / networkStats.totalSupply) * 100).toFixed(2)}%</div>
              <div className="text-xs text-muted-foreground">Mined</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-background">
              <div className="text-lg font-mono font-bold text-chart-3">6.25</div>
              <div className="text-xs text-muted-foreground">Per Block</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-background">
              <div className="text-lg font-mono font-bold text-chart-4">10min</div>
              <div className="text-xs text-muted-foreground">Block Time</div>
            </div>
          </div>
        </Card>

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            className="btn-primary h-auto py-4"
            onClick={() => setLocation('/mining')}
          >
            <div className="text-center">
              <i className="fas fa-cube text-2xl mb-2"></i>
              <div className="text-sm font-heading">My Dashboard</div>
              <div className="text-xs text-primary-foreground/70">View your mining stats</div>
            </div>
          </Button>
          <Button 
            className="btn-secondary h-auto py-4"
            onClick={() => setLocation('/power')}
          >
            <div className="text-center">
              <i className="fas fa-bolt text-2xl mb-2"></i>
              <div className="text-sm font-heading">Purchase Power</div>
              <div className="text-xs text-muted-foreground">Upgrade hashrate</div>
            </div>
          </Button>
        </div>

        {/* Global Live Feed */}
        <Card className="mining-block">
          <h3 className="text-sm font-heading font-bold text-muted-foreground uppercase tracking-wider mb-3">
            🌐 Global Network Activity
          </h3>
          <div className="space-y-2">
            {[
              { type: 'block', icon: 'fa-cube', text: `Block #${networkStats.blockHeight} mined`, time: 'Just now', color: 'text-primary' },
              { type: 'reward', icon: 'fa-coins', text: '6.25 GBTC distributed to miners', time: '2 mins ago', color: 'text-accent' },
              { type: 'miner', icon: 'fa-user-plus', text: 'New miner from USA joined', time: '3 mins ago', color: 'text-chart-3' },
              { type: 'deposit', icon: 'fa-wallet', text: '$500 USDT deposited', time: '5 mins ago', color: 'text-chart-4' },
              { type: 'power', icon: 'fa-bolt', text: '1000 GH/s purchased', time: '7 mins ago', color: 'text-primary' },
              { type: 'difficulty', icon: 'fa-chart-line', text: 'Difficulty adjusted +2.1%', time: '1 hour ago', color: 'text-accent' },
            ].map((item, i) => (
              <div key={i} className="flex items-center space-x-3 p-2 rounded-lg bg-background/50 animate-fade-in-up" style={{animationDelay: `${i * 0.1}s`}}>
                <i className={`fas ${item.icon} ${item.color}`}></i>
                <div className="flex-1">
                  <div className="text-xs font-medium">{item.text}</div>
                  <div className="text-xs text-muted-foreground">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Updated Tokenomics */}
        <Card className="mining-block">
          <h3 className="text-sm font-heading font-bold text-muted-foreground uppercase tracking-wider mb-4">
            GBTC Distribution Protocol
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-xs font-heading uppercase">Lifetime Mobile Mining</span>
              </div>
              <span className="font-mono font-bold text-primary">60%</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-chart-4 rounded-full"></div>
                <span className="text-xs font-heading uppercase">Early Mining Rewards</span>
              </div>
              <span className="font-mono font-bold text-chart-4">25%</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-xs font-heading uppercase">Exchange Listings</span>
              </div>
              <span className="font-mono font-bold text-accent">10%</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-chart-3 rounded-full"></div>
                <span className="text-xs font-heading uppercase">Reserve Fund</span>
              </div>
              <span className="font-mono font-bold text-chart-3">5%</span>
            </div>
          </div>
        </Card>

        {/* Mining Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="data-card">
            <div className="text-xs text-muted-foreground mb-1">24h Volume</div>
            <div className="text-lg font-mono font-bold text-gradient">$2.4M</div>
            <div className="text-xs text-accent">+12.5%</div>
          </Card>
          <Card className="data-card">
            <div className="text-xs text-muted-foreground mb-1">Total Miners</div>
            <div className="text-lg font-mono font-bold text-gradient">1,847</div>
            <div className="text-xs text-accent">+47 today</div>
          </Card>
          <Card className="data-card">
            <div className="text-xs text-muted-foreground mb-1">Blocks Today</div>
            <div className="text-lg font-mono font-bold text-gradient">87</div>
            <div className="text-xs text-muted-foreground">~10 min/block</div>
          </Card>
          <Card className="data-card">
            <div className="text-xs text-muted-foreground mb-1">Hash/USD Rate</div>
            <div className="text-lg font-mono font-bold text-gradient">1 GH/s</div>
            <div className="text-xs text-muted-foreground">= 1 USDT</div>
          </Card>
        </div>
      </div>
    </div>
  );
}