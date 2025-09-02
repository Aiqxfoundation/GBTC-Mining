import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Copy, TrendingUp, Award, LogOut, Clock, ArrowDown, ArrowUp, Send, Hash, Bitcoin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import bitcoinLogo from "@assets/file_00000000221c61fab63936953b889556_1756633909848.png";

export default function AccountPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  // Fetch referral data
  const { data: referralData } = useQuery<{
    referralCode: string;
    totalReferrals: number;
    activeReferrals: number;
    totalEarnings: string;
    referrals: Array<{
      id: string;
      username: string;
      joinedAt: string;
      status: string;
      earned: string;
    }>;
  }>({
    queryKey: ["/api/referrals"],
    enabled: !!user,
  });

  // Fetch transaction history
  const { data: transactions } = useQuery<{
    deposits: Array<{
      id: string;
      amount: string;
      status: string;
      createdAt: string;
      network: string;
    }>;
    withdrawals: Array<{
      id: string;
      amount: string;
      status: string;
      createdAt: string;
      address: string;
    }>;
  }>({
    queryKey: ["/api/transactions"],
    enabled: !!user,
  });

  // Change PIN mutation
  const changePinMutation = useMutation({
    mutationFn: async (data: { currentPin: string; newPin: string }) => {
      const res = await apiRequest("POST", "/api/change-pin", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ 
        title: "PIN Changed Successfully", 
        description: "Your PIN has been updated" 
      });
      setShowPinDialog(false);
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to Change PIN", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const handlePinChange = () => {
    if (!currentPin || !newPin || !confirmPin) {
      toast({ 
        title: "Invalid Input", 
        description: "Please fill all fields", 
        variant: "destructive" 
      });
      return;
    }

    if (newPin !== confirmPin) {
      toast({ 
        title: "PIN Mismatch", 
        description: "New PIN and confirmation don't match", 
        variant: "destructive" 
      });
      return;
    }

    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      toast({ 
        title: "Invalid PIN", 
        description: "PIN must be exactly 6 digits", 
        variant: "destructive" 
      });
      return;
    }

    changePinMutation.mutate({ currentPin, newPin });
  };

  const copyReferralCode = () => {
    if (referralData?.referralCode) {
      navigator.clipboard.writeText(referralData.referralCode);
      toast({ 
        title: "Copied!", 
        description: "Referral code copied to clipboard" 
      });
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${referralData?.referralCode}`;
    navigator.clipboard.writeText(link);
    toast({ 
      title: "Copied!", 
      description: "Referral link copied to clipboard" 
    });
  };

  // Get all transactions sorted by date
  const allTransactions = [
    ...(transactions?.deposits || []).map(d => ({ ...d, type: 'deposit' })),
    ...(transactions?.withdrawals || []).map(w => ({ ...w, type: 'withdrawal' }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="mobile-page">
      {/* Header */}
      <div className="mobile-header">
        <h1 className="text-lg font-display font-bold text-primary">BITCOIN WALLET</h1>
        <Button
          onClick={() => logoutMutation.mutate()}
          size="sm"
          variant="ghost"
          className="text-destructive"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="mobile-content">
        {/* Main Wallet Card - Bitcoin Style */}
        <Card className="mobile-card bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-background border-yellow-500/20">
          <div className="relative">
            {/* Bitcoin Logo Background */}
            <div className="absolute top-4 right-4 w-24 h-24 opacity-10">
              <img src={bitcoinLogo} alt="BTC" className="w-full h-full" />
            </div>
            
            {/* User Info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                <img src={bitcoinLogo} alt="BTC" className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-mono">WALLET ID</p>
                <p className="text-lg font-display font-bold">@{user?.username}</p>
                {user?.isAdmin && (
                  <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 text-xs">
                    ADMIN
                  </Badge>
                )}
              </div>
            </div>

            {/* Balance Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-background/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">USDT BALANCE</p>
                <p className="text-xl font-display font-bold text-accent">
                  ${parseFloat(user?.usdtBalance || '0').toFixed(2)}
                </p>
              </div>
              <div className="bg-background/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">GBTC MINED</p>
                <p className="text-xl font-display font-bold text-yellow-500">
                  {parseFloat(user?.gbtcBalance || '0').toFixed(4)}
                </p>
              </div>
            </div>

            {/* Mining Stats */}
            <div className="bg-background/50 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">MINING POWER</p>
                  <p className="text-lg font-display font-bold text-primary">
                    {parseFloat(user?.hashPower || '0').toFixed(2)} TH/s
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">UNCLAIMED</p>
                  <p className="text-lg font-display font-bold text-chart-3">
                    {parseFloat(user?.unclaimedBalance || '0').toFixed(4)} GBTC
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => window.location.href = '/deposit'}
                size="sm"
                variant="outline"
                className="border-accent text-accent"
              >
                <ArrowDown className="w-3 h-3 mr-1" />
                Deposit
              </Button>
              <Button
                onClick={() => window.location.href = '/withdraw'}
                size="sm"
                variant="outline"
                className="border-destructive text-destructive"
              >
                <ArrowUp className="w-3 h-3 mr-1" />
                Withdraw
              </Button>
              <Button
                onClick={() => window.location.href = '/transfer'}
                size="sm"
                variant="outline"
                className="border-primary text-primary"
              >
                <Send className="w-3 h-3 mr-1" />
                Transfer
              </Button>
            </div>
          </div>
        </Card>

        {/* Transaction History Section */}
        <Card className="mobile-card">
          <p className="text-sm font-mono text-muted-foreground mb-3">RECENT TRANSACTIONS</p>
          {allTransactions.length > 0 ? (
            <div className="space-y-2">
              {allTransactions.map((tx: any) => (
                <div
                  key={tx.id}
                  className="bg-background rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'deposit' 
                        ? 'bg-accent/20 text-accent' 
                        : 'bg-destructive/20 text-destructive'
                    }`}>
                      {tx.type === 'deposit' ? (
                        <ArrowDown className="w-4 h-4" />
                      ) : (
                        <ArrowUp className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      tx.type === 'deposit' ? 'text-accent' : 'text-destructive'
                    }`}>
                      {tx.type === 'deposit' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                    </p>
                    <Badge 
                      variant={tx.status === 'approved' ? 'default' : tx.status === 'pending' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No transactions yet</p>
            </div>
          )}
          <Button
            onClick={() => window.location.href = '/transactions'}
            variant="outline"
            className="w-full mt-3"
          >
            View All Transactions
          </Button>
        </Card>

        {/* Referrals Section */}
        <Card className="mobile-card">
          <p className="text-sm font-mono text-muted-foreground mb-3">REFERRAL PROGRAM</p>
          
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-4 mb-3 text-center border border-primary/20">
            <p className="text-2xl font-display font-black text-primary tracking-wider">
              {referralData?.referralCode || 'LOADING...'}
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                onClick={copyReferralCode}
                variant="outline"
                size="sm"
                className="flex-1"
                data-testid="button-copy-code"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy Code
              </Button>
              <Button
                onClick={copyReferralLink}
                size="sm"
                className="flex-1 bg-primary text-primary-foreground"
                data-testid="button-copy-link"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy Link
              </Button>
            </div>
          </div>

          {/* Referral Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-background rounded-lg p-3 text-center">
              <i className="fas fa-users text-chart-4 text-lg mb-1"></i>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-display font-bold">
                {referralData?.totalReferrals || 0}
              </p>
            </div>
            <div className="bg-background rounded-lg p-3 text-center">
              <TrendingUp className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-lg font-display font-bold">
                {referralData?.activeReferrals || 0}
              </p>
            </div>
            <div className="bg-background rounded-lg p-3 text-center">
              <Award className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Earned</p>
              <p className="text-lg font-display font-bold text-accent">
                ${referralData?.totalEarnings || '0.00'}
              </p>
            </div>
          </div>
        </Card>

        {/* Referral List */}
        {referralData?.referrals && referralData.referrals.length > 0 && (
          <Card className="mobile-card">
            <p className="text-sm font-mono text-muted-foreground mb-3">YOUR REFERRALS</p>
            <div className="space-y-2">
              {referralData.referrals.map((ref) => (
                <div
                  key={ref.id}
                  className="bg-background rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bitcoin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">@{ref.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ref.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={ref.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {ref.status}
                    </Badge>
                    <p className="text-xs font-mono text-accent mt-1">
                      +${ref.earned}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Security Section */}
        <Card className="mobile-card">
          <p className="text-sm font-mono text-muted-foreground mb-3">SECURITY SETTINGS</p>
          
          <div className="space-y-3">
            <div className="bg-background rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <p className="font-semibold">Security PIN</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  6-DIGIT
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Protect your account with a secure PIN
              </p>
              <Button
                onClick={() => setShowPinDialog(true)}
                variant="outline"
                size="sm"
                className="w-full border-primary text-primary"
                data-testid="button-change-pin"
              >
                Change PIN
              </Button>
            </div>

            <div className="bg-background rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Hash className="w-5 h-5 text-chart-4" />
                  <p className="font-semibold">2FA Authentication</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  COMING SOON
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Enhanced security with two-factor authentication
              </p>
            </div>

            <div className="bg-background rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-chart-3" />
                  <p className="font-semibold">Login History</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">
                Last login: {new Date().toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">
                IP: 192.168.1.1
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Change PIN Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Security PIN</DialogTitle>
            <DialogDescription>
              Enter your current PIN and choose a new 6-digit PIN
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-pin">Current PIN</Label>
              <Input
                id="current-pin"
                type="password"
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                placeholder="Enter current PIN"
                maxLength={6}
                data-testid="input-current-pin"
              />
            </div>
            <div>
              <Label htmlFor="new-pin">New PIN</Label>
              <Input
                id="new-pin"
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Enter new 6-digit PIN"
                maxLength={6}
                data-testid="input-new-pin"
              />
            </div>
            <div>
              <Label htmlFor="confirm-pin">Confirm New PIN</Label>
              <Input
                id="confirm-pin"
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Confirm new PIN"
                maxLength={6}
                data-testid="input-confirm-pin"
              />
            </div>
            <Button
              onClick={handlePinChange}
              disabled={changePinMutation.isPending}
              className="w-full"
              data-testid="button-confirm-pin-change"
            >
              {changePinMutation.isPending ? 'Changing...' : 'Change PIN'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}