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
import { Loader2, Bitcoin, DollarSign, TrendingUp, ArrowDownCircle, ArrowUpCircle, Send, Activity, Coins, Zap, Shield, Banknote, Wallet, Sparkles, CircleDollarSign } from "lucide-react";
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
  // Separate state for GBTC and USDT withdrawals
  const [gbtcWithdrawAmount, setGbtcWithdrawAmount] = useState("");
  const [gbtcWithdrawAddress, setGbtcWithdrawAddress] = useState("");
  const [usdtWithdrawAmount, setUsdtWithdrawAmount] = useState("");
  const [usdtWithdrawAddress, setUsdtWithdrawAddress] = useState("");

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
      // Clear all withdrawal fields
      setGbtcWithdrawAmount("");
      setGbtcWithdrawAddress("");
      setUsdtWithdrawAmount("");
      setUsdtWithdrawAddress("");
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
    const currentAmount = withdrawType === 'GBTC' ? gbtcWithdrawAmount : usdtWithdrawAmount;
    const currentAddress = withdrawType === 'GBTC' ? gbtcWithdrawAddress : usdtWithdrawAddress;
    
    if (!currentAmount || !currentAddress) {
      toast({ 
        title: "Invalid Input", 
        description: "Please enter amount and address", 
        variant: "destructive" 
      });
      return;
    }
    
    const amount = parseFloat(currentAmount);
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
      amount: currentAmount, 
      address: currentAddress, 
      type: withdrawType 
    });
  };

  const getHashrateDisplay = (hashrate: number) => {
    if (hashrate >= 1000000) return `${(hashrate / 1000000).toFixed(2)} PH/s`;
    if (hashrate >= 1000) return `${(hashrate / 1000).toFixed(2)} TH/s`;
    return `${hashrate.toFixed(2)} GH/s`;
  };

  return (
    <div className="mobile-page bg-gradient-to-b from-black via-gray-900 to-black overflow-hidden">
      {/* Bitcoin Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" 
          style={{ 
            backgroundImage: `repeating-linear-gradient(45deg, #f7931a 0, #f7931a 1px, transparent 1px, transparent 15px),
                             repeating-linear-gradient(-45deg, #f7931a 0, #f7931a 1px, transparent 1px, transparent 15px)`,
            backgroundSize: '20px 20px'
          }}>
        </div>
      </div>

      {/* Header with Bitcoin Orange */}
      <div className="mobile-header bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-lg border-b border-[#f7931a]/30 relative z-10">
        <div>
          <h1 className="text-2xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-[#f7931a] to-[#ff9416]">
            MY WALLET
          </h1>
          <p className="text-xs text-[#f7931a]/60 font-mono">All Digital Assets</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#f7931a]/60 font-mono">USERNAME</p>
          <p className="text-sm font-mono text-[#f7931a] font-bold flex items-center justify-end">
            <Sparkles className="w-3 h-3 mr-1" />
            @{user?.username || 'loading...'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mobile-content relative z-10">
        {/* Total Portfolio Value Card with Bitcoin Theme */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mobile-card bg-gradient-to-br from-[#f7931a]/20 via-[#ff9416]/10 to-[#f7931a]/20 border-[#f7931a]/40 overflow-hidden relative shadow-[0_0_30px_rgba(247,147,26,0.2)]">
            {/* Animated Bitcoin Pattern Background */}
            <div className="absolute inset-0">
              <motion.div
                animate={{ 
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `radial-gradient(circle at 20% 80%, #f7931a 0%, transparent 50%),
                                   radial-gradient(circle at 80% 20%, #ff9416 0%, transparent 50%),
                                   radial-gradient(circle at 40% 40%, #f7931a 0%, transparent 50%)`,
                  backgroundSize: '200% 200%',
                }}
              />
            </div>
            
            <div className="relative z-10 text-center py-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <Bitcoin className="w-6 h-6 text-[#f7931a]" />
                </motion.div>
                <p className="text-sm text-[#f7931a]/80 font-mono uppercase tracking-wider">Total Portfolio Value</p>
              </div>
              
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mb-3"
              >
                <p className="text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-[#f7931a] via-[#ffb347] to-[#f7931a] drop-shadow-[0_2px_10px_rgba(247,147,26,0.5)]">
                  ${totalPortfolioValue.toFixed(2)}
                </p>
              </motion.div>
              
              <div className="flex items-center justify-center space-x-4 text-xs font-mono">
                <span className="flex items-center space-x-1 px-2 py-1 bg-[#f7931a]/10 rounded-full">
                  <Bitcoin className="w-3 h-3 text-[#f7931a]" />
                  <span className="text-[#f7931a]/80">1 GBTC = $10</span>
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Assets Grid with Bitcoin Orange Theme */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* GBTC Balance */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-[#f7931a]/15 to-black border-[#f7931a]/30 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#f7931a]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10 p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#f7931a] to-[#ff9416] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(247,147,26,0.5)]">
                    <Bitcoin className="w-5 h-5 text-black" />
                  </div>
                  <span className="text-[10px] font-mono text-[#f7931a] px-1.5 py-0.5 bg-[#f7931a]/10 rounded">MINED</span>
                </div>
                
                <p className="text-[10px] text-[#f7931a]/60 font-mono mb-0.5">GBTC BALANCE</p>
                <p className="text-lg font-display font-black text-[#f7931a]">
                  {gbtcBalance.toFixed(8)}
                </p>
                <p className="text-[10px] text-[#f7931a]/50 flex items-center mt-1">
                  ≈ ${(gbtcBalance * 10).toFixed(2)}
                </p>
              </div>
            </Card>
          </motion.div>

          {/* USDT Balance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-emerald-500/15 to-black border-emerald-500/30 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10 p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                    <CircleDollarSign className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-mono text-emerald-500 px-1.5 py-0.5 bg-emerald-500/10 rounded">AVAILABLE</span>
                </div>
                
                <p className="text-[10px] text-emerald-500/60 font-mono mb-0.5">USDT BALANCE</p>
                <p className="text-lg font-display font-black text-emerald-500">
                  ${usdtBalance.toFixed(2)}
                </p>
                <p className="text-[10px] text-emerald-500/50 mt-1">
                  Tether USD
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Hashrate Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/15 to-black border-purple-500/30 overflow-hidden relative group">
              <div className="relative z-10 p-3">
                <div className="flex items-center space-x-1.5 mb-1">
                  <Zap className="w-3.5 h-3.5 text-purple-500" />
                  <p className="text-[10px] text-purple-500/60 font-mono">HASHRATE</p>
                </div>
                <p className="text-base font-display font-bold text-purple-500">
                  {getHashrateDisplay(hashPower)}
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Unclaimed Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-amber-500/15 to-black border-amber-500/30 overflow-hidden relative group">
              <div className="relative z-10 p-3">
                <div className="flex items-center space-x-1.5 mb-1">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <p className="text-[10px] text-amber-500/60 font-mono">UNCLAIMED</p>
                </div>
                <p className="text-base font-display font-bold text-amber-500">
                  {unclaimedBalance.toFixed(8)}
                </p>
                <p className="text-[9px] text-amber-500/50">GBTC</p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Action Buttons with Bitcoin Theme */}
        <div className="space-y-2 mb-3">
          {/* Deposit Button */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button
              onClick={() => setLocation("/deposit")}
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-500/20"
              data-testid="button-deposit"
            >
              <ArrowDownCircle className="w-4 h-4 mr-2" />
              <span className="font-bold">DEPOSIT USDT</span>
            </Button>
          </motion.div>

          {/* Withdraw Button */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button
              onClick={() => setShowWithdrawDialog(true)}
              className="w-full h-12 bg-gradient-to-r from-[#f7931a] to-[#ff9416] hover:from-[#ff9416] hover:to-[#f7931a] shadow-[0_0_20px_rgba(247,147,26,0.3)] text-black font-bold border border-[#f7931a]/20"
              data-testid="button-withdraw"
            >
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              WITHDRAW
            </Button>
          </motion.div>

          {/* Send GBTC Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Button
              onClick={() => setShowSendDialog(true)}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-[0_0_20px_rgba(147,51,234,0.3)] border border-purple-500/20"
              data-testid="button-send"
            >
              <Send className="w-4 h-4 mr-2" />
              <span className="font-bold">SEND GBTC</span>
            </Button>
          </motion.div>
        </div>

        {/* Recent Activity with Bitcoin Theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="mobile-card bg-black/80 border-[#f7931a]/20">
            <div className="flex items-center space-x-2 mb-3">
              <Activity className="w-4 h-4 text-[#f7931a]" />
              <p className="text-xs font-mono text-[#f7931a] uppercase tracking-wider">Recent Activity</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 px-2 bg-gradient-to-r from-[#f7931a]/10 to-transparent rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#f7931a] to-[#ff9416] rounded flex items-center justify-center">
                    <Bitcoin className="w-3 h-3 text-black" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Mining Reward</p>
                    <p className="text-[10px] text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <p className="text-xs font-mono text-[#f7931a]">+0.625 GBTC</p>
              </div>
              
              <div className="flex justify-between items-center py-2 px-2 bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-500 rounded flex items-center justify-center">
                    <Zap className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Hashrate Purchase</p>
                    <p className="text-[10px] text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <p className="text-xs font-mono text-red-500">-1000 USDT</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Send GBTC Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-black to-gray-900 border-[#f7931a]/20">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center space-x-2 text-[#f7931a]">
              <Bitcoin className="w-5 h-5" />
              <span>Send GBTC</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient" className="text-[#f7931a]/80">Recipient Username</Label>
              <Input
                id="recipient"
                value={recipientUsername}
                onChange={(e) => setRecipientUsername(e.target.value)}
                placeholder="Enter @username"
                className="bg-black/50 border-[#f7931a]/20 focus:border-[#f7931a]/50"
                data-testid="input-recipient"
              />
            </div>
            <div>
              <Label htmlFor="amount" className="text-[#f7931a]/80">Amount (GBTC)</Label>
              <div className="relative">
                <Bitcoin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#f7931a]/50" />
                <Input
                  id="amount"
                  type="number"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder="0.00000000"
                  step="0.00000001"
                  max={gbtcBalance}
                  className="pl-10 bg-black/50 border-[#f7931a]/20 focus:border-[#f7931a]/50"
                  data-testid="input-send-amount"
                />
              </div>
              <p className="text-xs text-[#f7931a]/60 mt-1">
                Available: {gbtcBalance.toFixed(8)} GBTC
              </p>
            </div>
            <Button
              onClick={handleSend}
              disabled={sendGbtcMutation.isPending}
              className="w-full bg-gradient-to-r from-[#f7931a] to-[#ff9416] hover:from-[#ff9416] hover:to-[#f7931a] text-black font-bold"
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
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-black to-gray-900 border-[#f7931a]/20">
          <DialogHeader>
            <DialogTitle className="font-display text-[#f7931a]">Withdraw Funds</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Currency Selection */}
            <div>
              <Label className="text-[#f7931a]/80">Select Currency</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant={withdrawType === 'GBTC' ? 'default' : 'outline'}
                  onClick={() => setWithdrawType('GBTC')}
                  className={withdrawType === 'GBTC' ? 'bg-gradient-to-r from-[#f7931a] to-[#ff9416] text-black' : 'border-[#f7931a]/20'}
                >
                  <Bitcoin className="w-4 h-4 mr-2" />
                  GBTC
                </Button>
                <Button
                  variant={withdrawType === 'USDT' ? 'default' : 'outline'}
                  onClick={() => setWithdrawType('USDT')}
                  className={withdrawType === 'USDT' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'border-emerald-500/20'}
                >
                  <CircleDollarSign className="w-4 h-4 mr-2" />
                  USDT
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="withdraw-amount" className="text-[#f7931a]/80">Amount</Label>
              <div className="relative">
                {withdrawType === 'GBTC' ? (
                  <Bitcoin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#f7931a]/50" />
                ) : (
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50" />
                )}
                <Input
                  id="withdraw-amount"
                  type="number"
                  value={withdrawType === 'GBTC' ? gbtcWithdrawAmount : usdtWithdrawAmount}
                  onChange={(e) => {
                    if (withdrawType === 'GBTC') {
                      setGbtcWithdrawAmount(e.target.value);
                    } else {
                      setUsdtWithdrawAmount(e.target.value);
                    }
                  }}
                  placeholder={withdrawType === 'GBTC' ? "0.00000000" : "0.00"}
                  step={withdrawType === 'GBTC' ? "0.00000001" : "0.01"}
                  max={withdrawType === 'GBTC' ? gbtcBalance : usdtBalance}
                  className="pl-10 bg-black/50 border-[#f7931a]/20 focus:border-[#f7931a]/50"
                  data-testid="input-withdraw-amount"
                />
              </div>
              <p className="text-xs text-[#f7931a]/60 mt-1">
                Available: {withdrawType === 'GBTC' 
                  ? `${gbtcBalance.toFixed(8)} GBTC` 
                  : `$${usdtBalance.toFixed(2)} USDT`}
              </p>
            </div>
            
            <div>
              <Label htmlFor="withdraw-address" className="text-[#f7931a]/80">Wallet Address</Label>
              <Input
                id="withdraw-address"
                value={withdrawType === 'GBTC' ? gbtcWithdrawAddress : usdtWithdrawAddress}
                onChange={(e) => {
                  if (withdrawType === 'GBTC') {
                    setGbtcWithdrawAddress(e.target.value);
                  } else {
                    setUsdtWithdrawAddress(e.target.value);
                  }
                }}
                placeholder={withdrawType === 'GBTC' ? "Enter GBTC address" : "Enter USDT (ERC-20) address"}
                className="bg-black/50 border-[#f7931a]/20 focus:border-[#f7931a]/50 font-mono text-xs"
                data-testid="input-withdraw-address"
              />
            </div>
            
            {withdrawType === 'GBTC' ? (
              <Button
                disabled
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 cursor-not-allowed opacity-75"
                data-testid="button-confirm-withdraw"
              >
                <span className="flex items-center justify-center">
                  <ArrowUpCircle className="w-4 h-4 mr-2 opacity-50" />
                  Withdraw GBTC - Coming Soon
                </span>
              </Button>
            ) : (
              <Button
                onClick={handleWithdraw}
                disabled={withdrawMutation.isPending}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 font-bold"
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
                    Withdraw USDT
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}