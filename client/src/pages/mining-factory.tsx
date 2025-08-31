import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MiningFactory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [runningHashes, setRunningHashes] = useState<string[]>([]);
  const [currentHashIndex, setCurrentHashIndex] = useState(0);

  const hashPower = parseFloat(user?.hashPower || '0');
  const gbtcBalance = parseFloat(user?.gbtcBalance || '0');

  // Generate random transaction hashes
  const generateHash = () => {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  // Simulate running hashes
  useEffect(() => {
    if (hashPower <= 0) return;

    const interval = setInterval(() => {
      const newHashes = Array(5).fill(0).map(() => generateHash());
      setRunningHashes(newHashes);
      setCurrentHashIndex(prev => (prev + 1) % 5);
    }, 500);

    return () => clearInterval(interval);
  }, [hashPower]);

  // Fetch unclaimed blocks
  const { data: unclaimedBlocks, isLoading: blocksLoading } = useQuery({
    queryKey: ["/api/unclaimed-blocks"],
    refetchInterval: 10000, // Refresh every 10 seconds
    enabled: !!user,
  });

  // Claim block mutation
  const claimBlockMutation = useMutation({
    mutationFn: async (blockId: string) => {
      const res = await apiRequest("POST", "/api/claim-block", { blockId });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Block Claimed!", 
        description: `Successfully claimed ${data.reward} GBTC` 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/unclaimed-blocks"] });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Claim Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const getHashrateDisplay = (hashrate: number) => {
    if (hashrate >= 1000000) return `${(hashrate / 1000000).toFixed(2)} PH/s`;
    if (hashrate >= 1000) return `${(hashrate / 1000).toFixed(2)} TH/s`;
    return `${hashrate.toFixed(2)} GH/s`;
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const diff = expires - now;
    
    if (diff <= 0) return "EXPIRED";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="mobile-page bg-black">
      {/* Professional Header */}
      <div className="mobile-header bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-display font-black text-primary glow-green">
            MINING FACTORY
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            GBTC BLOCKCHAIN NETWORK
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground font-mono">BALANCE</p>
          <p className="text-lg font-display font-bold text-accent glow-gold">
            {gbtcBalance.toFixed(8)} GBTC
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mobile-content">
        {/* Mining Status Card */}
        <Card className="mobile-card bg-black border-primary/30">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-muted-foreground">MINING STATUS</span>
              <span className={`text-xs font-mono px-2 py-1 rounded ${
                hashPower > 0 ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
              }`}>
                {hashPower > 0 ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <i className={`fas fa-microchip text-3xl ${
                hashPower > 0 ? 'text-primary animate-pulse' : 'text-muted-foreground'
              }`}></i>
              <div>
                <p className="text-2xl font-display font-black text-primary">
                  {getHashrateDisplay(hashPower)}
                </p>
                <p className="text-xs text-muted-foreground">Total Hashrate</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Transaction Hashes Terminal */}
        {hashPower > 0 && (
          <Card className="mobile-card bg-black border-primary/30 overflow-hidden">
            <div className="mb-2">
              <p className="text-xs font-mono text-primary">PROCESSING TRANSACTIONS</p>
            </div>
            <div className="bg-black/50 rounded p-3 font-mono text-xs space-y-1 max-h-32 overflow-hidden">
              <AnimatePresence mode="popLayout">
                {runningHashes.map((hash, index) => (
                  <motion.div
                    key={`${hash}-${currentHashIndex}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ 
                      opacity: index === currentHashIndex ? 1 : 0.3,
                      y: 0,
                      color: index === currentHashIndex ? '#00ff00' : '#00ff0080'
                    }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="truncate"
                  >
                    {index === currentHashIndex && (
                      <span className="text-primary mr-2">➤</span>
                    )}
                    {hash}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <p className="text-xs text-muted-foreground font-mono">
                Mining at {getHashrateDisplay(hashPower)}
              </p>
            </div>
          </Card>
        )}

        {/* Unclaimed Blocks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-mono text-primary">UNCLAIMED BLOCKS</p>
            <p className="text-xs text-muted-foreground font-mono">
              Claim within 24 hours
            </p>
          </div>

          {blocksLoading ? (
            <Card className="mobile-card bg-black border-primary/30">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            </Card>
          ) : unclaimedBlocks && unclaimedBlocks.length > 0 ? (
            <div className="space-y-2">
              {unclaimedBlocks.map((block: any) => (
                <Card 
                  key={block.id} 
                  className="mobile-card bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-cube text-2xl text-primary animate-pulse"></i>
                      <div>
                        <p className="text-sm font-display font-bold text-primary">
                          BLOCK #{block.blockNumber}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground truncate max-w-[150px]">
                          {block.txHash}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-display font-black text-accent glow-gold">
                        {parseFloat(block.reward).toFixed(8)}
                      </p>
                      <p className="text-xs text-primary">GBTC</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className={`text-xs font-mono px-2 py-1 rounded ${
                      getTimeRemaining(block.expiresAt) === 'EXPIRED' 
                        ? 'bg-destructive/20 text-destructive' 
                        : 'bg-warning/20 text-warning'
                    }`}>
                      <i className="fas fa-clock mr-1"></i>
                      {getTimeRemaining(block.expiresAt)}
                    </div>
                    
                    <Button
                      onClick={() => claimBlockMutation.mutate(block.id)}
                      disabled={
                        claimBlockMutation.isPending || 
                        getTimeRemaining(block.expiresAt) === 'EXPIRED'
                      }
                      className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                      size="sm"
                      data-testid={`button-claim-${block.id}`}
                    >
                      {claimBlockMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <i className="fas fa-hand-holding-usd mr-2"></i>
                          CLAIM
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mobile-card bg-black border-primary/30">
              <div className="text-center py-8">
                <i className="fas fa-cube text-4xl text-muted-foreground mb-3"></i>
                <p className="text-sm text-muted-foreground">No blocks to claim</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {hashPower > 0 
                    ? "New blocks appear every 10 minutes" 
                    : "Purchase hashrate to start mining"}
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Mining Info */}
        <Card className="mobile-card bg-black border-primary/30 mt-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <i className="fas fa-network-wired text-xl text-chart-3 mb-2"></i>
              <p className="text-xs text-muted-foreground">Network</p>
              <p className="text-sm font-display font-bold text-chart-3">100%</p>
            </div>
            <div>
              <i className="fas fa-tachometer-alt text-xl text-chart-4 mb-2"></i>
              <p className="text-xs text-muted-foreground">Efficiency</p>
              <p className="text-sm font-display font-bold text-chart-4">98.5%</p>
            </div>
            <div>
              <i className="fas fa-fire text-xl text-warning mb-2"></i>
              <p className="text-xs text-muted-foreground">Temperature</p>
              <p className="text-sm font-display font-bold text-warning">72°C</p>
            </div>
          </div>
        </Card>

        {/* No Hashrate Warning */}
        {hashPower <= 0 && (
          <Card className="mobile-card bg-destructive/10 border-destructive/30">
            <div className="flex items-center space-x-3">
              <i className="fas fa-exclamation-triangle text-destructive text-xl"></i>
              <div>
                <p className="text-sm font-semibold text-destructive">Mining Inactive</p>
                <p className="text-xs text-muted-foreground">
                  Purchase hashrate to start mining GBTC
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}