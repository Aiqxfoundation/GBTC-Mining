import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Loader2, ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react';
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

  return (
    <div className="mobile-page bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Header */}
      <div className="mobile-header bg-black/90 backdrop-blur-lg border-b border-orange-500/20">
        <div className="flex items-center">
          <button 
            onClick={() => setLocation('/wallet')}
            className="mr-3 text-orange-500"
            data-testid="button-back"
          >
            ←
          </button>
          <h1 className="text-lg font-display font-black text-orange-500">
            Asset Detail
          </h1>
        </div>
      </div>

      <div className="mobile-content">
        {/* ETH Balance Card */}
        <Card className="bg-black/80 border-orange-500/20 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">Ξ</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">ETH</h2>
                <p className="text-sm text-gray-400">Ethereum</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Current Price</p>
              <p className="text-sm font-bold text-orange-500">${ethPrice.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-gray-400">Balance</p>
              <p className="text-sm font-mono text-white" data-testid="text-eth-balance">
                {ethBalance.toFixed(8)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Available</p>
              <p className="text-sm font-mono text-white">
                {ethBalance.toFixed(8)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Frozen</p>
              <p className="text-sm font-mono text-white">
                0.00000000
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Button
            onClick={() => setDepositOpen(true)}
            className="bg-orange-500 text-black hover:bg-orange-400 flex flex-col items-center py-4"
            data-testid="button-eth-deposit"
          >
            <ArrowDownCircle className="w-6 h-6 mb-1" />
            <span className="text-xs">Deposit</span>
          </Button>
          
          <Button
            onClick={() => setWithdrawOpen(true)}
            className="bg-black border border-orange-500 text-orange-500 hover:bg-orange-500/10 flex flex-col items-center py-4"
            disabled={ethBalance <= 0}
            data-testid="button-eth-withdraw"
          >
            <ArrowUpCircle className="w-6 h-6 mb-1" />
            <span className="text-xs">Withdraw</span>
          </Button>
          
          <Button
            onClick={() => setConvertOpen(true)}
            className="bg-black border border-orange-500 text-orange-500 hover:bg-orange-500/10 flex flex-col items-center py-4"
            disabled={ethBalance <= 0}
            data-testid="button-eth-convert"
          >
            <RefreshCw className="w-6 h-6 mb-1" />
            <span className="text-xs">Convert</span>
          </Button>
        </div>

        {/* Conversion History */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Financial Records</h3>
          {conversions && conversions.length > 0 ? (
            <div className="space-y-2">
              {conversions.map((conversion: any) => (
                <Card key={conversion.id} className="bg-black/50 border-gray-800 p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-400">
                        Converted {parseFloat(conversion.ethAmount).toFixed(8)} ETH
                      </p>
                      <p className="text-sm text-white">
                        → {parseFloat(conversion.usdtAmount).toFixed(2)} USDT
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        @${parseFloat(conversion.ethPrice).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-600">
                        Fee: ${parseFloat(conversion.feeAmount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-black/50 border-gray-800 p-6 text-center">
              <p className="text-sm text-gray-500">No conversion history</p>
            </Card>
          )}
        </div>
      </div>

      {/* Deposit Dialog */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="bg-black border-orange-500/20">
          <DialogHeader>
            <DialogTitle className="text-orange-500">Deposit ETH</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">Deposit Address</Label>
              <div className="bg-gray-900 p-3 rounded font-mono text-xs text-gray-500">
                0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3
              </div>
              <p className="text-xs text-gray-600 mt-1">Send ETH only to this address</p>
            </div>
            
            <div>
              <Label htmlFor="txHash" className="text-gray-400">Transaction Hash</Label>
              <Input
                id="txHash"
                placeholder="0x..."
                value={depositTxHash}
                onChange={(e) => setDepositTxHash(e.target.value)}
                className="bg-gray-900 border-gray-700"
                data-testid="input-eth-tx-hash"
              />
            </div>
            
            <div>
              <Label htmlFor="amount" className="text-gray-400">Amount (ETH)</Label>
              <Input
                id="amount"
                type="number"
                step="0.00000001"
                placeholder="0.00000000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="bg-gray-900 border-gray-700"
                data-testid="input-eth-deposit-amount"
              />
            </div>
            
            <Button
              onClick={() => depositMutation.mutate()}
              disabled={!depositTxHash || !depositAmount || depositMutation.isPending}
              className="w-full bg-orange-500 text-black hover:bg-orange-400"
              data-testid="button-confirm-eth-deposit"
            >
              {depositMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Submit Deposit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Convert Dialog */}
      <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
        <DialogContent className="bg-black border-orange-500/20">
          <DialogHeader>
            <DialogTitle className="text-orange-500">Convert ETH to USDT</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-900 p-3 rounded">
              <div className="flex justify-between mb-2">
                <span className="text-xs text-gray-400">Current ETH Price</span>
                <button 
                  onClick={() => refetchPrice()}
                  className="text-xs text-orange-500"
                  data-testid="button-refresh-price"
                >
                  <RefreshCw className="w-3 h-3 inline mr-1" />
                  Refresh
                </button>
              </div>
              <p className="text-lg font-bold text-white">${ethPrice.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Conversion Fee: 0.1%</p>
            </div>
            
            <div>
              <Label htmlFor="convertAmount" className="text-gray-400">Amount to Convert (ETH)</Label>
              <Input
                id="convertAmount"
                type="number"
                step="0.00000001"
                placeholder="0.00000000"
                value={convertAmount}
                onChange={(e) => setConvertAmount(e.target.value)}
                max={ethBalance}
                className="bg-gray-900 border-gray-700"
                data-testid="input-eth-convert-amount"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available: {ethBalance.toFixed(8)} ETH
              </p>
            </div>
            
            <div className="bg-gray-900 p-3 rounded">
              <p className="text-xs text-gray-400">You will receive</p>
              <p className="text-lg font-bold text-orange-500">
                {convertUsdValue} USDT
              </p>
              <p className="text-xs text-gray-500">After 0.1% fee</p>
            </div>
            
            <Button
              onClick={() => convertMutation.mutate()}
              disabled={!convertAmount || parseFloat(convertAmount) <= 0 || parseFloat(convertAmount) > ethBalance || convertMutation.isPending}
              className="w-full bg-orange-500 text-black hover:bg-orange-400"
              data-testid="button-confirm-eth-convert"
            >
              {convertMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Convert to USDT
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="bg-black border-orange-500/20">
          <DialogHeader>
            <DialogTitle className="text-orange-500">Withdraw ETH</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="withdrawAddress" className="text-gray-400">Withdrawal Address</Label>
              <Input
                id="withdrawAddress"
                placeholder="0x..."
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                className="bg-gray-900 border-gray-700"
                data-testid="input-eth-withdraw-address"
              />
            </div>
            
            <div>
              <Label htmlFor="withdrawAmount" className="text-gray-400">Amount (ETH)</Label>
              <Input
                id="withdrawAmount"
                type="number"
                step="0.00000001"
                placeholder="0.00000000"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                max={ethBalance}
                className="bg-gray-900 border-gray-700"
                data-testid="input-eth-withdraw-amount"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available: {ethBalance.toFixed(8)} ETH
              </p>
            </div>
            
            <Button
              onClick={() => withdrawMutation.mutate()}
              disabled={!withdrawAddress || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > ethBalance || withdrawMutation.isPending}
              className="w-full bg-orange-500 text-black hover:bg-orange-400"
              data-testid="button-confirm-eth-withdraw"
            >
              {withdrawMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Submit Withdrawal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}