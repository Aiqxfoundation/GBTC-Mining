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
  const [selectedAsset, setSelectedAsset] = useState<'BTC' | 'GBTC' | 'USDT' | null>(null);
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
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [currentUTCTime, setCurrentUTCTime] = useState("");
  const [depositCooldown, setDepositCooldown] = useState<number>(0);
  const [withdrawalCooldown, setWithdrawalCooldown] = useState<number>(0);

  // Update UTC time every second and handle deposit cooldown
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utcTime = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      setCurrentUTCTime(utcTime);
      
      // Check and update deposit cooldown from localStorage
      const storedCooldown = localStorage.getItem('depositCooldownEnd');
      if (storedCooldown) {
        const cooldownEnd = parseInt(storedCooldown);
        const remainingTime = Math.max(0, cooldownEnd - Date.now());
        
        // Clear old 72-hour cooldowns (anything over 12 hours)
        if (remainingTime > 12 * 60 * 60 * 1000) {
          localStorage.removeItem('depositCooldownEnd');
          setDepositCooldown(0);
        } else {
          setDepositCooldown(Math.ceil(remainingTime / 1000)); // Convert to seconds
          
          if (remainingTime <= 0) {
            localStorage.removeItem('depositCooldownEnd');
          }
        }
      }
      
      // Check and update withdrawal cooldown from localStorage
      const storedWithdrawalCooldown = localStorage.getItem('withdrawalCooldownEnd');
      if (storedWithdrawalCooldown) {
        const cooldownEnd = parseInt(storedWithdrawalCooldown);
        const remainingTime = Math.max(0, cooldownEnd - Date.now());
        
        // Clear old 72-hour cooldowns (anything over 12 hours)
        if (remainingTime > 12 * 60 * 60 * 1000) {
          localStorage.removeItem('withdrawalCooldownEnd');
          setWithdrawalCooldown(0);
        } else {
          setWithdrawalCooldown(Math.ceil(remainingTime / 1000)); // Convert to seconds
          
          if (remainingTime <= 0) {
            localStorage.removeItem('withdrawalCooldownEnd');
          }
        }
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const usdtBalance = parseFloat(user?.usdtBalance || '0');
  const gbtcBalance = parseFloat(user?.gbtcBalance || '0');
  const ethBalance = parseFloat(user?.ethBalance || '0');

  // Fetch global deposit addresses from API
  const { data: globalAddresses } = useQuery<{ usdt: string; eth: string }>({
    queryKey: ["/api/deposit-addresses"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
    refetchOnWindowFocus: false
  });

  // Use global addresses or fallback to defaults
  const systemGBTCAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
  const systemUSDTAddress = globalAddresses?.usdt || "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";

  // Fetch transactions
  const { data: transactions } = useQuery<TransactionData>({
    queryKey: ["/api/transactions"],
    enabled: !!user && !!selectedAsset,
    staleTime: 300000,
    gcTime: 600000 // Cache for 5 minutes
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
        title: "Deposit Submitted Successfully!", 
        description: "Your deposit is being processed. You can deposit again after 12 hours." 
      });
      // Start 12-hour cooldown immediately
      const cooldownEnd = Date.now() + (12 * 60 * 60 * 1000);
      localStorage.setItem('depositCooldownEnd', cooldownEnd.toString());
      setDepositCooldown(12 * 60 * 60); // 12 hours in seconds
      
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setShowDepositDialog(false);
      setDepositAmount("");
      setDepositTxHash("");
    },
    onError: (error: Error) => {
      // Check if it's a cooldown error
      if (error.message.includes('hours')) {
        // Set 12-hour cooldown (12 * 60 * 60 * 1000 milliseconds)
        const cooldownEnd = Date.now() + (12 * 60 * 60 * 1000);
        localStorage.setItem('depositCooldownEnd', cooldownEnd.toString());
        setDepositCooldown(12 * 60 * 60); // 12 hours in seconds
      } else {
        toast({ 
          title: "Deposit Failed", 
          description: error.message, 
          variant: "destructive" 
        });
      }
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
        title: "Withdrawal Requested Successfully!", 
        description: `Your ${selectedAsset} withdrawal is being processed. You can withdraw again after 12 hours.` 
      });
      // Start 12-hour cooldown immediately
      const cooldownEnd = Date.now() + (12 * 60 * 60 * 1000);
      localStorage.setItem('withdrawalCooldownEnd', cooldownEnd.toString());
      setWithdrawalCooldown(12 * 60 * 60); // 12 hours in seconds
      
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setShowWithdrawDialog(false);
      setWithdrawAmount("");
      setWithdrawAddress("");
    },
    onError: (error: Error) => {
      // Check if it's a cooldown error
      if (error.message.includes('hours')) {
        // Set 12-hour cooldown (12 * 60 * 60 * 1000 milliseconds)
        const cooldownEnd = Date.now() + (12 * 60 * 60 * 1000);
        localStorage.setItem('withdrawalCooldownEnd', cooldownEnd.toString());
        setWithdrawalCooldown(12 * 60 * 60); // 12 hours in seconds
      } else {
        toast({ 
          title: "Withdrawal Failed", 
          description: error.message, 
          variant: "destructive" 
        });
      }
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
    if (depositCooldown > 0) {
      return; // Don't submit if cooldown is active
    }
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
  
  // Format cooldown time for display
  const formatCooldownTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const handleWithdraw = () => {
    if (withdrawalCooldown > 0) {
      return; // Don't submit if cooldown is active
    }
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
    // Convert to UTC and format as YYYY-MM-DD HH:MM:SS
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
    setTimeout(() => setCopiedAddress(false), 500); // Faster feedback
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
          {/* BTC Asset - Real Bitcoin */}
          <Card 
            className="p-4 mb-3 bg-[#242424] border-gray-800 cursor-pointer hover:bg-[#2a2a2a] transition-colors"
            onClick={() => setSelectedAsset('BTC')}
            data-testid="card-asset-btc"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#f7931a] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16" fill="white">
                    <path d="M5.5 13v1.25c0 .138.112.25.25.25h1a.25.25 0 0 0 .25-.25V13h.5v1.25c0 .138.112.25.25.25h1a.25.25 0 0 0 .25-.25V13h.084c1.992 0 3.416-1.033 3.416-2.82 0-1.502-1.007-2.323-2.186-2.44v-.088c.97-.242 1.683-.974 1.683-2.19C11.997 3.93 10.847 3 9.092 3H9V1.75a.25.25 0 0 0-.25-.25h-1a.25.25 0 0 0-.25.25V3h-.573V1.75a.25.25 0 0 0-.25-.25H5.75a.25.25 0 0 0-.25.25V3l-1.998.011a.25.25 0 0 0-.25.25v.989c0 .137.11.25.248.25l.755-.005a.75.75 0 0 1 .745.75v5.505a.75.75 0 0 1-.75.75l-.748.011a.25.25 0 0 0-.25.25v1c0 .138.112.25.25.25zm1.427-8.513h1.719c.906 0 1.438.498 1.438 1.312 0 .871-.575 1.362-1.877 1.362h-1.28zm0 4.051h1.84c1.137 0 1.756.58 1.756 1.524 0 .953-.626 1.45-2.158 1.45H6.927z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">BTC</p>
                  <p className="text-gray-400 text-xs">Bitcoin</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <p className="text-[#f7931a] text-xs">Balance</p>
                <p className="text-white font-medium">0.00000000</p>
              </div>
              <div>
                <p className="text-[#f7931a] text-xs">Value</p>
                <p className="text-white font-medium">$0.00</p>
              </div>
            </div>
          </Card>

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
                <p className="text-[#f7931a] text-xs"></p>
                <p className="text-white font-medium"></p>
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
                <p className="text-[#26a17b] text-xs"></p>
                <p className="text-white font-medium"></p>
              </div>
            </div>
          </Card>

          {/* ETH Asset */}
          <Card 
            className="p-4 mb-3 bg-[#242424] border-gray-800 cursor-pointer hover:bg-[#2a2a2a] transition-colors"
            onClick={() => setLocation('/eth-asset')}
            data-testid="card-asset-eth"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[#627EEA] to-[#3C3C3D] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M12 1.75L5.75 12.25L12 16L18.25 12.25L12 1.75Z"/>
                    <path d="M5.75 13.5L12 22.25V16L5.75 13.5Z" opacity="0.6"/>
                    <path d="M18.25 13.5L12 16V22.25L18.25 13.5Z" opacity="0.8"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">ETH</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Balance</p>
                <p className="text-white font-medium" data-testid="text-wallet-eth-balance">{ethBalance.toFixed(8)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Available</p>
                <p className="text-white font-medium">{ethBalance.toFixed(8)}</p>
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
          <div className={`w-12 h-12 rounded-full ${selectedAsset === 'BTC' || selectedAsset === 'GBTC' ? 'bg-[#f7931a]' : 'bg-[#26a17b]'} flex items-center justify-center`}>
            {selectedAsset === 'BTC' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 16 16" fill="white">
                <path d="M5.5 13v1.25c0 .138.112.25.25.25h1a.25.25 0 0 0 .25-.25V13h.5v1.25c0 .138.112.25.25.25h1a.25.25 0 0 0 .25-.25V13h.084c1.992 0 3.416-1.033 3.416-2.82 0-1.502-1.007-2.323-2.186-2.44v-.088c.97-.242 1.683-.974 1.683-2.19C11.997 3.93 10.847 3 9.092 3H9V1.75a.25.25 0 0 0-.25-.25h-1a.25.25 0 0 0-.25.25V3h-.573V1.75a.25.25 0 0 0-.25-.25H5.75a.25.25 0 0 0-.25.25V3l-1.998.011a.25.25 0 0 0-.25.25v.989c0 .137.11.25.248.25l.755-.005a.75.75 0 0 1 .745.75v5.505a.75.75 0 0 1-.75.75l-.748.011a.25.25 0 0 0-.25.25v1c0 .138.112.25.25.25zm1.427-8.513h1.719c.906 0 1.438.498 1.438 1.312 0 .871-.575 1.362-1.877 1.362h-1.28zm0 4.051h1.84c1.137 0 1.756.58 1.756 1.524 0 .953-.626 1.45-2.158 1.45H6.927z"/>
              </svg>
            ) : (
              <span className={`${selectedAsset === 'GBTC' ? 'text-black' : 'text-white'} font-bold text-xl`}>
                {selectedAsset === 'GBTC' ? '₿' : '₮'}
              </span>
            )}
          </div>
          <div>
            <p className="text-white font-medium text-lg">{selectedAsset}</p>
            {selectedAsset === 'BTC' && <p className="text-gray-400 text-xs">Bitcoin</p>}
          </div>
        </div>

        {/* Balance Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-500 text-xs mb-1">Balance</p>
            <p className="text-white font-medium">
              {selectedAsset === 'BTC' ? '0.00000000' : selectedAsset === 'GBTC' ? gbtcBalance.toFixed(8) : usdtBalance.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1"></p>
            <p className="text-white font-medium"></p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`grid ${selectedAsset === 'BTC' ? 'grid-cols-2' : 'grid-cols-3'} gap-3 mb-6`}>
          <Button
            onClick={() => (selectedAsset === 'GBTC' || selectedAsset === 'BTC') ? null : setShowDepositDialog(true)}
            disabled={selectedAsset === 'GBTC'}
            className={`bg-transparent border-2 ${
              selectedAsset === 'GBTC' 
                ? 'border-gray-600 text-gray-600 cursor-not-allowed opacity-50' 
                : 'border-[#f7931a] text-[#f7931a] hover:bg-[#f7931a] hover:text-black'
            } font-medium`}
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
          {selectedAsset !== 'BTC' && (
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
          )}
        </div>
        
        {/* Mysterious Button - Only for BTC */}
        {selectedAsset === 'BTC' && (
          <div className="mb-6">
            <Button
              onClick={() => setLocation('/mysterious-btc')}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-900 text-white hover:from-purple-700 hover:to-purple-950 font-medium py-6 text-lg shadow-lg"
              data-testid="button-mysterious"
            >
              🚪 Mysterious Door 🚪
            </Button>
          </div>
        )}

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
                  onClick={() => {
                    // Only show details for GBTC transfers
                    if (selectedAsset === 'GBTC' && (tx.displayType === 'Transfer Out' || tx.displayType === 'Transfer In')) {
                      setSelectedTransfer(tx);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{tx.displayType}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <div>
                          <p className="text-gray-500 text-xs">Amount</p>
                          <p className={`text-sm ${
                            selectedAsset === 'GBTC' && (tx.displayType === 'Transfer Out' || tx.displayType === 'Transfer In')
                              ? 'text-[#f7931a] underline' 
                              : 'text-white'
                          }`}>
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

      {/* Deposit Dialog - Full Page */}
      {showDepositDialog && (
        <div className="fixed inset-0 z-50 bg-[#1a1a1a] overflow-y-auto">
          <div className="min-h-screen flex flex-col">
            <div className="p-4 bg-[#242424] border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-white font-medium text-lg">
                Deposit {selectedAsset}
              </h2>
              <Button
                onClick={() => setShowDepositDialog(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white p-1"
              >
                <span className="text-2xl">&times;</span>
              </Button>
            </div>
            
            <div className="flex-1 p-4 space-y-4">
              {/* System Deposit Address */}
              <div className="bg-[#242424] rounded-lg p-4">
                <Label className="text-gray-400 text-sm">Deposit Address</Label>
                <div className="flex items-center gap-2 mt-2">
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
                <p className="text-xs text-gray-500 mt-2">
                  Send {selectedAsset} to this address
                </p>
              </div>

              <div className="bg-[#242424] rounded-lg p-4">
                <Label htmlFor="deposit-amount" className="text-gray-400 text-sm">Amount</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder={selectedAsset === 'GBTC' ? "0.00000000" : "0.00"}
                  step={selectedAsset === 'GBTC' ? "0.00000001" : "0.01"}
                  className="bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-600 mt-2"
                  data-testid="input-deposit-amount"
                />
              </div>
              
              <div className="bg-[#242424] rounded-lg p-4">
                <Label htmlFor="deposit-txhash" className="text-gray-400 text-sm">Transaction Hash</Label>
                <Input
                  id="deposit-txhash"
                  value={depositTxHash}
                  onChange={(e) => setDepositTxHash(e.target.value)}
                  placeholder="Enter transaction hash"
                  className="bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-600 font-mono text-xs mt-2"
                  data-testid="input-deposit-txhash"
                />
              </div>
              
              <Button
                onClick={handleDeposit}
                disabled={depositMutation.isPending || depositCooldown > 0}
                className={`w-full font-medium py-3 ${
                  depositCooldown > 0 
                    ? 'bg-gray-600 text-white cursor-not-allowed' 
                    : 'bg-[#f7931a] hover:bg-[#e8821a] text-black'
                }`}
                data-testid="button-confirm-deposit"
              >
                {depositMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : depositCooldown > 0 ? (
                  <>
                    Wait: {formatCooldownTime(depositCooldown)}
                  </>
                ) : (
                  'Submit Deposit'
                )}
              </Button>
              
              {/* Instructions Section */}
              <div className="bg-[#242424] rounded-lg p-4 mt-6">
                <h3 className="text-[#f7931a] font-medium mb-3">Deposit Instructions</h3>
                <div className="space-y-3 text-sm text-gray-400">
                  <div className="flex items-start">
                    <span className="text-[#f7931a] mr-2">1.</span>
                    <p>Copy the deposit address above and send your {selectedAsset} from your external wallet to this address.</p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-[#f7931a] mr-2">2.</span>
                    <p>After sending, enter the exact amount you sent in the Amount field.</p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-[#f7931a] mr-2">3.</span>
                    <p>Enter the transaction hash from your wallet or blockchain explorer.</p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-[#f7931a] mr-2">4.</span>
                    <p>Click Submit Deposit to process your deposit request.</p>
                  </div>
                </div>
              </div>
              
              {/* Important Rules */}
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                <h3 className="text-red-500 font-medium mb-3">Important Rules</h3>
                <div className="space-y-2 text-xs text-red-400">
                  <p>• Minimum deposit: {selectedAsset === 'GBTC' ? '0.001 GBTC' : '10 USDT'}</p>
                  <p>• Only send {selectedAsset === 'USDT' ? 'USDT from BSC/ETH Network' : 'GBTC'} to this address</p>
                  <p>• System will verify transaction hash. It requires some time, so please be patient</p>
                  <p>• You can deposit only once within 12 hours (to prevent multiple attempts)</p>
                  <p>• If you submit wrong TX Hash, your deposit will fail and may result in loss of funds</p>
                  <p>• Incorrect deposits cannot be recovered - please double-check the address</p>
                  <p>• Contact support if your deposit doesn't appear within 2 hours</p>
                  <p>• Do not send from exchange wallets that require memo/tag</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Dialog - Full Page */}
      {showWithdrawDialog && (
        <div className="fixed inset-0 z-50 bg-[#1a1a1a] overflow-y-auto">
          <div className="min-h-screen flex flex-col">
            <div className="p-4 bg-[#242424] border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-white font-medium text-lg">
                Withdraw {selectedAsset}
              </h2>
              <Button
                onClick={() => setShowWithdrawDialog(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white p-1"
              >
                <span className="text-2xl">&times;</span>
              </Button>
            </div>
            
            <div className="flex-1 p-4 space-y-4">
              {/* Amount Input */}
              <div className="bg-[#242424] rounded-lg p-4">
                <Label htmlFor="withdraw-amount" className="text-gray-400 text-sm">Amount</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={selectedAsset === 'GBTC' ? "0.00000000" : "0.00"}
                  step={selectedAsset === 'GBTC' ? "0.00000001" : "0.01"}
                  max={selectedAsset === 'GBTC' ? gbtcBalance : usdtBalance}
                  className="bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-600 mt-2"
                  data-testid="input-withdraw-amount"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Available: {selectedAsset === 'GBTC' 
                    ? `${gbtcBalance.toFixed(8)} GBTC` 
                    : `${usdtBalance.toFixed(2)} USDT`}
                </p>
              </div>
              
              {/* Address Input */}
              <div className="bg-[#242424] rounded-lg p-4">
                <Label htmlFor="withdraw-address" className="text-gray-400 text-sm">Wallet Address</Label>
                <Input
                  id="withdraw-address"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  placeholder={`Enter ${selectedAsset} address`}
                  className="bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-600 font-mono text-xs mt-2"
                  data-testid="input-withdraw-address"
                />
              </div>
              
              {/* Submit Button */}
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
                disabled={withdrawMutation.isPending || withdrawalCooldown > 0}
                className={`w-full font-medium ${
                  withdrawalCooldown > 0 
                    ? 'bg-gray-600 text-white cursor-not-allowed' 
                    : 'bg-[#f7931a] hover:bg-[#e88309] text-black'
                }`}
                data-testid="button-confirm-withdraw"
              >
                {withdrawMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : withdrawalCooldown > 0 ? (
                  <>
                    Wait: {formatCooldownTime(withdrawalCooldown)}
                  </>
                ) : (
                  'Submit Withdrawal'
                )}
              </Button>
            )}
            
            {/* Withdrawal Instructions */}
            <div className="bg-[#242424] rounded-lg p-4 mt-6">
              <h3 className="text-[#f7931a] font-medium mb-3">Withdrawal Instructions</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-start">
                  <span className="text-[#f7931a] mr-2">1.</span>
                  <p>Enter the amount you wish to withdraw in the Amount field.</p>
                </div>
                <div className="flex items-start">
                  <span className="text-[#f7931a] mr-2">2.</span>
                  <p>Enter your {selectedAsset === 'USDT' ? 'USDT wallet address (BSC/ETH Network)' : 'GBTC wallet address'}.</p>
                </div>
                <div className="flex items-start">
                  <span className="text-[#f7931a] mr-2">3.</span>
                  <p>Click Submit Withdrawal to process your withdrawal request.</p>
                </div>
                <div className="flex items-start">
                  <span className="text-[#f7931a] mr-2">4.</span>
                  <p>Your withdrawal will be processed within 24-48 hours.</p>
                </div>
              </div>
            </div>
            
            {/* Important Withdrawal Rules */}
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <h3 className="text-red-500 font-medium mb-3">Important Rules</h3>
              <div className="space-y-2 text-xs text-red-400">
                <p>• Minimum withdrawal: {selectedAsset === 'GBTC' ? '0.01 GBTC' : '20 USDT'}</p>
                <p>• Maximum withdrawal: {selectedAsset === 'GBTC' ? '100 GBTC' : '10000 USDT'} per request</p>
                <p>• System will verify your withdrawal request manually</p>
                <p>• You can withdraw only once within 12 hours (to prevent multiple attempts)</p>
                <p>• Wrong address may result in permanent loss of funds</p>
                <p>• Processing time: 24-48 hours for manual verification</p>
                <p>• Network fees will be deducted from your withdrawal amount</p>
                <p>• Contact support if withdrawal not received after 48 hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

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

      {/* Transfer Details Dialog */}
      <Dialog 
        open={!!selectedTransfer} 
        onOpenChange={(open) => {
          if (!open) {
            setTimeout(() => setSelectedTransfer(null), 50); // Instant close
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-[#1a1a1a] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white font-medium text-center">
              {selectedTransfer?.displayType === 'Transfer In' ? 'Transfer In Details' : 'Transfer Out Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedTransfer && (
            <div className="space-y-6 py-4">
              <div className="space-y-1">
                <p className="text-gray-500 text-sm">Amount</p>
                <p className="text-white font-mono text-lg">
                  GBTC {parseFloat(selectedTransfer.amount).toFixed(8)}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-gray-500 text-sm">Status</p>
                <p className="text-white">
                  {selectedTransfer.status === 'approved' ? 'Completed' : selectedTransfer.status}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-gray-500 text-sm">Transfer Account</p>
                <p className="text-white">
                  {selectedTransfer.displayType === 'Transfer In' 
                    ? selectedTransfer.fromUsername 
                    : selectedTransfer.toUsername}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-gray-500 text-sm">Time</p>
                <p className="text-white">
                  {formatDate(selectedTransfer.createdAt)}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}