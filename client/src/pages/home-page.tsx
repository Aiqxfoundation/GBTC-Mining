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
  const [binaryData, setBinaryData] = useState<string[]>([]);

  // Generate random hash for visual effect
  useEffect(() => {
    const interval = setInterval(() => {
      const hash = Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      setCurrentHash("0x" + hash.substring(0, 8).toUpperCase() + "FC0");
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Generate binary data for background
  useEffect(() => {
    const data = Array.from({length: 12}, () => 
      Array.from({length: 100}, () => 
        Math.random() > 0.5 ? '1' : '0'
      ).join('')
    );
    setBinaryData(data);
  }, []);

  // Simulate progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 5;
        return next > 100 ? 10 : next;
      });
      setEta(Math.floor(Math.random() * 60));
    }, 2000);
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
      {/* Animated Green Binary Background - Smaller and Faster */}
      <div className="fixed inset-0 overflow-hidden">
        {binaryData.map((data, i) => (
          <motion.div
            key={i}
            className="absolute text-green-500/20 font-mono whitespace-nowrap"
            style={{ 
              fontSize: '8px',
              left: `${i * 8.5}%`,
              letterSpacing: '2px'
            }}
            initial={{ y: '-100%' }}
            animate={{ y: '100%' }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.3,
            }}
          >
            {data}
          </motion.div>
        ))}
      </div>

      {/* Diagonal Corner Hashes - Smaller */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-4 left-4 text-green-500/30 font-mono"
          style={{ fontSize: '10px' }}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {Array.from({length: 16}, () => 
            Math.floor(Math.random() * 16).toString(16).toUpperCase()
          ).join('')}
        </motion.div>
        <motion.div 
          className="absolute top-4 right-4 text-green-500/30 font-mono"
          style={{ fontSize: '10px' }}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        >
          {Array.from({length: 16}, () => 
            Math.floor(Math.random() * 16).toString(16).toUpperCase()
          ).join('')}
        </motion.div>
        <motion.div 
          className="absolute bottom-4 left-4 text-green-500/30 font-mono"
          style={{ fontSize: '10px' }}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        >
          {Array.from({length: 16}, () => 
            Math.floor(Math.random() * 16).toString(16).toUpperCase()
          ).join('')}
        </motion.div>
        <motion.div 
          className="absolute bottom-4 right-4 text-green-500/30 font-mono"
          style={{ fontSize: '10px' }}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
        >
          {Array.from({length: 16}, () => 
            Math.floor(Math.random() * 16).toString(16).toUpperCase()
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
            className="text-green-500 hover:text-green-400 hover:bg-green-500/10 border border-green-500/20"
          >
            <Globe className="w-4 h-4 mr-1" />
            Global Stats
          </Button>
          
          <Button
            onClick={() => setLocation('/whitepaper')}
            variant="ghost"
            size="sm"
            className="text-green-500 hover:text-green-400 hover:bg-green-500/10 border border-green-500/20"
          >
            <FileText className="w-4 h-4 mr-1" />
            Whitepaper
          </Button>
        </div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center py-6"
        >
          {/* Animated Shining Bitcoin Logo */}
          <div className="relative mb-6">
            <motion.div
              className="w-28 h-28 mx-auto relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
            >
              {/* Pulsing glow effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-green-500/20 blur-xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Rotating border */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, transparent, #10b981, transparent)',
                }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              {/* Main circle */}
              <div className="absolute inset-1 rounded-full bg-black flex items-center justify-center">
                <div className="w-full h-full rounded-full border-2 border-green-500 relative flex items-center justify-center">
                  <motion.span 
                    className="text-5xl font-bold text-green-500"
                    animate={{ 
                      textShadow: [
                        "0 0 10px #10b981",
                        "0 0 20px #10b981",
                        "0 0 10px #10b981"
                      ]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity
                    }}
                  >
                    ₿
                  </motion.span>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.h1 
            className="text-3xl font-bold text-green-500 mb-2 font-mono tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            GBTC MINING
          </motion.h1>
          
          <motion.p 
            className="text-xs text-gray-400 mb-6 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            &lt;The Future Is Decentralized/&gt;
          </motion.p>

          {/* Terminal Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mb-6"
          >
            <Card className="bg-black border border-green-500/30 p-3 max-w-sm mx-auto shadow-lg shadow-green-500/10">
              {/* Terminal Header */}
              <div className="flex items-center mb-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <div className="ml-auto text-green-500 text-[10px] font-mono">GBTC_BOOT_v2.1.0</div>
              </div>
              
              {/* Terminal Content */}
              <div className="font-mono text-[10px] space-y-1 text-left text-green-400">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  [HASH] Loading ASIC processors...
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  &gt; 01100111
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  &gt; 10001110
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  &gt; 11011100
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-green-500">Progress:</span>
                  <span className="text-white">{progress.toFixed(0)}%</span>
                  <span className="ml-auto text-gray-500">ETA: {eta}s</span>
                </motion.div>
              </div>

              {/* Progress Bars */}
              <div className="mt-3 flex gap-[2px]">
                {[...Array(10)].map((_, i) => (
                  <div 
                    key={i}
                    className="flex-1 h-5 rounded-sm overflow-hidden bg-gray-900"
                  >
                    <motion.div
                      className="h-full bg-gradient-to-b from-green-400 to-yellow-500"
                      initial={{ height: 0 }}
                      animate={{ height: i < (progress / 10) ? '100%' : '0%' }}
                      transition={{ delay: 0.8 + i * 0.05, duration: 0.3 }}
                    />
                  </div>
                ))}
              </div>

              {/* Current Hash */}
              <div className="mt-2 text-center">
                <div className="text-[10px] text-gray-500 font-mono">
                  Current Hash: <span className="text-orange-500">{currentHash}</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Start Mining Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.5, type: "spring" }}
          >
            <Button
              onClick={handleStartMining}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-bold text-base px-6 py-5 rounded-lg shadow-lg shadow-green-500/30"
              data-testid="button-start-mining"
            >
              START MINING
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>

          {user && (
            <motion.p 
              className="text-xs text-gray-500 mt-3 font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
            >
              Welcome back, <span className="text-green-500">@{user.username}</span>
            </motion.p>
          )}
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="grid grid-cols-2 gap-2"
        >
          <Card className="bg-black border-green-500/20 p-2 hover:border-green-500/40 transition-colors">
            <div className="text-[10px] text-gray-500 font-mono">Total Supply</div>
            <div className="text-lg font-bold text-green-500">21M GBTC</div>
          </Card>
          <Card className="bg-black border-green-500/20 p-2 hover:border-green-500/40 transition-colors">
            <div className="text-[10px] text-gray-500 font-mono">Block Reward</div>
            <div className="text-lg font-bold text-green-500">6.25 GBTC</div>
          </Card>
          <Card className="bg-black border-green-500/20 p-2 hover:border-green-500/40 transition-colors">
            <div className="text-[10px] text-gray-500 font-mono">Block Time</div>
            <div className="text-lg font-bold text-green-500">10 min</div>
          </Card>
          <Card className="bg-black border-green-500/20 p-2 hover:border-green-500/40 transition-colors">
            <div className="text-[10px] text-gray-500 font-mono">Network</div>
            <div className="text-lg font-bold text-green-500">L1 Chain</div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7, duration: 0.5 }}
            className="space-y-2"
          >
            <Button
              onClick={() => setLocation('/mining')}
              variant="outline"
              className="w-full justify-between border-green-500/30 hover:border-green-500 bg-black hover:bg-green-500/10 text-green-500 text-sm"
            >
              <span>Mining Dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={() => setLocation('/wallet')}
              variant="outline"
              className="w-full justify-between border-green-500/30 hover:border-green-500 bg-black hover:bg-green-500/10 text-green-500 text-sm"
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