import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Zap, Shield, TrendingUp, Users, Coins, ArrowRight, ChevronRight } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleStartMining = () => {
    if (!user) {
      setLocation('/auth');
    } else {
      // Check if user has hash power
      const hashPower = parseFloat(user?.hashPower || '0');
      if (hashPower === 0) {
        toast({
          title: "Hash Power Required",
          description: "You need to purchase hash power to start mining. Redirecting to purchase page...",
          variant: "default"
        });
        setTimeout(() => setLocation('/power'), 2000);
      } else {
        setLocation('/mining');
      }
    }
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Animated Bitcoin Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" 
            style={{ 
              backgroundImage: `repeating-linear-gradient(45deg, #f7931a 0, #f7931a 1px, transparent 1px, transparent 15px),
                               repeating-linear-gradient(-45deg, #f7931a 0, #f7931a 1px, transparent 1px, transparent 15px)`,
              backgroundSize: '30px 30px'
            }}>
          </div>
        </div>
      </div>

      {/* Floating Bitcoin Icons */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-[#f7931a] opacity-10"
          initial={{ y: "100vh", x: `${Math.random() * 100}vw` }}
          animate={{ y: "-100px" }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            delay: i * 2,
            ease: "linear"
          }}
        >
          <span className="text-4xl">₿</span>
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 px-4 py-8 max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-6"
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#f7931a] to-[#ff9416] rounded-full flex items-center justify-center shadow-2xl shadow-[#f7931a]/50">
              <span className="text-5xl text-black font-bold">₿</span>
            </div>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Green Bitcoin
            <span className="text-[#f7931a] block text-3xl md:text-4xl mt-2">Mining Network</span>
          </h1>
          
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Join the revolutionary Bitcoin-style mining ecosystem. Mine GBTC tokens with sustainable energy and earn rewards proportional to your contribution.
          </p>

          {/* Start Mining Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleStartMining}
              className="bg-gradient-to-r from-[#f7931a] to-[#ff9416] hover:from-[#ff9416] hover:to-[#f7931a] text-black font-bold text-xl px-12 py-6 rounded-full shadow-2xl shadow-[#f7931a]/30"
              data-testid="button-start-mining"
            >
              <Zap className="w-6 h-6 mr-3" />
              START MINING
              <ChevronRight className="w-6 h-6 ml-2" />
            </Button>
          </motion.div>

          {user && (
            <p className="text-sm text-gray-500 mt-4">
              Welcome back, <span className="text-[#f7931a]">@{user.username}</span>
            </p>
          )}
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <Card className="bg-gray-950 border-gray-800 p-6 hover:border-[#f7931a]/50 transition-all">
            <div className="w-12 h-12 bg-[#f7931a]/20 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-[#f7931a]" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Secure Mining</h3>
            <p className="text-gray-500 text-sm">
              Industry-leading security with blockchain verification and encrypted transactions
            </p>
          </Card>

          <Card className="bg-gray-950 border-gray-800 p-6 hover:border-[#f7931a]/50 transition-all">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Fair Distribution</h3>
            <p className="text-gray-500 text-sm">
              Rewards distributed every 10 minutes based on your hash power contribution
            </p>
          </Card>

          <Card className="bg-gray-950 border-gray-800 p-6 hover:border-[#f7931a]/50 transition-all">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Growing Network</h3>
            <p className="text-gray-500 text-sm">
              Join thousands of miners worldwide in the GBTC mining revolution
            </p>
          </Card>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-8">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: "1", title: "Register", desc: "Create your account", icon: "👤" },
              { step: "2", title: "Deposit USDT", desc: "Fund your wallet", icon: "💰" },
              { step: "3", title: "Buy Hash Power", desc: "1 USDT = 1 GH/s", icon: "⚡" },
              { step: "4", title: "Earn GBTC", desc: "Mine & collect rewards", icon: "₿" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="relative"
              >
                <Card className="bg-gray-950 border-gray-800 p-4 text-center">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="text-[#f7931a] font-bold text-sm mb-1">Step {item.step}</div>
                  <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </Card>
                {i < 3 && (
                  <ArrowRight className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 text-gray-700 w-4 h-4" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <Card className="bg-gradient-to-br from-[#f7931a]/10 to-transparent border-[#f7931a]/20 p-4">
            <div className="text-3xl font-bold text-[#f7931a]">21M</div>
            <div className="text-xs text-gray-500">Total Supply</div>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20 p-4">
            <div className="text-3xl font-bold text-green-500">6.25</div>
            <div className="text-xs text-gray-500">GBTC Per Block</div>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20 p-4">
            <div className="text-3xl font-bold text-purple-500">10min</div>
            <div className="text-xs text-gray-500">Block Time</div>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20 p-4">
            <div className="text-3xl font-bold text-blue-500">144</div>
            <div className="text-xs text-gray-500">Blocks/Day</div>
          </Card>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {user && (
            <>
              <Button
                onClick={() => setLocation('/mining')}
                variant="outline"
                className="border-gray-800 hover:border-[#f7931a]/50 hover:bg-[#f7931a]/10"
              >
                <Coins className="w-4 h-4 mr-2" />
                My Mining
              </Button>
              
              <Button
                onClick={() => setLocation('/wallet')}
                variant="outline"
                className="border-gray-800 hover:border-green-500/50 hover:bg-green-500/10"
              >
                <span className="mr-2">💰</span>
                Wallet
              </Button>
              
              <Button
                onClick={() => setLocation('/power')}
                variant="outline"
                className="border-gray-800 hover:border-purple-500/50 hover:bg-purple-500/10"
              >
                <Zap className="w-4 h-4 mr-2" />
                Buy Power
              </Button>
            </>
          )}
          
          <Button
            onClick={() => setLocation('/global')}
            variant="outline"
            className="border-gray-800 hover:border-blue-500/50 hover:bg-blue-500/10"
          >
            <span className="mr-2">🌍</span>
            Global Stats
          </Button>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-12 pb-4">
          <p className="text-gray-600 text-xs">
            © 2024 Green Bitcoin Mining Network • Sustainable Mining for the Future
          </p>
        </div>
      </div>
    </div>
  );
}