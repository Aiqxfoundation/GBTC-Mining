import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import bitcoinLogo from "@assets/file_00000000221c61fab63936953b889556_1756633909848.png";

export default function DashboardPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [depositForm, setDepositForm] = useState({ network: "BSC", txHash: "", amount: "" });
  const [hashPowerAmount, setHashPowerAmount] = useState([1]);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const depositMutation = useMutation({
    mutationFn: async (data: { network: string; txHash: string; amount: string }) => {
      const res = await apiRequest("POST", "/api/deposits", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Deposit submitted", description: "Your deposit is pending admin approval." });
      setDepositForm({ network: "BSC", txHash: "", amount: "" });
    },
    onError: (error: Error) => {
      toast({ title: "Deposit failed", description: error.message, variant: "destructive" });
    }
  });

  const purchasePowerMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest("POST", "/api/purchase-power", { amount });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Hash power purchased", description: "Successfully purchased hash power." });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({ title: "Purchase failed", description: error.message, variant: "destructive" });
    }
  });

  const claimRewardsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/claim-rewards");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Rewards claimed", description: "Mining rewards have been claimed successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({ title: "Claim failed", description: error.message, variant: "destructive" });
    }
  });

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositForm.txHash && depositForm.amount) {
      depositMutation.mutate(depositForm);
    }
  };

  const handlePurchasePower = () => {
    purchasePowerMutation.mutate(hashPowerAmount[0]);
  };

  const handleClaimRewards = () => {
    claimRewardsMutation.mutate();
  };

  const networkAddresses = {
    BSC: "0xc1de03ab9892b9eb1deed8a2dd453b7fcefea9e9",
    ETH: "0xc1de03ab9892b9eb1deed8a2dd453b7fcefea9e9",
    TRC20: "THLwx1Ejfo8nSUjeVahCxTbxm7jCLkusPc",
    APTOS: "0xa02e7dfd29bde133c04b2b2c3a6f6623bcab6865211635dbc8271d51ec8ae053"
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <img src={bitcoinLogo} alt="GBTC" className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">Green Bitcoin</h1>
                <p className="text-xs text-muted-foreground">GBTC Mining Platform</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-foreground hover:text-primary transition-colors">
                <i className="fas fa-home mr-2"></i>Home
              </Link>
              <button className="text-primary transition-colors">
                <i className="fas fa-tachometer-alt mr-2"></i>Dashboard
              </button>
              {user.isAdmin && (
                <Link href="/admin" className="text-foreground hover:text-primary transition-colors">
                  <i className="fas fa-cog mr-2"></i>Admin
                </Link>
              )}
              <button 
                onClick={() => logoutMutation.mutate()}
                className="text-foreground hover:text-destructive transition-colors"
                data-testid="button-logout"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="text-primary" data-testid="text-username">{user.username}</span>
          </h1>
          <p className="text-muted-foreground">Monitor your mining operations and manage your GBTC holdings</p>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">USDT Balance</p>
                  <p className="text-2xl font-bold text-accent" data-testid="text-usdt-balance">
                    ${parseFloat(user.usdtBalance).toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-dollar-sign text-accent"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">My Hash Power</p>
                  <p className="text-2xl font-bold text-primary" data-testid="text-hash-power">
                    {parseFloat(user.hashPower).toFixed(2)} TH/s
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-microchip text-primary"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">GBTC Balance</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-gbtc-balance">
                    {parseFloat(user.gbtcBalance).toFixed(4)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-chart-3/20 rounded-lg flex items-center justify-center">
                  <img src={bitcoinLogo} alt="GBTC" className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unclaimed Rewards</p>
                  <p className="text-2xl font-bold text-accent" data-testid="text-unclaimed-rewards">
                    {parseFloat(user.unclaimedBalance).toFixed(4)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-coins text-accent"></i>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Deposit Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-wallet text-primary mr-3"></i>
                  Deposit Cryptocurrency
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Network Selection */}
                <div className="mb-6">
                  <Label className="text-sm font-medium mb-4 block">Select Network:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(networkAddresses).map(([network, address]) => (
                      <div 
                        key={network}
                        className={`network-badge bg-background p-4 rounded-lg border cursor-pointer transition-all ${
                          depositForm.network === network ? 'border-primary' : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setDepositForm(prev => ({ ...prev, network }))}
                        data-testid={`network-${network.toLowerCase()}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">USDT {network}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            network === 'BSC' ? 'bg-accent/20 text-accent' :
                            network === 'ETH' ? 'bg-chart-4/20 text-chart-4' :
                            network === 'TRC20' ? 'bg-destructive/20 text-destructive' :
                            'bg-chart-3/20 text-chart-3'
                          }`}>
                            {network === 'BSC' ? 'BEP-20' : network === 'ETH' ? 'ERC-20' : network}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground code-font break-all">{address}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Transaction Form */}
                <form onSubmit={handleDeposit} className="space-y-4">
                  <div>
                    <Label htmlFor="txHash">Transaction Hash</Label>
                    <Input
                      id="txHash"
                      type="text"
                      placeholder="Enter your transaction hash"
                      value={depositForm.txHash}
                      onChange={(e) => setDepositForm(prev => ({ ...prev, txHash: e.target.value }))}
                      className="code-font text-sm"
                      required
                      data-testid="input-tx-hash"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="amount">Amount (USDT)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="1"
                      value={depositForm.amount}
                      onChange={(e) => setDepositForm(prev => ({ ...prev, amount: e.target.value }))}
                      required
                      data-testid="input-deposit-amount"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={depositMutation.isPending}
                    data-testid="button-submit-deposit"
                  >
                    {depositMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <i className="fas fa-paper-plane mr-2"></i>
                    )}
                    Submit Deposit
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Hash Power Purchase */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-shopping-cart text-accent mr-3"></i>
                  Purchase Hash Power
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <Label className="text-sm font-medium">Amount (USDT)</Label>
                      <span className="text-sm text-muted-foreground">Rate: 1 USDT = 1 TH/s</span>
                    </div>
                    <Slider
                      value={hashPowerAmount}
                      onValueChange={setHashPowerAmount}
                      max={100}
                      min={1}
                      step={1}
                      className="w-full"
                      data-testid="slider-hash-power"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>$1</span>
                      <span className="font-semibold text-primary" data-testid="text-selected-amount">
                        ${hashPowerAmount[0]}
                      </span>
                      <span>$100</span>
                    </div>
                  </div>
                  
                  <div className="bg-background p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">You will receive:</span>
                      <span className="font-semibold text-primary" data-testid="text-hash-power-received">
                        {hashPowerAmount[0]} TH/s
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handlePurchasePower}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    disabled={purchasePowerMutation.isPending || parseFloat(user.usdtBalance) < hashPowerAmount[0]}
                    data-testid="button-purchase-power"
                  >
                    {purchasePowerMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <i className="fas fa-bolt mr-2"></i>
                    )}
                    Purchase Power
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column */}
          <div className="space-y-8">
            {/* Mining Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-pickaxe text-primary mr-3"></i>
                  Mining Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Block Reward:</span>
                    <span className="font-semibold text-primary">6.25 GBTC</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unclaimed Rewards:</span>
                    <span className="font-semibold text-accent" data-testid="text-unclaimed-mining">
                      {parseFloat(user.unclaimedBalance).toFixed(4)} GBTC
                    </span>
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <Button 
                      onClick={handleClaimRewards}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mining-animation"
                      disabled={claimRewardsMutation.isPending || parseFloat(user.unclaimedBalance) === 0}
                      data-testid="button-claim-rewards"
                    >
                      {claimRewardsMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <i className="fas fa-coins mr-2"></i>
                      )}
                      Claim Rewards
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
                    <i className="fas fa-chart-line mr-2"></i>
                    View Statistics
                  </Button>
                  
                  <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
                    <i className="fas fa-history mr-2"></i>
                    Transaction History
                  </Button>
                  
                  <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
                    <i className="fas fa-download mr-2"></i>
                    Withdraw GBTC
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
