import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [currentHash, setCurrentHash] = useState("");
  const [networkStats, setNetworkStats] = useState({
    difficulty: "53.91T",
    hashrate: "584.73 EH/s",
    blockHeight: 871234,
    nextHalving: 420000,
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
  const userHashrate = parseFloat(user?.hashPower || '0');
  const getHashrateDisplay = (hashrate: number) => {
    if (hashrate >= 1000000) return `${(hashrate / 1000000).toFixed(2)} PH/s`;
    if (hashrate >= 1000) return `${(hashrate / 1000).toFixed(2)} TH/s`;
    return `${hashrate.toFixed(2)} GH/s`;
  };

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
        {/* Header Terminal */}
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-dot bg-red-500"></div>
            <div className="terminal-dot bg-yellow-500"></div>
            <div className="terminal-dot bg-green-500"></div>
            <span className="ml-2 text-xs text-muted-foreground">GBTC Mining Node v2.0.1</span>
          </div>
          <div className="terminal-content">
            <div className="text-green-500 font-mono text-xs space-y-1">
              <div>[{new Date().toLocaleTimeString()}] Mining operation active...</div>
              <div>[SYSTEM] Connected to network: MAINNET</div>
              <div>[HASH] Current: 0x{currentHash.substring(0, 16)}...</div>
              <div>[USER] Wallet: {user?.username || 'anonymous'}</div>
            </div>
          </div>
        </div>

        {/* Network Status Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="data-card">
            <div className="stat-label">Network Difficulty</div>
            <div className="stat-value">{networkStats.difficulty}</div>
          </div>
          <div className="data-card">
            <div className="stat-label">Global Hashrate</div>
            <div className="stat-value text-lg">{networkStats.hashrate}</div>
          </div>
          <div className="data-card">
            <div className="stat-label">Block Height</div>
            <div className="stat-value text-lg">#{networkStats.blockHeight}</div>
          </div>
          <div className="data-card">
            <div className="stat-label">Next Halving</div>
            <div className="stat-value text-lg">{networkStats.nextHalving}</div>
          </div>
        </div>

        {/* User Mining Status */}
        <Card className="mining-block">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-heading font-bold text-muted-foreground uppercase tracking-wider">
              Your Mining Operation
            </h2>
            <div className="difficulty-badge">
              <i className="fas fa-microchip mr-2"></i>
              ACTIVE
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="stat-label mb-1">Your Hashrate</div>
              <div className="text-2xl font-mono font-bold text-gradient">
                {getHashrateDisplay(userHashrate)}
              </div>
            </div>
            <div>
              <div className="stat-label mb-1">Mining Rewards</div>
              <div className="text-2xl font-mono font-bold text-gradient-green">
                {parseFloat(user?.unclaimedBalance || '0').toFixed(4)} GBTC
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Mining Progress</span>
              <span className="font-mono text-primary">{((userHashrate / 584732.50) * 100).toFixed(4)}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${Math.min((userHashrate / 584732.50) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button 
              className="btn-primary w-full"
              onClick={() => setLocation('/mining')}
            >
              <i className="fas fa-chart-line mr-2"></i>
              Dashboard
            </Button>
            <Button 
              className="btn-secondary w-full"
              onClick={() => setLocation('/power')}
            >
              <i className="fas fa-bolt mr-2"></i>
              Upgrade
            </Button>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => setLocation('/deposit')}
            className="data-card text-center py-4 transition-all hover:scale-105"
          >
            <i className="fas fa-download text-2xl text-primary mb-2"></i>
            <div className="text-xs font-heading uppercase">Deposit</div>
          </button>
          <button 
            onClick={() => setLocation('/withdraw')}
            className="data-card text-center py-4 transition-all hover:scale-105"
          >
            <i className="fas fa-upload text-2xl text-accent mb-2"></i>
            <div className="text-xs font-heading uppercase">Withdraw</div>
          </button>
          <button 
            onClick={() => setLocation('/transfer')}
            className="data-card text-center py-4 transition-all hover:scale-105"
          >
            <i className="fas fa-exchange-alt text-2xl text-chart-3 mb-2"></i>
            <div className="text-xs font-heading uppercase">Transfer</div>
          </button>
        </div>

        {/* Live Mining Feed */}
        <Card className="mining-block">
          <h3 className="text-sm font-heading font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Network Activity
          </h3>
          <div className="space-y-2">
            {[
              { type: 'block', icon: 'fa-cube', text: 'Block #871234 mined', time: '2 mins ago', color: 'text-primary' },
              { type: 'reward', icon: 'fa-coins', text: '6.25 BTC distributed', time: '2 mins ago', color: 'text-accent' },
              { type: 'hash', icon: 'fa-microchip', text: 'New miner joined', time: '5 mins ago', color: 'text-chart-3' },
              { type: 'difficulty', icon: 'fa-chart-line', text: 'Difficulty adjusted +2.1%', time: '1 hour ago', color: 'text-chart-4' },
            ].map((item, i) => (
              <div key={i} className="flex items-center space-x-3 p-2 rounded-lg bg-background/50">
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
            <div className="text-xs text-muted-foreground mb-1">GBTC Price</div>
            <div className="text-lg font-mono font-bold text-gradient">$0.0156</div>
            <div className="text-xs text-accent">+5.2%</div>
          </Card>
        </div>
      </div>
    </div>
  );
}