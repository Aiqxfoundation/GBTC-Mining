import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Loader2, ArrowLeft, Copy, CheckCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function EthAssetPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Dialog states
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  
  // Form states
  const [depositTxHash, setDepositTxHash] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [convertAmount, setConvertAmount] = useState("");
  const [copiedAddress, setCopiedAddress] = useState(false);
  
  // Get user data
  const { data: user } = useQuery<any>({ queryKey: ['/api/user'] });
  
  // Get ETH price
  const { data: ethPriceData, refetch: refetchPrice } = useQuery({
    queryKey: ['/api/eth/price'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Get conversion history
  const { data: conversions } = useQuery<any[]>({
    queryKey: ['/api/eth/conversions']
  });
  
  const ethBalance = parseFloat(user?.ethBalance || "0");
  const ethPrice = parseFloat(ethPriceData?.price || "0");
  const convertUsdValue = convertAmount ? (parseFloat(convertAmount) * ethPrice * 0.999).toFixed(2) : "0.00";
  
  // ETH deposit address
  const systemETHAddress = "0x1234567890abcdef1234567890abcdef12345678";
  
  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/eth/deposit", {
        txHash: depositTxHash,
        amount: depositAmount
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Deposit Submitted", 
        description: "Your ETH deposit has been submitted for approval" 
      });
      setDepositOpen(false);
      setDepositTxHash("");
      setDepositAmount("");
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Deposit Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });
  
  // Convert mutation
  const convertMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/eth/convert", {
        ethAmount: convertAmount
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Conversion Successful", 
        description: `Converted ${convertAmount} ETH to ${data.usdtReceived} USDT` 
      });
      setConvertOpen(false);
      setConvertAmount("");
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/eth/conversions'] });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Conversion Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });
  
  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/eth/withdraw", {
        amount: withdrawAmount,
        address: withdrawAddress
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Withdrawal Submitted", 
        description: "Your ETH withdrawal request has been submitted" 
      });
      setWithdrawOpen(false);
      setWithdrawAmount("");
      setWithdrawAddress("");
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Withdrawal Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    toast({ 
      title: "Copied", 
      description: "Address copied to clipboard" 
    });
    setTimeout(() => setCopiedAddress(false), 2000);
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

  return (
    <div className="mobile-page bg-[#1a1a1a]">
      {/* Header */}
      <div className="mobile-header bg-[#1a1a1a] border-b border-gray-800">
        <div className="flex items-center">
          <Button
            onClick={() => setLocation('/wallet')}
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
          <div className="w-12 h-12 rounded-full bg-gradient-to-b from-[#627EEA] to-[#3C3C3D] flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 1.75L5.75 12.25L12 16L18.25 12.25L12 1.75Z"/>
              <path d="M5.75 13.5L12 22.25V16L5.75 13.5Z" opacity="0.6"/>
              <path d="M18.25 13.5L12 16V22.25L18.25 13.5Z" opacity="0.8"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-medium text-lg">ETH</p>
          </div>
        </div>
        
        {/* Balance Info */}
        <div className="mb-6">
          <p className="text-gray-500 text-xs mb-1">Balance</p>
          <p className="text-white font-medium text-lg" data-testid="text-eth-balance">
            {ethBalance.toFixed(8)}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Button
            onClick={() => setDepositOpen(true)}
            className="bg-[#f7931a] text-black hover:bg-[#f7931a]/90 font-medium"
            data-testid="button-eth-deposit"
          >
            Deposit
          </Button>
          <Button
            onClick={() => setWithdrawOpen(true)}
            className="bg-transparent border-2 border-gray-600 text-gray-300 hover:bg-gray-800 font-medium"
            data-testid="button-eth-withdraw"
          >
            Withdraw
          </Button>
          <Button
            onClick={() => setConvertOpen(true)}
            className="bg-transparent border-2 border-gray-600 text-gray-300 hover:bg-gray-800 font-medium"
            data-testid="button-eth-convert"
          >
            Convert
          </Button>
        </div>
        
        {/* Financial Records */}
        <div>
          <h3 className="text-gray-400 text-sm font-medium mb-3">Financial Records</h3>
          <div className="space-y-2">
            {conversions && conversions.length > 0 ? (
              conversions.map((conversion) => (
                <Card 
                  key={conversion.id} 
                  className="p-3 bg-[#242424] border-gray-800"
                  data-testid={`conversion-${conversion.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">ETH to USDT</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <div>
                          <p className="text-gray-500 text-xs">Amount</p>
                          <p className="text-white text-sm">{conversion.ethAmount} ETH</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Received</p>
                          <p className="text-white text-sm">{conversion.usdtAmount} USDT</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-xs">Time</p>
                      <p className="text-gray-400 text-xs">{formatDate(conversion.createdAt)}</p>
                    </div>
                  </div>
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
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="bg-[#242424] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Deposit ETH</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">ETH Deposit Address</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input 
                  value={systemETHAddress}
                  readOnly
                  className="bg-[#1a1a1a] border-gray-700 text-gray-400 text-xs"
                />
                <Button 
                  onClick={() => copyAddress(systemETHAddress)}
                  size="icon"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  data-testid="button-copy-address"
                >
                  {copiedAddress ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div>
              <Label className="text-gray-400">Amount</Label>
              <Input
                type="number"
                step="0.00000001"
                placeholder="Enter ETH amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="bg-[#1a1a1a] border-gray-700 text-white"
                data-testid="input-eth-deposit-amount"
              />
            </div>
            
            <div>
              <Label className="text-gray-400">Transaction Hash</Label>
              <Input
                placeholder="Enter transaction hash"
                value={depositTxHash}
                onChange={(e) => setDepositTxHash(e.target.value)}
                className="bg-[#1a1a1a] border-gray-700 text-white"
                data-testid="input-eth-tx-hash"
              />
            </div>
            
            <Button
              onClick={() => depositMutation.mutate()}
              disabled={!depositTxHash || !depositAmount || depositMutation.isPending}
              className="w-full bg-[#f7931a] text-black hover:bg-[#f7931a]/90"
              data-testid="button-confirm-eth-deposit"
            >
              {depositMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Deposit'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Withdraw Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="bg-[#242424] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Withdraw ETH</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">Available Balance</Label>
              <p className="text-white text-lg font-medium">{ethBalance.toFixed(8)} ETH</p>
            </div>
            
            <div>
              <Label className="text-gray-400">Withdrawal Address</Label>
              <Input
                placeholder="Enter ETH address"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                className="bg-[#1a1a1a] border-gray-700 text-white"
                data-testid="input-eth-withdraw-address"
              />
            </div>
            
            <div>
              <Label className="text-gray-400">Amount</Label>
              <Input
                type="number"
                step="0.00000001"
                placeholder="Enter amount to withdraw"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="bg-[#1a1a1a] border-gray-700 text-white"
                data-testid="input-eth-withdraw-amount"
              />
            </div>
            
            <Button
              onClick={() => withdrawMutation.mutate()}
              disabled={!withdrawAddress || !withdrawAmount || withdrawMutation.isPending}
              className="w-full bg-[#f7931a] text-black hover:bg-[#f7931a]/90"
              data-testid="button-confirm-eth-withdraw"
            >
              {withdrawMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Withdraw'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Convert Dialog */}
      <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
        <DialogContent className="bg-[#242424] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Convert ETH to USDT</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">Available ETH</Label>
              <p className="text-white text-lg font-medium">{ethBalance.toFixed(8)} ETH</p>
            </div>
            
            <div>
              <Label className="text-gray-400">Current ETH Price</Label>
              <div className="flex items-center space-x-2">
                <p className="text-white text-lg font-medium">${ethPrice.toFixed(2)}</p>
                <Button 
                  onClick={() => refetchPrice()}
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  data-testid="button-refresh-price"
                >
                  <Loader2 className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label className="text-gray-400">Amount to Convert</Label>
              <Input
                type="number"
                step="0.00000001"
                placeholder="Enter ETH amount"
                value={convertAmount}
                onChange={(e) => setConvertAmount(e.target.value)}
                className="bg-[#1a1a1a] border-gray-700 text-white"
                data-testid="input-eth-convert-amount"
              />
            </div>
            
            <div>
              <Label className="text-gray-400">You Will Receive (after 0.1% fee)</Label>
              <p className="text-white text-lg font-medium">{convertUsdValue} USDT</p>
            </div>
            
            <Button
              onClick={() => convertMutation.mutate()}
              disabled={!convertAmount || parseFloat(convertAmount) > ethBalance || convertMutation.isPending}
              className="w-full bg-[#f7931a] text-black hover:bg-[#f7931a]/90"
              data-testid="button-confirm-eth-convert"
            >
              {convertMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                'Convert to USDT'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}