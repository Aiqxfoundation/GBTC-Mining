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
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function WalletPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [recipientUsername, setRecipientUsername] = useState("");
  const [sendAmount, setSendAmount] = useState("");

  const usdtBalance = parseFloat(user?.usdtBalance || '0');
  const gbtcBalance = parseFloat(user?.gbtcBalance || '0');
  const hashPower = parseFloat(user?.hashPower || '0');
  const unclaimedBalance = parseFloat(user?.unclaimedBalance || '0');

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

  const getHashrateDisplay = (hashrate: number) => {
    if (hashrate >= 1000000) return `${(hashrate / 1000000).toFixed(2)} PH/s`;
    if (hashrate >= 1000) return `${(hashrate / 1000).toFixed(2)} TH/s`;
    return `${hashrate.toFixed(2)} GH/s`;
  };

  return (
    <div className="mobile-page">
      {/* Header */}
      <div className="mobile-header">
        <div>
          <h1 className="text-lg font-display font-bold text-primary">MY WALLET</h1>
          <p className="text-xs text-muted-foreground font-mono">All Assets</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground font-mono">ACCOUNT ID</p>
          <p className="text-xs font-mono text-primary">
            {user?.id?.slice(0, 8)}...
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mobile-content">
        {/* Total Value Card */}
        <Card className="mobile-card bg-gradient-to-br from-primary/20 to-accent/20 border-primary/30">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground font-mono mb-2">TOTAL PORTFOLIO VALUE</p>
            <p className="text-4xl font-display font-black text-primary glow-green">
              ${(usdtBalance + (gbtcBalance * 10)).toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              1 GBTC ≈ $10 USD
            </p>
          </div>
        </Card>

        {/* Assets Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* GBTC Balance */}
          <Card className="mobile-card bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-start justify-between mb-2">
              <i className="fas fa-coins text-2xl text-primary"></i>
              <span className="text-xs font-mono text-success">MINED</span>
            </div>
            <p className="text-xs text-muted-foreground font-mono mb-1">GBTC BALANCE</p>
            <p className="text-xl font-display font-black text-primary">
              {gbtcBalance.toFixed(8)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ≈ ${(gbtcBalance * 10).toFixed(2)}
            </p>
          </Card>

          {/* USDT Balance */}
          <Card className="mobile-card bg-gradient-to-br from-accent/10 to-accent/5">
            <div className="flex items-start justify-between mb-2">
              <i className="fas fa-dollar-sign text-2xl text-accent"></i>
              <span className="text-xs font-mono text-accent">AVAILABLE</span>
            </div>
            <p className="text-xs text-muted-foreground font-mono mb-1">USDT BALANCE</p>
            <p className="text-xl font-display font-black text-accent">
              ${usdtBalance.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Tether USD
            </p>
          </Card>
        </div>

        {/* Mining Stats */}
        <Card className="mobile-card">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground font-mono mb-1">HASHRATE</p>
              <p className="text-lg font-display font-bold text-chart-4">
                {getHashrateDisplay(hashPower)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-mono mb-1">UNCLAIMED</p>
              <p className="text-lg font-display font-bold text-warning">
                {unclaimedBalance.toFixed(8)} GBTC
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Deposit Button */}
          <Button
            onClick={() => setLocation("/deposit")}
            className="w-full h-14 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70"
            data-testid="button-deposit"
          >
            <i className="fas fa-arrow-down mr-3"></i>
            <div className="text-left">
              <p className="text-sm font-display font-bold">DEPOSIT USDT</p>
              <p className="text-xs opacity-80">Add funds to your wallet</p>
            </div>
          </Button>

          {/* Withdraw Button */}
          <Button
            onClick={() => setLocation("/withdraw")}
            className="w-full h-14 bg-gradient-to-r from-chart-3 to-chart-3/80 hover:from-chart-3/90 hover:to-chart-3/70"
            data-testid="button-withdraw"
          >
            <i className="fas fa-arrow-up mr-3"></i>
            <div className="text-left">
              <p className="text-sm font-display font-bold">WITHDRAW GBTC</p>
              <p className="text-xs opacity-80">Cash out your earnings</p>
            </div>
          </Button>

          {/* Send GBTC Button */}
          <Button
            onClick={() => setShowSendDialog(true)}
            className="w-full h-14 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            data-testid="button-send"
          >
            <i className="fas fa-paper-plane mr-3"></i>
            <div className="text-left">
              <p className="text-sm font-display font-bold">SEND GBTC</p>
              <p className="text-xs opacity-80">Transfer to another user</p>
            </div>
          </Button>
        </div>

        {/* Recent Activity */}
        <Card className="mobile-card mt-4">
          <p className="text-sm font-mono text-muted-foreground mb-3">RECENT ACTIVITY</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <div className="flex items-center space-x-2">
                <i className="fas fa-cube text-primary text-sm"></i>
                <div>
                  <p className="text-sm font-semibold">Mining Reward</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <p className="text-sm font-mono text-success">+0.625 GBTC</p>
            </div>
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center space-x-2">
                <i className="fas fa-microchip text-chart-4 text-sm"></i>
                <div>
                  <p className="text-sm font-semibold">Hashrate Purchase</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              <p className="text-sm font-mono text-destructive">-1000 USDT</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Send GBTC Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Send GBTC</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient">Recipient Username</Label>
              <Input
                id="recipient"
                value={recipientUsername}
                onChange={(e) => setRecipientUsername(e.target.value)}
                placeholder="Enter username"
                data-testid="input-recipient"
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount (GBTC)</Label>
              <Input
                id="amount"
                type="number"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                placeholder="0.00000000"
                step="0.00000001"
                max={gbtcBalance}
                data-testid="input-send-amount"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available: {gbtcBalance.toFixed(8)} GBTC
              </p>
            </div>
            <Button
              onClick={handleSend}
              disabled={sendGbtcMutation.isPending}
              className="w-full"
              data-testid="button-confirm-send"
            >
              {sendGbtcMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  Send GBTC
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}