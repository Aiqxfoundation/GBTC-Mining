import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function MyMiners() {
  // Fetch miners data
  const { data: minersData, isLoading } = useQuery({
    queryKey: ["/api/my-miners"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const activeMiners = minersData?.miners?.filter((m: any) => m.isActive) || [];
  const inactiveMiners = minersData?.miners?.filter((m: any) => !m.isActive) || [];
  const totalHashPower = minersData?.totalHashPower || 0;

  const getHashrateDisplay = (hashrate: number) => {
    if (hashrate >= 1000000) return `${(hashrate / 1000000).toFixed(2)} PH/s`;
    if (hashrate >= 1000) return `${(hashrate / 1000).toFixed(2)} TH/s`;
    return `${hashrate.toFixed(2)} GH/s`;
  };

  const getLastActiveTime = (lastClaim: string | null) => {
    if (!lastClaim) return "Never";
    
    const now = new Date().getTime();
    const last = new Date(lastClaim).getTime();
    const diff = now - last;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Recently";
  };

  return (
    <div className="mobile-page bg-black">
      {/* Header */}
      <div className="mobile-header bg-gradient-to-r from-primary/20 to-chart-4/20 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-display font-black text-primary">MY MINERS</h1>
          <p className="text-xs text-muted-foreground font-mono">Network Overview</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground font-mono">NETWORK HASH</p>
          <p className="text-lg font-display font-bold text-chart-4">
            {getHashrateDisplay(totalHashPower)}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mobile-content">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="mobile-card bg-gradient-to-br from-success/10 to-success/5 border-success/30">
            <div className="text-center">
              <i className="fas fa-check-circle text-2xl text-success mb-2"></i>
              <p className="text-2xl font-display font-black text-success">
                {activeMiners.length}
              </p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </Card>
          
          <Card className="mobile-card bg-gradient-to-br from-warning/10 to-warning/5 border-warning/30">
            <div className="text-center">
              <i className="fas fa-pause-circle text-2xl text-warning mb-2"></i>
              <p className="text-2xl font-display font-black text-warning">
                {inactiveMiners.length}
              </p>
              <p className="text-xs text-muted-foreground">Inactive</p>
            </div>
          </Card>
          
          <Card className="mobile-card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
            <div className="text-center">
              <i className="fas fa-users text-2xl text-primary mb-2"></i>
              <p className="text-2xl font-display font-black text-primary">
                {activeMiners.length + inactiveMiners.length}
              </p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </Card>
        </div>

        {/* Activity Info */}
        <Card className="mobile-card bg-black border-primary/30 mb-4">
          <div className="flex items-start space-x-3">
            <i className="fas fa-info-circle text-primary mt-0.5"></i>
            <div className="text-xs text-muted-foreground">
              <p className="mb-1">• Miners become <span className="text-success">ACTIVE</span> when they claim blocks</p>
              <p className="mb-1">• Miners become <span className="text-warning">INACTIVE</span> after 48 hours without claiming</p>
              <p>• Track your network's mining performance here</p>
            </div>
          </div>
        </Card>

        {/* Miners List */}
        <div className="space-y-3">
          <p className="text-sm font-mono text-primary">MINER STATUS</p>
          
          {isLoading ? (
            <Card className="mobile-card bg-black border-primary/30">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            </Card>
          ) : (activeMiners.length + inactiveMiners.length) > 0 ? (
            <div className="space-y-2">
              {/* Active Miners */}
              {activeMiners.map((miner: any) => (
                <Card 
                  key={miner.id} 
                  className="mobile-card bg-gradient-to-r from-success/10 to-success/5 border-success/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <i className="fas fa-user-circle text-2xl text-success"></i>
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-success rounded-full animate-pulse"></div>
                      </div>
                      <div>
                        <p className="text-sm font-display font-bold text-white">
                          {miner.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {miner.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-success/20 text-success border-success/30 mb-1">
                        ACTIVE
                      </Badge>
                      <p className="text-xs font-display font-bold text-success">
                        {getHashrateDisplay(miner.hashPower)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getLastActiveTime(miner.lastClaimTime)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
              
              {/* Inactive Miners */}
              {inactiveMiners.map((miner: any) => (
                <Card 
                  key={miner.id} 
                  className="mobile-card bg-gradient-to-r from-warning/10 to-warning/5 border-warning/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <i className="fas fa-user-circle text-2xl text-warning opacity-60"></i>
                      </div>
                      <div>
                        <p className="text-sm font-display font-bold text-white">
                          {miner.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {miner.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-warning/20 text-warning border-warning/30 mb-1">
                        INACTIVE
                      </Badge>
                      <p className="text-xs font-display font-bold text-warning">
                        {getHashrateDisplay(miner.hashPower)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getLastActiveTime(miner.lastClaimTime)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mobile-card bg-black border-primary/30">
              <div className="text-center py-8">
                <i className="fas fa-users text-4xl text-muted-foreground mb-3"></i>
                <p className="text-sm text-muted-foreground">No miners in your network</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Invite others to join your mining network
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Network Stats */}
        <Card className="mobile-card bg-black border-primary/30 mt-4">
          <p className="text-sm font-mono text-primary mb-3">NETWORK STATISTICS</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Total Hashrate</span>
              <span className="text-sm font-display font-bold text-chart-4">
                {getHashrateDisplay(totalHashPower)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Active Rate</span>
              <span className="text-sm font-display font-bold text-success">
                {activeMiners.length + inactiveMiners.length > 0 
                  ? `${((activeMiners.length / (activeMiners.length + inactiveMiners.length)) * 100).toFixed(1)}%`
                  : '0%'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Avg. Miner Hash</span>
              <span className="text-sm font-display font-bold text-primary">
                {activeMiners.length > 0 
                  ? getHashrateDisplay(totalHashPower / (activeMiners.length + inactiveMiners.length))
                  : '0 GH/s'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}