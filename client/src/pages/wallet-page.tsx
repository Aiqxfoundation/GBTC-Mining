import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bitcoin, DollarSign, TrendingUp, ArrowDownCircle, ArrowUpCircle, Send, Activity, Coins, Zap, Shield, Banknote, Wallet } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function WalletPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawType, setWithdrawType] = useState<'GBTC' | 'USDT'>('GBTC');
  const [recipientUsername, setRecipientUsername] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");

  const usdtBalance = parseFloat(user?.usdtBalance || '0');
  const gbtcBalance = parseFloat(user?.gbtcBalance || '0');
  const hashPower = parseFloat(user?.hashPower || '0');
  const unclaimedBalance = parseFloat(user?.unclaimedBalance || '0');
  
  // Calculate total portfolio value (1 GBTC = $10 USD)
  const totalPortfolioValue = usdtBalance + (gbtcBalance * 10);

  const sendGbtcMutation = useMutation({
    mutationFn: async (data: { toUsername: string; amount: string }) => {
      const res = await apiRequest("POST", "/api/transfer", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Transfer Successful", 
        description: `Successfully sent ${sendAmount} GBTC` 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setShowSendDialog(false);
      setRecipientUsername("");
      setSendAmount("");
    },
    onError: (error: Error) => {
      toast({ 
        title: "Transfer Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: string; address: string; type: string }) => {
      const res = await apiRequest("POST", "/api/withdrawals", {
        amount: data.amount,
        address: data.address,
        network: data.type === 'USDT' ? 'ERC20' : 'GBTC'
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Withdrawal Requested", 
        description: `Your ${withdrawType} withdrawal is being processed` 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setShowWithdrawDialog(false);
      setWithdrawAmount("");
      setWithdrawAddress("");
    },
    onError: (error: Error) => {
      toast({ 
        title: "Withdrawal Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const handleSend = () => {
    if (!recipientUsername || !sendAmount) {
      toast({ 
        title: "Invalid Input", 
        description: "Please enter recipient and amount", 
        variant: "destructive" 
      });
      return;
    }
    if (parseFloat(sendAmount) > gbtcBalance) {
      toast({ 
        title: "Insufficient Balance", 
        description: "You don't have enough GBTC", 
        variant: "destructive" 
      });
      return;
    }
    sendGbtcMutation.mutate({ toUsername: recipientUsername, amount: sendAmount });
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || !withdrawAddress) {
      toast({ 
        title: "Invalid Input", 
        description: "Please enter amount and address", 
        variant: "destructive" 
      });
      return;
    }
    
    const amount = parseFloat(withdrawAmount);
    const maxAmount = withdrawType === 'GBTC' ? gbtcBalance : usdtBalance;
    
    if (amount > maxAmount) {
      toast({ 
        title: "Insufficient Balance", 
        description: `You don't have enough ${withdrawType}`, 
        variant: "destructive" 
      });
      return;
    }
    
    withdrawMutation.mutate({ 
      amount: withdrawAmount, 
      address: withdrawAddress, 
      type: withdrawType 
    });
  };

  const getHashrateDisplay = (hashrate: number) => {
    if (hashrate >= 1000000) return `${(hashrate / 1000000).toFixed(2)} PH/s`;
    if (hashrate >= 1000) return `${(hashrate / 1000).toFixed(2)} TH/s`;
    return `${hashrate.toFixed(2)} GH/s`;
  };

  return (
    <div className="mobile-page bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Header */}
      <div className="mobile-header bg-black/80 backdrop-blur-lg border-b border-primary/20">
        <div>
          <h1 className="text-xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            MY WALLET
          </h1>
          <p className="text-xs text-muted-foreground font-mono">All Assets</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground font-mono">USERNAME</p>
          <p className="text-sm font-mono text-primary font-bold">
            @{user?.username || 'loading...'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mobile-content">
        {/* Total Portfolio Value Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mobile-card bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 border-primary/30 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10 text-center py-6">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Wallet className="w-5 h-5 text-primary/60" />
                <p className="text-sm text-muted-foreground font-mono">TOTAL PORTFOLIO VALUE</p>
              </div>
              
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-2"
              >
                <p className="text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
                  ${totalPortfolioValue.toFixed(2)}
                </p>
              </motion.div>
              
              <div className="flex items-center justify-center space-x-4 text-xs font-mono">
                <span className="flex items-center space-x-1">
                  <Bitcoin className="w-3 h-3 text-primary" />
                  <span className="text-muted-foreground">1 GBTC</span>
                </span>
                <span className="text-primary">≈</span>
                <span className="flex items-center space-x-1">
                  <DollarSign className="w-3 h-3 text-accent" />
                  <span className="text-muted-foreground">$10 USD</span>
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Assets Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* GBTC Balance */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="mobile-card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 overflow-hidden">
              <div className="relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg">
                      <Bitcoin className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-mono text-success px-2 py-1 bg-success/10 rounded">MINED</span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground font-mono mb-1">GBTC BALANCE</p>
                  <p className="text-2xl font-display font-black text-primary mb-1">
                    {gbtcBalance.toFixed(8)}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1 text-success" />
                    ≈ ${(gbtcBalance * 10).toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* USDT Balance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="mobile-card bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 overflow-hidden">
              <div className="relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-accent/10 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent to-chart-1 rounded-lg flex items-center justify-center shadow-lg">
                      <Banknote className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-mono text-accent px-2 py-1 bg-accent/10 rounded">AVAILABLE</span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground font-mono mb-1">USDT BALANCE</p>
                  <p className="text-2xl font-display font-black text-accent mb-1">
                    ${usdtBalance.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Shield className="w-3 h-3 mr-1 text-accent" />
                    Tether USD
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Mining Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="mobile-card bg-black/50 border-primary/20">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gradient-to-br from-chart-4/10 to-transparent rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-chart-4" />
                  <p className="text-xs text-muted-foreground font-mono">HASHRATE</p>
                </div>
                <p className="text-lg font-display font-bold text-chart-4">
                  {getHashrateDisplay(hashPower)}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-warning/10 to-transparent rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Coins className="w-4 h-4 text-warning" />
                  <p className="text-xs text-muted-foreground font-mono">UNCLAIMED</p>
                </div>
                <p className="text-lg font-display font-bold text-warning">
                  {unclaimedBalance.toFixed(8)}
                </p>
                <p className="text-[10px] text-muted-foreground">GBTC</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Deposit Button */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button
              onClick={() => setLocation("/deposit")}
              className="w-full h-14 bg-gradient-to-r from-success to-accent hover:from-success/90 hover:to-accent/90 shadow-lg"
              data-testid="button-deposit"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <ArrowDownCircle className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <p className="text-sm font-display font-bold">DEPOSIT USDT</p>
                    <p className="text-xs opacity-80">Add funds to your wallet</p>
                  </div>
                </div>
                <Banknote className="w-5 h-5 opacity-50" />
              </div>
            </Button>
          </motion.div>

          {/* Withdraw Button */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button
              onClick={() => setShowWithdrawDialog(true)}
              className="w-full h-14 bg-gradient-to-r from-chart-3 to-warning hover:from-chart-3/90 hover:to-warning/90 shadow-lg"
              data-testid="button-withdraw"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <ArrowUpCircle className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <p className="text-sm font-display font-bold">WITHDRAW</p>
                    <p className="text-xs opacity-80">Cash out GBTC or USDT</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Bitcoin className="w-4 h-4 opacity-50" />
                  <span className="text-xs opacity-50">/</span>
                  <Banknote className="w-4 h-4 opacity-50" />
                </div>
              </div>
            </Button>
          </motion.div>

          {/* Send GBTC Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button
              onClick={() => setShowSendDialog(true)}
              className="w-full h-14 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg"
              data-testid="button-send"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Send className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <p className="text-sm font-display font-bold">SEND GBTC</p>
                    <p className="text-xs opacity-80">Transfer to another user</p>
                  </div>
                </div>
                <Bitcoin className="w-5 h-5 opacity-50" />
              </div>
            </Button>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="mobile-card mt-4 bg-black/50 border-primary/20">
            <div className="flex items-center space-x-2 mb-3">
              <Activity className="w-4 h-4 text-primary" />
              <p className="text-sm font-mono text-primary">RECENT ACTIVITY</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center py-3 px-2 bg-gradient-to-r from-primary/5 to-transparent rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                    <Bitcoin className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Mining Reward</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <p className="text-sm font-mono text-success">+0.625 GBTC</p>
              </div>
              
              <div className="flex justify-between items-center py-3 px-2 bg-gradient-to-r from-chart-4/5 to-transparent rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-chart-4 to-chart-3 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Hashrate Purchase</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <p className="text-sm font-mono text-destructive">-1000 USDT</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Send GBTC Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-background to-background/95 border-primary/20">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center space-x-2">
              <Bitcoin className="w-5 h-5 text-primary" />
              <span>Send GBTC</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient">Recipient Username</Label>
              <Input
                id="recipient"
                value={recipientUsername}
                onChange={(e) => setRecipientUsername(e.target.value)}
                placeholder="Enter @username"
                className="bg-black/20 border-primary/20"
                data-testid="input-recipient"
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount (GBTC)</Label>
              <div className="relative">
                <Bitcoin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                <Input
                  id="amount"
                  type="number"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder="0.00000000"
                  step="0.00000001"
                  max={gbtcBalance}
                  className="pl-10 bg-black/20 border-primary/20"
                  data-testid="input-send-amount"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Available: {gbtcBalance.toFixed(8)} GBTC
              </p>
            </div>
            <Button
              onClick={handleSend}
              disabled={sendGbtcMutation.isPending}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              data-testid="button-confirm-send"
            >
              {sendGbtcMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send GBTC
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-background to-background/95 border-primary/20">
          <DialogHeader>
            <DialogTitle className="font-display">Withdraw Funds</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Currency Selection */}
            <div>
              <Label>Select Currency</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant={withdrawType === 'GBTC' ? 'default' : 'outline'}
                  onClick={() => setWithdrawType('GBTC')}
                  className={withdrawType === 'GBTC' ? 'bg-gradient-to-r from-primary to-accent' : ''}
                >
                  <Bitcoin className="w-4 h-4 mr-2" />
                  GBTC
                </Button>
                <Button
                  variant={withdrawType === 'USDT' ? 'default' : 'outline'}
                  onClick={() => setWithdrawType('USDT')}
                  className={withdrawType === 'USDT' ? 'bg-gradient-to-r from-accent to-chart-1' : ''}
                >
                  <Banknote className="w-4 h-4 mr-2" />
                  USDT
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="withdraw-amount">Amount</Label>
              <div className="relative">
                {withdrawType === 'GBTC' ? (
                  <Bitcoin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                ) : (
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/50" />
                )}
                <Input
                  id="withdraw-amount"
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={withdrawType === 'GBTC' ? "0.00000000" : "0.00"}
                  step={withdrawType === 'GBTC' ? "0.00000001" : "0.01"}
                  max={withdrawType === 'GBTC' ? gbtcBalance : usdtBalance}
                  className="pl-10 bg-black/20 border-primary/20"
                  data-testid="input-withdraw-amount"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Available: {withdrawType === 'GBTC' 
                  ? `${gbtcBalance.toFixed(8)} GBTC` 
                  : `$${usdtBalance.toFixed(2)} USDT`}
              </p>
            </div>
            
            <div>
              <Label htmlFor="withdraw-address">Wallet Address</Label>
              <Input
                id="withdraw-address"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                placeholder={withdrawType === 'GBTC' ? "Enter GBTC address" : "Enter USDT address"}
                className="bg-black/20 border-primary/20 font-mono text-xs"
                data-testid="input-withdraw-address"
              />
            </div>
            
            <Button
              onClick={handleWithdraw}
              disabled={withdrawMutation.isPending}
              className="w-full bg-gradient-to-r from-chart-3 to-warning hover:from-chart-3/90 hover:to-warning/90"
              data-testid="button-confirm-withdraw"
            >
              {withdrawMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowUpCircle className="w-4 h-4 mr-2" />
                  Withdraw {withdrawType}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}