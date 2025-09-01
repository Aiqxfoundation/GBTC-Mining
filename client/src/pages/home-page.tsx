import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Zap, Wallet, Activity, Globe } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentHash, setCurrentHash] = useState("");

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

  const handleStartMining = () => {
    if (!user) {
      setLocation('/auth');
    } else {
      // Check if user has hash power
      const hashPower = parseFloat(user?.hashPower || '0');
      if (hashPower === 0) {
        toast({
          title: "Hash Power Required",
          description: "You need to purchase hash power to start mining. Get started with as little as 10 USDT!",
          variant: "default"
        });
        setTimeout(() => setLocation('/power'), 2000);
      } else {
        setLocation('/mining');
      }
    }
  };

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden bg-black">
      {/* Background Effects */}
      <div className="fixed inset-0 bitcoin-grid opacity-10"></div>
      
      {/* Hash Streams - More subtle */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="hash-stream"
          style={{
            left: `${30 * i + 20}%`,
            animationDelay: `${i * 2}s`,
            fontSize: '0.5rem',
            opacity: 0.05
          }}
        >
          {currentHash}
        </div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 p-4 space-y-6">
        {/* Hero Section */}
        <div className="text-center py-8">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#f7931a] to-[#ff9416] rounded-full flex items-center justify-center shadow-xl shadow-[#f7931a]/30">
              <span className="text-4xl text-black font-bold">₿</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2">
            Green Bitcoin
          </h1>
          <p className="text-[#f7931a] text-xl mb-4">Mining Network</p>
          
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Join the sustainable Bitcoin-style mining ecosystem. Mine GBTC tokens and earn rewards.
          </p>

          {/* Start Mining Button */}
          <Button
            onClick={handleStartMining}
            className="bg-gradient-to-r from-[#f7931a] to-[#ff9416] hover:from-[#ff9416] hover:to-[#f7931a] text-black font-bold text-lg px-8 py-6 rounded-lg shadow-lg"
            data-testid="button-start-mining"
          >
            <Zap className="w-5 h-5 mr-2" />
            START MINING
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>

          {user && (
            <p className="text-sm text-gray-500 mt-4">
              Welcome back, <span className="text-[#f7931a]">@{user.username}</span>
            </p>
          )}
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gray-950 border-gray-800 p-4">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="text-white font-semibold mb-1">Instant Mining</h3>
            <p className="text-gray-500 text-xs">Start earning GBTC immediately</p>
          </Card>
          
          <Card className="bg-gray-950 border-gray-800 p-4">
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="text-white font-semibold mb-1">Secure Platform</h3>
            <p className="text-gray-500 text-xs">Bank-grade security for your assets</p>
          </Card>
          
          <Card className="bg-gray-950 border-gray-800 p-4">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="text-white font-semibold mb-1">Fair Rewards</h3>
            <p className="text-gray-500 text-xs">Proportional distribution system</p>
          </Card>
          
          <Card className="bg-gray-950 border-gray-800 p-4">
            <div className="text-2xl mb-2">🌍</div>
            <h3 className="text-white font-semibold mb-1">Global Network</h3>
            <p className="text-gray-500 text-xs">Join thousands of miners worldwide</p>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="bg-gray-950 border-gray-800 p-4">
          <h2 className="text-white font-semibold mb-4">How It Works</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#f7931a]/20 rounded-full flex items-center justify-center text-[#f7931a] font-bold">1</div>
              <div>
                <div className="text-white text-sm">Create Account</div>
                <div className="text-gray-500 text-xs">Register with just username and PIN</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 font-bold">2</div>
              <div>
                <div className="text-white text-sm">Deposit USDT</div>
                <div className="text-gray-500 text-xs">Fund your wallet securely</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-500 font-bold">3</div>
              <div>
                <div className="text-white text-sm">Buy Hash Power</div>
                <div className="text-gray-500 text-xs">1 USDT = 1 GH/s mining power</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500 font-bold">4</div>
              <div>
                <div className="text-white text-sm">Earn GBTC</div>
                <div className="text-gray-500 text-xs">Receive rewards every 10 minutes</div>
              </div>
            </div>
          </div>
        </Card>

        {/* GBTC Stats */}
        <Card className="bg-gradient-to-br from-[#f7931a]/10 to-transparent border-[#f7931a]/20 p-4">
          <h3 className="text-white font-semibold mb-3">GBTC Token</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500">Total Supply</div>
              <div className="text-xl font-bold text-[#f7931a]">21M</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Block Reward</div>
              <div className="text-xl font-bold text-green-500">6.25 GBTC</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Block Time</div>
              <div className="text-xl font-bold text-purple-500">10 min</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Halving</div>
              <div className="text-xl font-bold text-blue-500">4 years</div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          {user ? (
            <>
              <Button
                onClick={() => setLocation('/mining')}
                variant="outline"
                className="w-full justify-between border-gray-800 hover:border-[#f7931a]/50"
              >
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  My Mining Dashboard
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={() => setLocation('/wallet')}
                variant="outline"
                className="w-full justify-between border-gray-800 hover:border-green-500/50"
              >
                <span className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  My Wallet
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={() => setLocation('/power')}
                variant="outline"
                className="w-full justify-between border-gray-800 hover:border-purple-500/50"
              >
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Purchase Hash Power
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setLocation('/auth')}
              variant="outline"
              className="w-full justify-between border-gray-800 hover:border-[#f7931a]/50"
            >
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Login to Start Mining
              </span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            onClick={() => setLocation('/global')}
            variant="outline"
            className="w-full justify-between border-gray-800 hover:border-blue-500/50"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Global Network Statistics
            </span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 pb-4">
          <p className="text-gray-600 text-xs">
            © 2024 Green Bitcoin Mining • Sustainable Mining
          </p>
        </div>
      </div>
    </div>
  );
}