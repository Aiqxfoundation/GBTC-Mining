import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Copy, LogOut, ArrowDown, ArrowUp, Send, Clock, History } from "lucide-react";
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
  }>({
    queryKey: ["/api/referrals"],
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

  return (
    <div className="mobile-page">
      {/* Header */}
      <div className="mobile-header">
        <h1 className="text-lg font-display font-bold text-primary">MY WALLET</h1>
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
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-mono">BITCOIN WALLET</p>
                <p className="text-lg font-display font-bold">@{user?.username}</p>
                {user?.isAdmin && (
                  <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 text-xs">
                    ADMIN
                  </Badge>
                )}
              </div>
            </div>

            {/* Main Balance Display */}
            <div className="bg-gradient-to-r from-background/80 to-background/60 rounded-lg p-4 mb-4 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">TOTAL BALANCE</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-display font-black text-accent">
                  ${parseFloat(user?.usdtBalance || '0').toFixed(2)}
                </p>
                <span className="text-sm text-muted-foreground">USDT</span>
              </div>
            </div>

            {/* Asset Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-background/50 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground mb-1">GBTC</p>
                <p className="text-lg font-display font-bold text-yellow-500">
                  {parseFloat(user?.gbtcBalance || '0').toFixed(2)}
                </p>
              </div>
              <div className="bg-background/50 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground mb-1">POWER</p>
                <p className="text-lg font-display font-bold text-primary">
                  {parseFloat(user?.hashPower || '0').toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">TH/s</p>
              </div>
              <div className="bg-background/50 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground mb-1">PENDING</p>
                <p className="text-lg font-display font-bold text-chart-3">
                  {parseFloat(user?.unclaimedBalance || '0').toFixed(2)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-4 gap-2">
              <Button
                onClick={() => window.location.href = '/deposit'}
                size="sm"
                variant="outline"
                className="flex-col h-auto py-2 border-primary/30 hover:border-accent"
              >
                <ArrowDown className="w-4 h-4 mb-1 text-accent" />
                <span className="text-xs">Deposit</span>
              </Button>
              <Button
                onClick={() => window.location.href = '/withdraw'}
                size="sm"
                variant="outline"
                className="flex-col h-auto py-2 border-primary/30 hover:border-destructive"
              >
                <ArrowUp className="w-4 h-4 mb-1 text-destructive" />
                <span className="text-xs">Withdraw</span>
              </Button>
              <Button
                onClick={() => window.location.href = '/transfer'}
                size="sm"
                variant="outline"
                className="flex-col h-auto py-2 border-primary/30 hover:border-primary"
              >
                <Send className="w-4 h-4 mb-1 text-primary" />
                <span className="text-xs">Transfer</span>
              </Button>
              <Button
                onClick={() => window.location.href = '/transactions'}
                size="sm"
                variant="outline"
                className="flex-col h-auto py-2 border-primary/30 hover:border-chart-4"
              >
                <History className="w-4 h-4 mb-1 text-chart-4" />
                <span className="text-xs">History</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Referral Code Card */}
        <Card className="mobile-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-mono text-muted-foreground">REFERRAL CODE</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{referralData?.totalReferrals || 0} referrals</span>
              <span>•</span>
              <span className="text-accent">${referralData?.totalEarnings || '0.00'} earned</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-3 border border-primary/20">
            <div className="flex items-center justify-between">
              <p className="text-xl font-display font-black text-primary tracking-wider">
                {referralData?.referralCode || 'LOADING...'}
              </p>
              <Button
                onClick={copyReferralCode}
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80"
                data-testid="button-copy-code"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Security Card */}
        <Card className="mobile-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold">Security PIN</p>
                <p className="text-xs text-muted-foreground">6-digit security code</p>
              </div>
            </div>
            <Button
              onClick={() => setShowPinDialog(true)}
              variant="outline"
              size="sm"
              className="border-primary text-primary"
              data-testid="button-change-pin"
            >
              Change
            </Button>
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