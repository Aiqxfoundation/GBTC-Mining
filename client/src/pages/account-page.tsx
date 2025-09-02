import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Copy, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
        <h1 className="text-lg font-display font-bold text-primary">ACCOUNT</h1>
        <div className="text-right">
          <p className="text-xs text-muted-foreground font-mono">BALANCE</p>
          <p className="text-sm font-display font-bold text-accent">
            ${parseFloat(user?.usdtBalance || '0').toFixed(2)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mobile-content">
        {/* User Info Card */}
        <Card className="mobile-card bg-gradient-to-br from-primary/5 to-background">
          <div className="text-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-chart-4 mx-auto mb-3 flex items-center justify-center">
              <span className="text-3xl font-display font-bold text-background">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <h2 className="text-xl font-display font-bold">@{user?.username}</h2>
            {user?.isAdmin && (
              <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 mt-2">
                ADMINISTRATOR
              </Badge>
            )}
          </div>

          {/* Wallet Info */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">USDT</p>
              <p className="text-lg font-display font-bold text-accent">
                ${parseFloat(user?.usdtBalance || '0').toFixed(0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">GBTC</p>
              <p className="text-lg font-display font-bold text-primary">
                {parseFloat(user?.gbtcBalance || '0').toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">POWER</p>
              <p className="text-lg font-display font-bold text-chart-4">
                {parseFloat(user?.hashPower || '0').toFixed(0)}
              </p>
            </div>
          </div>
        </Card>

        {/* Referral Code Card */}
        <Card className="mobile-card">
          <p className="text-sm font-mono text-muted-foreground mb-3">REFERRAL CODE</p>
          
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg p-4 border border-primary/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-display font-black text-primary tracking-wider">
                  {referralData?.referralCode || 'LOADING...'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {referralData?.totalReferrals || 0} referrals • ${referralData?.totalEarnings || '0.00'} earned
                </p>
              </div>
              <Button
                onClick={copyReferralCode}
                variant="ghost"
                size="icon"
                className="text-primary hover:text-primary/80"
                data-testid="button-copy-code"
              >
                <Copy className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Security PIN Card */}
        <Card className="mobile-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
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

        {/* Logout Button */}
        <Card className="mobile-card">
          <Button
            onClick={() => logoutMutation.mutate()}
            variant="destructive"
            className="w-full"
            disabled={logoutMutation.isPending}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            LOGOUT
          </Button>
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