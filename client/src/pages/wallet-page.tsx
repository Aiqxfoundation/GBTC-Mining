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
import { Loader2, ArrowDownCircle, ArrowUpCircle, Send, Zap, Coins, CircleDollarSign, Copy, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function WalletPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawType, setWithdrawType] = useState<'GBTC' | 'USDT'>('USDT');
  const [recipientUsername, setRecipientUsername] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [gbtcWithdrawAmount, setGbtcWithdrawAmount] = useState("");
  const [gbtcWithdrawAddress, setGbtcWithdrawAddress] = useState("");
  const [usdtWithdrawAmount, setUsdtWithdrawAmount] = useState("");
  const [usdtWithdrawAddress, setUsdtWithdrawAddress] = useState("");
  const [copiedAddress, setCopiedAddress] = useState(false);

  const usdtBalance = parseFloat(user?.usdtBalance || '0');
  const gbtcBalance = parseFloat(user?.gbtcBalance || '0');
  const hashPower = parseFloat(user?.hashPower || '0');
  const unclaimedBalance = parseFloat(user?.unclaimedBalance || '0');
  
  // Calculate total portfolio value (1 GBTC = $10 USD)
  const totalPortfolioValue = usdtBalance + (gbtcBalance * 10);
  
  // Generate wallet address for user
  const walletAddress = user?.id ? `0x${user.id.replace(/-/g, '').substring(0, 40)}` : '';

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
        network: data.type === 'USDT' ? 'BSC' : 'GBTC'
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

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <div className="mobile-page bg-black">
      {/* Professional Header */}
      <div className="mobile-header bg-black/90 backdrop-blur-sm border-b border-[#f7931a]/20">
        <div>
          <h1 className="text-base font-medium text-white">Digital Wallet</h1>
          <p className="text-xs text-gray-500">@{user?.username || 'loading'}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total Value</p>
          <p className="text-sm font-medium text-white">
            ${totalPortfolioValue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mobile-content">
        {/* Wallet Address Card */}
        <Card className="p-3 mb-4 bg-gray-950 border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
              <p className="text-xs font-mono text-gray-300 truncate pr-2">{walletAddress}</p>
            </div>
            <Button
              onClick={copyAddress}
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-gray-800"
              data-testid="button-copy-address"
            >
              {copiedAddress ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </Button>
          </div>
        </Card>

        {/* Balance Cards - Compact Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* GBTC Balance */}
          <Card className="p-3 bg-gray-950 border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-[#f7931a] rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">₿</span>
              </div>
              <span className="text-[10px] text-[#f7931a] font-medium">GBTC</span>
            </div>
            <p className="text-lg font-semibold text-white mb-0.5">
              {gbtcBalance.toFixed(8)}
            </p>
            <p className="text-[10px] text-gray-500">
              ≈ ${(gbtcBalance * 10).toFixed(2)} USD
            </p>
          </Card>

          {/* USDT Balance */}
          <Card className="p-3 bg-gray-950 border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <CircleDollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] text-green-600 font-medium">USDT</span>
            </div>
            <p className="text-lg font-semibold text-white mb-0.5">
              ${usdtBalance.toFixed(2)}
            </p>
            <p className="text-[10px] text-gray-500">
              Tether USD
            </p>
          </Card>

          {/* Mining Stats */}
          <Card className="p-3 bg-gray-950 border-gray-800">
            <div className="flex items-center space-x-2 mb-1.5">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-[10px] text-gray-500">Hash Power</span>
            </div>
            <p className="text-sm font-medium text-white">
              {getHashrateDisplay(hashPower)}
            </p>
          </Card>

          {/* Unclaimed */}
          <Card className="p-3 bg-gray-950 border-gray-800">
            <div className="flex items-center space-x-2 mb-1.5">
              <Coins className="w-4 h-4 text-orange-500" />
              <span className="text-[10px] text-gray-500">Unclaimed</span>
            </div>
            <p className="text-sm font-medium text-white">
              {unclaimedBalance.toFixed(8)}
            </p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button
            onClick={() => setLocation("/deposit")}
            className="h-10 bg-green-600 hover:bg-green-700 text-white font-medium text-sm"
            data-testid="button-deposit"
          >
            <ArrowDownCircle className="w-4 h-4 mr-1.5" />
            Deposit
          </Button>
          
          <Button
            onClick={() => setLocation("/withdraw")}
            className="h-10 bg-[#f7931a] hover:bg-[#e88309] text-black font-medium text-sm"
            data-testid="button-withdraw-page"
          >
            <ArrowUpCircle className="w-4 h-4 mr-1.5" />
            Withdraw
          </Button>
        </div>

        {/* Additional Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => setShowSendDialog(true)}
            variant="outline"
            className="w-full h-10 border-gray-800 bg-gray-950 hover:bg-gray-900 text-white font-medium text-sm"
            data-testid="button-send"
          >
            <Send className="w-4 h-4 mr-2" />
            Send GBTC
          </Button>

          {unclaimedBalance > 0 && (
            <Button
              onClick={() => setLocation("/mining")}
              variant="outline"
              className="w-full h-10 border-orange-900 bg-orange-950/20 hover:bg-orange-950/30 text-orange-500 font-medium text-sm"
              data-testid="button-claim"
            >
              <Coins className="w-4 h-4 mr-2" />
              Claim {unclaimedBalance.toFixed(8)} GBTC
            </Button>
          )}
        </div>

        {/* Recent Activity Card */}
        <Card className="p-3 mt-4 bg-gray-950 border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-gray-400">Recent Activity</h3>
            <Button
              onClick={() => setLocation("/transactions")}
              variant="ghost"
              size="sm"
              className="text-xs text-[#f7931a] hover:text-[#e88309] p-0 h-auto"
              data-testid="button-view-all"
            >
              View All
            </Button>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-600 text-center py-2">No recent transactions</p>
          </div>
        </Card>
      </div>

      {/* Send GBTC Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="sm:max-w-md bg-gray-950 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white font-medium flex items-center">
              <span className="text-[#f7931a] mr-2">₿</span>
              Send GBTC
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient" className="text-gray-400 text-sm">Recipient Username</Label>
              <Input
                id="recipient"
                value={recipientUsername}
                onChange={(e) => setRecipientUsername(e.target.value)}
                placeholder="Enter username"
                className="bg-black border-gray-800 text-white placeholder:text-gray-600"
                data-testid="input-recipient"
              />
            </div>
            <div>
              <Label htmlFor="amount" className="text-gray-400 text-sm">Amount (GBTC)</Label>
              <Input
                id="amount"
                type="number"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                placeholder="0.00000000"
                step="0.00000001"
                max={gbtcBalance}
                className="bg-black border-gray-800 text-white placeholder:text-gray-600"
                data-testid="input-send-amount"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available: {gbtcBalance.toFixed(8)} GBTC
              </p>
            </div>
            <Button
              onClick={handleSend}
              disabled={sendGbtcMutation.isPending}
              className="w-full bg-[#f7931a] hover:bg-[#e88309] text-black font-medium"
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
        <DialogContent className="sm:max-w-md bg-gray-950 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white font-medium">Withdraw Funds</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Currency Selection */}
            <div>
              <Label className="text-gray-400 text-sm">Select Currency</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant={withdrawType === 'GBTC' ? 'default' : 'outline'}
                  onClick={() => setWithdrawType('GBTC')}
                  className={withdrawType === 'GBTC' ? 'bg-[#f7931a] hover:bg-[#e88309] text-black' : 'border-gray-800 text-gray-400'}
                >
                  <span className="mr-2">₿</span>
                  GBTC
                </Button>
                <Button
                  variant={withdrawType === 'USDT' ? 'default' : 'outline'}
                  onClick={() => setWithdrawType('USDT')}
                  className={withdrawType === 'USDT' ? 'bg-green-600 hover:bg-green-700' : 'border-gray-800 text-gray-400'}
                >
                  <CircleDollarSign className="w-4 h-4 mr-2" />
                  USDT
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="withdraw-amount" className="text-gray-400 text-sm">Amount</Label>
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
                className="bg-black border-gray-800 text-white placeholder:text-gray-600"
                data-testid="input-withdraw-amount"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available: {withdrawType === 'GBTC' 
                  ? `${gbtcBalance.toFixed(8)} GBTC` 
                  : `$${usdtBalance.toFixed(2)} USDT`}
              </p>
            </div>
            
            <div>
              <Label htmlFor="withdraw-address" className="text-gray-400 text-sm">Wallet Address</Label>
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
                placeholder={withdrawType === 'GBTC' ? "Enter GBTC address" : "Enter USDT address"}
                className="bg-black border-gray-800 text-white placeholder:text-gray-600 font-mono text-xs"
                data-testid="input-withdraw-address"
              />
            </div>
            
            {withdrawType === 'GBTC' ? (
              <Button
                disabled
                className="w-full bg-gray-700 cursor-not-allowed opacity-50"
                data-testid="button-confirm-withdraw"
              >
                GBTC Withdrawals Coming Soon
              </Button>
            ) : (
              <Button
                onClick={handleWithdraw}
                disabled={withdrawMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700 font-medium"
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