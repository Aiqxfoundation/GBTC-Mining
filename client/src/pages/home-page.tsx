import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Zap, Globe, FileText, Activity } from "lucide-react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentHash, setCurrentHash] = useState("");
  const [blockNumber, setBlockNumber] = useState(871234);

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

  // Simulate block mining
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockNumber(prev => prev + 1);
    }, 600000); // Every 10 minutes
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
      {/* Bitcoin Grid Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, #f7931a 0, #f7931a 1px, transparent 1px, transparent 50px),
                             repeating-linear-gradient(90deg, #f7931a 0, #f7931a 1px, transparent 1px, transparent 50px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Animated Hash Background */}
      <div className="fixed inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-[#f7931a] opacity-5 font-mono text-xs whitespace-nowrap"
            initial={{ x: '100%', y: `${20 * i}%` }}
            animate={{ x: '-100%' }}
            transition={{
              duration: 30 + i * 5,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {currentHash.repeat(20)}
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-4 space-y-6">
        {/* Top Navigation Bar */}
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setLocation('/global')}
            variant="outline"
            size="sm"
            className="border-[#f7931a]/30 hover:border-[#f7931a] hover:bg-[#f7931a]/10"
          >
            <Globe className="w-4 h-4 mr-1" />
            Global Stats
          </Button>
          
          <Button
            onClick={() => setLocation('/whitepaper')}
            variant="outline"
            size="sm"
            className="border-[#f7931a]/30 hover:border-[#f7931a] hover:bg-[#f7931a]/10"
          >
            <FileText className="w-4 h-4 mr-1" />
            Whitepaper
          </Button>
        </div>

        {/* Hero Section with Bitcoin Animation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          {/* Animated Bitcoin Logo */}
          <div className="relative mb-6">
            <motion.div
              className="w-24 h-24 mx-auto"
              animate={{
                rotateY: [0, 360],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <div className="w-full h-full bg-gradient-to-br from-[#f7931a] to-[#ff9416] rounded-full flex items-center justify-center shadow-2xl shadow-[#f7931a]/50">
                <span className="text-5xl font-bold text-black">₿</span>
              </div>
            </motion.div>
            
            {/* Orbiting particles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-[#f7931a] rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.5,
                }}
              >
                <div 
                  className="w-2 h-2 bg-[#f7931a] rounded-full shadow-lg shadow-[#f7931a]/50"
                  style={{ transform: `translateX(${40 + i * 10}px)` }}
                />
              </motion.div>
            ))}
          </div>
          
          <motion.h1 
            className="text-5xl font-bold text-white mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Green Bitcoin
          </motion.h1>
          
          <motion.p 
            className="text-2xl text-[#f7931a] mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            (GBTC)
          </motion.p>
          
          <motion.p 
            className="text-lg text-gray-400 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Empowering Miners
          </motion.p>
          
          <motion.div 
            className="max-w-lg mx-auto space-y-2 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm text-gray-500">
              GBTC is an L1 blockchain with its own native gas currency.
            </p>
            <p className="text-sm text-gray-500">
              It fixes what Bitcoin left behind: accessibility, fair distribution, and real miner control.
            </p>
            <p className="text-sm text-[#f7931a] font-semibold">
              We empower miners through mobile-first mining, ensuring rewards go to individuals — not just corporations.
            </p>
          </motion.div>

          {/* Live Mining Display */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <Card className="bg-gray-950/80 border-[#f7931a]/20 p-4 max-w-md mx-auto backdrop-blur">
              <div className="font-mono text-xs space-y-1 text-left">
                <div className="text-[#f7931a]">MINING BLOCK #{blockNumber}</div>
                <div className="text-green-400">HASH: 0x{currentHash.substring(0, 20)}...</div>
                <div className="text-blue-400">DIFFICULTY: 53.91T</div>
                <div className="text-purple-400">REWARD: 6.25 GBTC</div>
              </div>
            </Card>
          </motion.div>

          {/* Start Mining Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Button
              onClick={handleStartMining}
              className="bg-gradient-to-r from-[#f7931a] to-[#ff9416] hover:from-[#ff9416] hover:to-[#f7931a] text-black font-bold text-xl px-10 py-6 rounded-lg shadow-2xl shadow-[#f7931a]/30"
              data-testid="button-start-mining"
            >
              <Zap className="w-6 h-6 mr-2" />
              START MINING
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>

          {user && (
            <motion.p 
              className="text-sm text-gray-500 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Welcome back, <span className="text-[#f7931a]">@{user.username}</span>
            </motion.p>
          )}
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="bg-gray-950 border-gray-800 p-4">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#f7931a]" />
              How Mining Works
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-black rounded-lg border border-gray-900">
                <div className="text-2xl mb-2">📝</div>
                <div className="text-xs text-gray-400">Register</div>
                <div className="text-xs text-gray-600">Create account</div>
              </div>
              <div className="text-center p-3 bg-black rounded-lg border border-gray-900">
                <div className="text-2xl mb-2">💳</div>
                <div className="text-xs text-gray-400">Deposit</div>
                <div className="text-xs text-gray-600">Add USDT</div>
              </div>
              <div className="text-center p-3 bg-black rounded-lg border border-gray-900">
                <div className="text-2xl mb-2">⚡</div>
                <div className="text-xs text-gray-400">Hash Power</div>
                <div className="text-xs text-gray-600">1 USDT = 1 GH/s</div>
              </div>
              <div className="text-center p-3 bg-black rounded-lg border border-gray-900">
                <div className="text-2xl mb-2">₿</div>
                <div className="text-xs text-gray-400">Mine GBTC</div>
                <div className="text-xs text-gray-600">Earn rewards</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Key Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="grid grid-cols-2 gap-3"
        >
          <Card className="bg-gradient-to-br from-[#f7931a]/10 to-transparent border-[#f7931a]/20 p-3">
            <div className="text-xs text-gray-500">Total Supply</div>
            <div className="text-xl font-bold text-[#f7931a]">21M GBTC</div>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20 p-3">
            <div className="text-xs text-gray-500">Block Reward</div>
            <div className="text-xl font-bold text-green-500">6.25 GBTC</div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20 p-3">
            <div className="text-xs text-gray-500">Block Time</div>
            <div className="text-xl font-bold text-purple-500">10 min</div>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20 p-3">
            <div className="text-xs text-gray-500">Halving</div>
            <div className="text-xl font-bold text-blue-500">4 years</div>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card className="bg-gray-950 border-gray-800">
            <div className="p-4">
              <h2 className="text-white font-semibold mb-4">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="what-is-gbtc" className="border-gray-800">
                  <AccordionTrigger className="text-left hover:text-[#f7931a]">
                    <span className="text-sm">What is GBTC?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-500 text-xs">
                    GBTC (Green Bitcoin) is a decentralized token inspired by Bitcoin's scarcity model, with a total supply 
                    of 21 million tokens and a fair mining + hashrate-based distribution system. It features real USDT deposits, 
                    10-minute block times, and rewards based on your purchased hash power.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="how-to-start" className="border-gray-800">
                  <AccordionTrigger className="text-left hover:text-[#f7931a]">
                    <span className="text-sm">How can I start mining?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-500 text-xs">
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Register with your account</li>
                      <li>Deposit USDT to your wallet</li>
                      <li>Purchase hash power (1 USDT = 1 GH/s)</li>
                      <li>Start mining automatically</li>
                      <li>Claim rewards daily to stay active</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="mining-rewards" className="border-gray-800">
                  <AccordionTrigger className="text-left hover:text-[#f7931a]">
                    <span className="text-sm">How are rewards distributed?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-500 text-xs">
                    Every 10 minutes a new block is mined with 6.25 GBTC reward. Active miners share the reward based on their hash power percentage. 
                    Your share = (Your Hashrate ÷ Total Network Hashrate) × Block Reward. Remember to claim daily or you'll be marked inactive!
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="withdrawals" className="border-gray-800">
                  <AccordionTrigger className="text-left hover:text-[#f7931a]">
                    <span className="text-sm">Can I withdraw GBTC?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-500 text-xs">
                    GBTC tokens can be transferred between users internally until 25% of supply is mined (5.25M GBTC). 
                    After reaching this milestone, GBTC will be listed on exchanges for trading. You can withdraw USDT 
                    earned from referral commissions anytime.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="security" className="border-gray-800">
                  <AccordionTrigger className="text-left hover:text-[#f7931a]">
                    <span className="text-sm">Is it secure?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-500 text-xs">
                    Yes! The system uses bank-grade security with encrypted credentials. However, there's NO recovery option if you forget your PIN. 
                    Mining is fair - only real hash power earns rewards. Fake deposits result in permanent account freeze. 
                    The system cannot manipulate balances, only verify transactions.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="space-y-3"
          >
            <Button
              onClick={() => setLocation('/mining')}
              variant="outline"
              className="w-full justify-between border-gray-800 hover:border-[#f7931a]/50"
            >
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Mining Dashboard
              </span>
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={() => setLocation('/wallet')}
              variant="outline"
              className="w-full justify-between border-gray-800 hover:border-green-500/50"
            >
              <span className="flex items-center gap-2">
                <span>💰</span>
                My Wallet
              </span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}