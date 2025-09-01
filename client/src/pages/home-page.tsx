import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Globe, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentHash, setCurrentHash] = useState("");
  const [progress, setProgress] = useState(64);
  const [eta, setEta] = useState(24);

  // Generate random hash for visual effect
  useEffect(() => {
    const interval = setInterval(() => {
      const hash = Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      setCurrentHash("0x" + hash.substring(0, 8).toUpperCase() + "FC0");
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Simulate progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 5;
        return next > 100 ? 10 : next;
      });
      setEta(Math.floor(Math.random() * 60));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStartMining = () => {
    if (!user) {
      setLocation('/auth');
    } else {
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
      {/* Animated Green Binary Background */}
      <div className="fixed inset-0 overflow-hidden opacity-30">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-green-500 font-mono text-xs whitespace-nowrap"
            initial={{ y: `-${100}%` }}
            animate={{ y: '100%' }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 1.5,
            }}
            style={{ left: `${i * 12.5}%` }}
          >
            {Array.from({length: 50}, () => 
              Math.random() > 0.5 ? '1' : '0'
            ).join('')}
            {Array.from({length: 50}, () => 
              Math.floor(Math.random() * 16).toString(16)
            ).join('')}
            {Array.from({length: 50}, () => 
              Math.random() > 0.5 ? '1' : '0'
            ).join('')}
          </motion.div>
        ))}
      </div>

      {/* Diagonal Corner Hashes */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-0 left-0 text-green-500/20 font-mono text-xs -rotate-45 origin-top-left"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ transform: 'rotate(-45deg) translateX(-30%)' }}
        >
          {Array.from({length: 20}, () => 
            Math.floor(Math.random() * 16).toString(16)
          ).join('')}
        </motion.div>
        <motion.div 
          className="absolute top-0 right-0 text-green-500/20 font-mono text-xs rotate-45 origin-top-right"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ transform: 'rotate(45deg) translateX(30%)' }}
        >
          {Array.from({length: 20}, () => 
            Math.floor(Math.random() * 16).toString(16)
          ).join('')}
        </motion.div>
        <motion.div 
          className="absolute bottom-0 left-0 text-green-500/20 font-mono text-xs rotate-45 origin-bottom-left"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          style={{ transform: 'rotate(45deg) translateX(-30%)' }}
        >
          {Array.from({length: 20}, () => 
            Math.floor(Math.random() * 16).toString(16)
          ).join('')}
        </motion.div>
        <motion.div 
          className="absolute bottom-0 right-0 text-green-500/20 font-mono text-xs -rotate-45 origin-bottom-right"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          style={{ transform: 'rotate(-45deg) translateX(30%)' }}
        >
          {Array.from({length: 20}, () => 
            Math.floor(Math.random() * 16).toString(16)
          ).join('')}
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-4 space-y-6">
        {/* Top Navigation Bar */}
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setLocation('/global')}
            variant="ghost"
            size="sm"
            className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
          >
            <Globe className="w-4 h-4 mr-1" />
            Global Stats
          </Button>
          
          <Button
            onClick={() => setLocation('/whitepaper')}
            variant="ghost"
            size="sm"
            className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
          >
            <FileText className="w-4 h-4 mr-1" />
            Whitepaper
          </Button>
        </div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-center py-8"
        >
          {/* Bitcoin Logo with Green Circle */}
          <div className="relative mb-8">
            <motion.div
              className="w-32 h-32 mx-auto"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              <div className="w-full h-full rounded-full border-4 border-green-500 relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500/20 to-transparent" />
                <span className="text-5xl font-bold text-green-500">₿</span>
              </div>
            </motion.div>
          </div>
          
          <motion.h1 
            className="text-4xl font-bold text-green-500 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            GBTC MINING
          </motion.h1>
          
          <motion.p 
            className="text-sm text-gray-400 mb-8 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            &lt;The Future Is Decentralized/&gt;
          </motion.p>

          {/* Terminal Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mb-8"
          >
            <Card className="bg-black border border-green-500/30 p-4 max-w-md mx-auto">
              {/* Terminal Header */}
              <div className="flex items-center mb-3">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="ml-auto text-green-500 text-xs font-mono">GBTC_BOOT_v2.1.0</div>
              </div>
              
              {/* Terminal Content */}
              <div className="font-mono text-xs space-y-1 text-left text-green-400">
                <div>[HASH] Loading ASIC processors...</div>
                <div>&gt; 01100111</div>
                <div>&gt; 10001110</div>
                <div>&gt; 11011100</div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">Progress:</span>
                  <span className="text-white">{progress.toFixed(0)}%</span>
                  <span className="ml-auto text-gray-500">ETA: {eta}s</span>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="mt-4 flex gap-1">
                {[...Array(10)].map((_, i) => (
                  <div 
                    key={i}
                    className="flex-1 h-8 rounded-sm overflow-hidden bg-gray-900"
                  >
                    <motion.div
                      className="h-full bg-gradient-to-b from-green-400 to-yellow-500"
                      initial={{ height: 0 }}
                      animate={{ height: i < (progress / 10) ? '100%' : '0%' }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                    />
                  </div>
                ))}
              </div>

              {/* Current Hash */}
              <div className="mt-3 text-center">
                <div className="text-xs text-gray-500 font-mono">Current Hash: <span className="text-orange-500">{currentHash}</span></div>
              </div>
            </Card>
          </motion.div>

          {/* Start Mining Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.8, type: "spring" }}
          >
            <Button
              onClick={handleStartMining}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-bold text-lg px-8 py-6 rounded-lg shadow-lg shadow-green-500/30"
              data-testid="button-start-mining"
            >
              START MINING
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>

          {user && (
            <motion.p 
              className="text-sm text-gray-500 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
            >
              Welcome back, <span className="text-green-500">@{user.username}</span>
            </motion.p>
          )}
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="grid grid-cols-2 gap-3"
        >
          <Card className="bg-black border-green-500/20 p-3">
            <div className="text-xs text-gray-500">Total Supply</div>
            <div className="text-xl font-bold text-green-500">21M GBTC</div>
          </Card>
          <Card className="bg-black border-green-500/20 p-3">
            <div className="text-xs text-gray-500">Block Reward</div>
            <div className="text-xl font-bold text-green-500">6.25 GBTC</div>
          </Card>
          <Card className="bg-black border-green-500/20 p-3">
            <div className="text-xs text-gray-500">Block Time</div>
            <div className="text-xl font-bold text-green-500">10 min</div>
          </Card>
          <Card className="bg-black border-green-500/20 p-3">
            <div className="text-xs text-gray-500">Network</div>
            <div className="text-xl font-bold text-green-500">L1 Chain</div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="space-y-3"
          >
            <Button
              onClick={() => setLocation('/mining')}
              variant="outline"
              className="w-full justify-between border-green-500/30 hover:border-green-500 bg-black hover:bg-green-500/10 text-green-500"
            >
              <span>Mining Dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={() => setLocation('/wallet')}
              variant="outline"
              className="w-full justify-between border-green-500/30 hover:border-green-500 bg-black hover:bg-green-500/10 text-green-500"
            >
              <span>My Wallet</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}