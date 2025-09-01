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
  const [nonce, setNonce] = useState(0);
  const [hashRate, setHashRate] = useState(0);
  const [difficulty, setDifficulty] = useState("0x1d00ffff");
  const [binaryLines, setBinaryLines] = useState<string[]>([]);
  const [progressBars, setProgressBars] = useState<number[]>(new Array(10).fill(0));

  // Real-time hash calculation simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const newNonce = Math.floor(Math.random() * 4294967296);
      setNonce(newNonce);
      
      // Generate hash-like string
      const hash = Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      setCurrentHash("0x" + hash.substring(0, 12));
      
      // Update hash rate
      setHashRate(Math.floor(Math.random() * 100) + 450);
    }, 100); // Update every 100ms for fast animation
    
    return () => clearInterval(interval);
  }, []);

  // Generate binary data for animation
  useEffect(() => {
    const interval = setInterval(() => {
      const newLines = Array.from({length: 4}, () => {
        const random = Math.random();
        if (random > 0.7) {
          // Binary
          return Array.from({length: 32}, () => Math.random() > 0.5 ? '1' : '0').join('');
        } else if (random > 0.4) {
          // Hex
          return Array.from({length: 16}, () => 
            Math.floor(Math.random() * 16).toString(16).toUpperCase()
          ).join('');
        } else {
          // Mixed
          return `0x${Array.from({length: 8}, () => 
            Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
          ).join('')}`;
        }
      });
      setBinaryLines(newLines);
    }, 200);
    
    return () => clearInterval(interval);
  }, []);

  // Fast animated mining blocks
  useEffect(() => {
    const interval = setInterval(() => {
      setProgressBars(prev => 
        prev.map((_, i) => {
          // Create wave effect across blocks
          const wave = Math.sin(Date.now() / 100 + i) * 50 + 50;
          return Math.random() > 0.2 ? wave + Math.random() * 30 : Math.random() * 20;
        })
      );
    }, 50); // Very fast updates for smooth animation
    
    return () => clearInterval(interval);
  }, []);

  // Generate falling hash streams
  const generateHashStream = () => {
    const chars = '0123456789ABCDEF';
    return Array.from({length: 200}, () => 
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  };

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
      {/* Fast Falling Hash Streams - Top to Bottom Only */}
      <div className="fixed inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-green-500/15 font-mono whitespace-nowrap"
            style={{ 
              fontSize: '10px',
              left: `${i * 6.5}%`,
              letterSpacing: '1px',
              writingMode: 'vertical-rl',
              textOrientation: 'upright'
            }}
            initial={{ y: '-100%' }}
            animate={{ y: '100%' }}
            transition={{
              duration: 2 + (i % 2) * 0.5,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.1,
            }}
          >
            {generateHashStream()}
          </motion.div>
        ))}
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
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center py-4"
        >
          {/* Animated Bitcoin Logo */}
          <div className="relative mb-4">
            <motion.div
              className="w-24 h-24 mx-auto relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, type: "spring" }}
            >
              {/* Pulsing glow */}
              <motion.div
                className="absolute inset-0 rounded-full bg-green-500/20 blur-xl"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 0.7, 0.4]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Rotating border */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, transparent, #10b981, #10b981, transparent)',
                }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              {/* Main circle */}
              <div className="absolute inset-1 rounded-full bg-black flex items-center justify-center">
                <div className="w-full h-full rounded-full border-2 border-green-500 relative flex items-center justify-center">
                  <motion.span 
                    className="text-4xl font-bold text-green-500"
                    animate={{ 
                      textShadow: [
                        "0 0 10px #10b981",
                        "0 0 20px #10b981",
                        "0 0 10px #10b981"
                      ]
                    }}
                    transition={{
                      duration: 1,
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
            className="text-3xl font-bold text-green-500 mb-1 font-mono tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            GBTC MINING
          </motion.h1>
          
          <motion.p 
            className="text-xs text-gray-400 mb-4 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            &lt;The Future Is Decentralized/&gt;
          </motion.p>

          {/* Terminal Display with Real Mining Simulation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-4"
          >
            <Card className="bg-black border border-green-500/30 p-3 max-w-sm mx-auto shadow-lg shadow-green-500/10">
              {/* Terminal Header */}
              <div className="flex items-center mb-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <div className="ml-auto text-green-500 text-[10px] font-mono animate-pulse">
                  MINING ACTIVE
                </div>
              </div>
              
              {/* Live Mining Data */}
              <div className="font-mono text-[10px] space-y-1 text-left text-green-400">
                <div className="text-yellow-400 animate-pulse">
                  [ASIC] Mining Block #871,{(234567 + Math.floor(nonce / 1000000)).toString().padStart(3, '0')}
                </div>
                
                {/* Animated binary/hex lines */}
                {binaryLines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.1 }}
                    className="text-green-500"
                  >
                    &gt; {line}
                  </motion.div>
                ))}
                
                {/* Live Stats */}
                <div className="flex items-center gap-2 text-white mt-1">
                  <span className="text-green-500">Nonce:</span>
                  <span className="text-orange-400">{nonce.toString(16).toUpperCase()}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-green-500">Hash/s:</span>
                  <span className="text-cyan-400">{hashRate} MH/s</span>
                  <span className="ml-auto text-gray-500">Diff: {difficulty}</span>
                </div>
              </div>

              {/* Blockchain Terminal Display */}
              <div className="mt-3 relative h-10 bg-black border border-green-500/30 overflow-hidden font-mono">
                {/* Sliding blockchain */}
                <motion.div 
                  className="absolute flex items-center h-full"
                  animate={{
                    x: [0, -350]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="flex items-center h-full py-2">
                      {/* Block */}
                      <div className="h-full px-3 bg-gray-950 border border-green-500/40 flex flex-col justify-center relative">
                        <div className="text-[6px] text-green-500/60 uppercase">Block</div>
                        <div className="text-[9px] text-green-400 font-bold">
                          {(876500 + i).toString()}
                        </div>
                        <div className="text-[6px] text-green-500/40">
                          0x{Math.random().toString(16).substr(2, 4)}
                        </div>
                      </div>
                      
                      {/* Chain connector */}
                      <svg width="20" height="20" className="flex-shrink-0">
                        <line x1="0" y1="10" x2="15" y2="10" stroke="rgb(34, 197, 94)" strokeOpacity="0.4" strokeWidth="1"/>
                        <line x1="15" y1="10" x2="20" y2="10" stroke="rgb(34, 197, 94)" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="2,2"/>
                        <circle cx="10" cy="10" r="2" fill="rgb(34, 197, 94)" fillOpacity="0.3"/>
                      </svg>
                    </div>
                  ))}
                </motion.div>
                
                {/* Terminal overlay effect */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, rgba(0,0,0,0.8) 0%, transparent 10%, transparent 90%, rgba(0,0,0,0.8) 100%)'
                  }}
                />
              </div>

              {/* Current Hash */}
              <div className="mt-2 text-center">
                <div className="text-[10px] text-gray-500 font-mono">
                  Target: <span className="text-orange-500 animate-pulse">{currentHash}</span>
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
            transition={{ delay: 0.6, duration: 0.3, type: "spring" }}
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
              transition={{ delay: 0.7, duration: 0.3 }}
            >
              Welcome back, <span className="text-green-500">@{user.username}</span>
            </motion.p>
          )}
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
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
            transition={{ delay: 0.9, duration: 0.3 }}
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