import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, ChevronRight, Copy, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out';
  amount: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  network?: string;
  address?: string;
  fromUsername?: string;
  toUsername?: string;
}

interface TransactionData {
  deposits: Transaction[];
  withdrawals: Transaction[];
  sentTransfers: Transaction[];
  receivedTransfers: Transaction[];
}

export default function WalletPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedAsset, setSelectedAsset] = useState<'GBTC' | 'USDT' | null>(null);
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [recipientUsername, setRecipientUsername] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositTxHash, setDepositTxHash] = useState("");
  const [copiedAddress, setCopiedAddress] = useState(false);

  const usdtBalance = parseFloat(user?.usdtBalance || '0');
  const gbtcBalance = parseFloat(user?.gbtcBalance || '0');

  // Generate system deposit addresses
  const systemGBTCAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
  const systemUSDTAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";

  // Fetch transactions
  const { data: transactions } = useQuery<TransactionData>({
    queryKey: ["/api/transactions"],
    enabled: !!user && !!selectedAsset,
    refetchInterval: 10000
  });

  // Combine and sort transactions for display - filter by asset type
  const getTransactionHistory = () => {
    if (!transactions) return [];
    
    const allTransactions: any[] = [];
    
    // For GBTC, only show GBTC-related transactions
    if (selectedAsset === 'GBTC') {
      // Add GBTC deposits
      transactions.deposits?.filter(d => d.network === 'GBTC').forEach(d => {
        allTransactions.push({
          ...d,
          displayType: 'Deposit',
          displayAmount: d.amount
        });
      });
      
      // Add GBTC withdrawals
      transactions.withdrawals?.filter(w => w.network === 'GBTC').forEach(w => {
        allTransactions.push({
          ...w,
          displayType: 'Withdraw',
          displayAmount: w.amount
        });
      });
      
      // Add all transfers (GBTC only)
      transactions.sentTransfers?.forEach(t => {
        allTransactions.push({
          ...t,
          displayType: 'Transfer Out',
          displayAmount: t.amount
        });
      });
      
      transactions.receivedTransfers?.forEach(t => {
        allTransactions.push({
          ...t,
          displayType: 'Transfer In',
          displayAmount: t.amount
        });
      });
    } else {
      // For USDT, only show USDT transactions
      transactions.deposits?.filter(d => d.network === 'BSC').forEach(d => {
        allTransactions.push({
          ...d,
          displayType: 'Deposit',
          displayAmount: d.amount
        });
      });
      
      transactions.withdrawals?.filter(w => w.network === 'BSC').forEach(w => {
        allTransactions.push({
          ...w,
          displayType: 'Withdraw',
          displayAmount: w.amount
        });
      });
    }
    
    // Sort by date (newest first)
    return allTransactions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const depositMutation = useMutation({
    mutationFn: async (data: { amount: string; txHash: string }) => {
      const res = await apiRequest("POST", "/api/deposits", {
        amount: data.amount,
        network: selectedAsset === 'USDT' ? 'BSC' : 'GBTC',
        txHash: data.txHash
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Deposit Submitted", 
        description: "Your deposit is being processed" 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setShowDepositDialog(false);
      setDepositAmount("");
      setDepositTxHash("");
    },
    onError: (error: Error) => {
      toast({ 
        title: "Deposit Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: string; address: string }) => {
      const res = await apiRequest("POST", "/api/withdrawals", {
        amount: data.amount,
        address: data.address,
        network: selectedAsset === 'USDT' ? 'BSC' : 'GBTC'
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Withdrawal Requested", 
        description: `Your ${selectedAsset} withdrawal is being processed` 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
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

  const transferMutation = useMutation({
    mutationFn: async (data: { toUsername: string; amount: string }) => {
      const res = await apiRequest("POST", "/api/transfer", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Transfer Successful", 
        description: `Successfully sent ${transferAmount} GBTC` 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setShowTransferDialog(false);
      setRecipientUsername("");
      setTransferAmount("");
    },
    onError: (error: Error) => {
      toast({ 
        title: "Transfer Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const handleDeposit = () => {
    if (!depositAmount || !depositTxHash) {
      toast({ 
        title: "Invalid Input", 
        description: "Please enter amount and transaction hash", 
        variant: "destructive" 
      });
      return;
    }
    depositMutation.mutate({ amount: depositAmount, txHash: depositTxHash });
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
    const maxAmount = selectedAsset === 'GBTC' ? gbtcBalance : usdtBalance;
    
    if (amount > maxAmount) {
      toast({ 
        title: "Insufficient Balance", 
        description: `You don't have enough ${selectedAsset}`, 
        variant: "destructive" 
      });
      return;
    }
    
    withdrawMutation.mutate({ amount: withdrawAmount, address: withdrawAddress });
  };

  const handleTransfer = () => {
    if (!recipientUsername || !transferAmount) {
      toast({ 
        title: "Invalid Input", 
        description: "Please enter recipient and amount", 
        variant: "destructive" 
      });
      return;
    }
    if (parseFloat(transferAmount) > gbtcBalance) {
      toast({ 
        title: "Insufficient Balance", 
        description: "You don't have enough GBTC", 
        variant: "destructive" 
      });
      return;
    }
    transferMutation.mutate({ toUsername: recipientUsername, amount: transferAmount });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { 
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': return 'text-green-500';
      case 'pending': return 'text-yellow-500';
      case 'rejected': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    toast({ 
      title: "Copied", 
      description: "Address copied to clipboard" 
    });
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Main wallet view
  if (!selectedAsset) {
    return (
      <div className="mobile-page bg-[#1a1a1a]">
        {/* Header */}
        <div className="mobile-header bg-[#1a1a1a] border-b border-gray-800">
          <h1 className="text-lg font-medium text-white">My Assets</h1>
        </div>

        {/* Assets List */}
        <div className="mobile-content">
          {/* GBTC Asset */}
          <Card 
            className="p-4 mb-3 bg-[#242424] border-gray-800 cursor-pointer hover:bg-[#2a2a2a] transition-colors"
            onClick={() => setSelectedAsset('GBTC')}
            data-testid="card-asset-gbtc"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#f7931a] flex items-center justify-center">
                  <span className="text-black font-bold text-lg">₿</span>
                </div>
                <div>
                  <p className="text-white font-medium">GBTC</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <p className="text-[#f7931a] text-xs">Balance</p>
                <p className="text-white font-medium">{gbtcBalance.toFixed(8)}</p>
              </div>
              <div>
                <p className="text-[#f7931a] text-xs">Available</p>
                <p className="text-white font-medium">{gbtcBalance.toFixed(8)}</p>
              </div>
            </div>
          </Card>

          {/* USDT Asset */}
          <Card 
            className="p-4 mb-3 bg-[#242424] border-gray-800 cursor-pointer hover:bg-[#2a2a2a] transition-colors"
            onClick={() => setSelectedAsset('USDT')}
            data-testid="card-asset-usdt"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#26a17b] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">₮</span>
                </div>
                <div>
                  <p className="text-white font-medium">USDT</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <p className="text-[#26a17b] text-xs">Balance</p>
                <p className="text-white font-medium">{usdtBalance.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[#26a17b] text-xs">Available</p>
                <p className="text-white font-medium">{usdtBalance.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Asset detail view
  return (
    <div className="mobile-page bg-[#1a1a1a]">
      {/* Header */}
      <div className="mobile-header bg-[#1a1a1a] border-b border-gray-800">
        <div className="flex items-center">
          <Button
            onClick={() => setSelectedAsset(null)}
            variant="ghost"
            size="sm"
            className="p-0 mr-3"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Button>
          <h1 className="text-lg font-medium text-white">Asset Detail</h1>
        </div>
      </div>

      {/* Content */}
      <div className="mobile-content">
        {/* Asset Info */}
        <div className="flex items-center space-x-3 mb-6">
          <div className={`w-12 h-12 rounded-full ${selectedAsset === 'GBTC' ? 'bg-[#f7931a]' : 'bg-[#26a17b]'} flex items-center justify-center`}>
            <span className={`${selectedAsset === 'GBTC' ? 'text-black' : 'text-white'} font-bold text-xl`}>
              {selectedAsset === 'GBTC' ? '₿' : '₮'}
            </span>
          </div>
          <div>
            <p className="text-white font-medium text-lg">{selectedAsset}</p>
          </div>
        </div>

        {/* Balance Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-500 text-xs mb-1">Balance</p>
            <p className="text-white font-medium">
              {selectedAsset === 'GBTC' ? gbtcBalance.toFixed(8) : usdtBalance.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">Available</p>
            <p className="text-white font-medium">
              {selectedAsset === 'GBTC' ? gbtcBalance.toFixed(8) : usdtBalance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Button
            onClick={() => setShowDepositDialog(true)}
            className="bg-transparent border-2 border-[#4a90e2] text-[#4a90e2] hover:bg-[#4a90e2] hover:text-white font-medium"
            data-testid="button-deposit"
          >
            Deposit
          </Button>
          <Button
            onClick={() => setShowWithdrawDialog(true)}
            className="bg-transparent border-2 border-[#f7931a] text-[#f7931a] hover:bg-[#f7931a] hover:text-black font-medium"
            data-testid="button-withdraw"
          >
            Withdraw
          </Button>
          <Button
            onClick={() => setShowTransferDialog(true)}
            disabled={selectedAsset === 'USDT'}
            className={`bg-transparent border-2 ${
              selectedAsset === 'GBTC' 
                ? 'border-[#f7931a] text-[#f7931a] hover:bg-[#f7931a] hover:text-black' 
                : 'border-gray-600 text-gray-600 cursor-not-allowed'
            } font-medium`}
            data-testid="button-transfer"
          >
            Transfer
          </Button>
        </div>

        {/* Financial Records */}
        <div>
          <h3 className="text-gray-400 text-sm font-medium mb-3">Financial Records</h3>
          <div className="space-y-2">
            {getTransactionHistory().length > 0 ? (
              getTransactionHistory().slice(0, 10).map((tx) => (
                <Card 
                  key={tx.id} 
                  className="p-3 bg-[#242424] border-gray-800 cursor-pointer hover:bg-[#2a2a2a]"
                  data-testid={`transaction-${tx.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{tx.displayType}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <div>
                          <p className="text-gray-500 text-xs">Amount</p>
                          <p className="text-white text-sm">
                            {tx.displayAmount}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Status</p>
                          <p className={`text-sm capitalize ${getStatusColor(tx.status)}`}>
                            {tx.status === 'approved' ? 'Completed' : tx.status}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-xs">Time</p>
                      <p className="text-gray-400 text-xs">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 float-right -mt-8" />
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No transactions yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deposit Dialog */}
      <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
        <DialogContent className="sm:max-w-md bg-[#242424] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white font-medium">
              Deposit {selectedAsset}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* System Deposit Address */}
            <div>
              <Label className="text-gray-400 text-sm">Deposit Address</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={selectedAsset === 'GBTC' ? systemGBTCAddress : systemUSDTAddress}
                  readOnly
                  className="bg-[#1a1a1a] border-gray-700 text-white font-mono text-xs"
                />
                <Button
                  onClick={() => copyAddress(selectedAsset === 'GBTC' ? systemGBTCAddress : systemUSDTAddress)}
                  variant="ghost"
                  size="sm"
                  className="px-2"
                  data-testid="button-copy-deposit-address"
                >
                  {copiedAddress ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Send {selectedAsset} to this address
              </p>
            </div>

            <div>
              <Label htmlFor="deposit-amount" className="text-gray-400 text-sm">Amount</Label>
              <Input
                id="deposit-amount"
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder={selectedAsset === 'GBTC' ? "0.00000000" : "0.00"}
                step={selectedAsset === 'GBTC' ? "0.00000001" : "0.01"}
                className="bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-600"
                data-testid="input-deposit-amount"
              />
            </div>
            <div>
              <Label htmlFor="deposit-txhash" className="text-gray-400 text-sm">Transaction Hash</Label>
              <Input
                id="deposit-txhash"
                value={depositTxHash}
                onChange={(e) => setDepositTxHash(e.target.value)}
                placeholder="Enter transaction hash"
                className="bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-600 font-mono text-xs"
                data-testid="input-deposit-txhash"
              />
            </div>
            <Button
              onClick={handleDeposit}
              disabled={depositMutation.isPending}
              className="w-full bg-[#4a90e2] hover:bg-[#3a7bc8] text-white font-medium"
              data-testid="button-confirm-deposit"
            >
              {depositMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Submit Deposit'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="sm:max-w-md bg-[#242424] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white font-medium">
              Withdraw {selectedAsset}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="withdraw-amount" className="text-gray-400 text-sm">Amount</Label>
              <Input
                id="withdraw-amount"
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder={selectedAsset === 'GBTC' ? "0.00000000" : "0.00"}
                step={selectedAsset === 'GBTC' ? "0.00000001" : "0.01"}
                max={selectedAsset === 'GBTC' ? gbtcBalance : usdtBalance}
                className="bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-600"
                data-testid="input-withdraw-amount"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available: {selectedAsset === 'GBTC' 
                  ? `${gbtcBalance.toFixed(8)} GBTC` 
                  : `${usdtBalance.toFixed(2)} USDT`}
              </p>
            </div>
            <div>
              <Label htmlFor="withdraw-address" className="text-gray-400 text-sm">Wallet Address</Label>
              <Input
                id="withdraw-address"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                placeholder={`Enter ${selectedAsset} address`}
                className="bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-600 font-mono text-xs"
                data-testid="input-withdraw-address"
              />
            </div>
            {selectedAsset === 'GBTC' ? (
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
                className="w-full bg-[#f7931a] hover:bg-[#e88309] text-black font-medium"
                data-testid="button-confirm-withdraw"
              >
                {withdrawMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Submit Withdrawal'
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog (GBTC only) */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="sm:max-w-md bg-[#242424] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white font-medium">
              Transfer GBTC
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
                className="bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-600"
                data-testid="input-recipient"
              />
            </div>
            <div>
              <Label htmlFor="transfer-amount" className="text-gray-400 text-sm">Amount (GBTC)</Label>
              <Input
                id="transfer-amount"
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0.00000000"
                step="0.00000001"
                max={gbtcBalance}
                className="bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-600"
                data-testid="input-transfer-amount"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available: {gbtcBalance.toFixed(8)} GBTC
              </p>
            </div>
            <Button
              onClick={handleTransfer}
              disabled={transferMutation.isPending}
              className="w-full bg-[#f7931a] hover:bg-[#e88309] text-black font-medium"
              data-testid="button-confirm-transfer"
            >
              {transferMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Send GBTC'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}