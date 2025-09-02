import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Copy, LogOut, User, Gift, Lock } from "lucide-react";
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

  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${referralData?.referralCode}`;
    navigator.clipboard.writeText(link);
    toast({ 
      title: "Copied!", 
      description: "Referral link copied to clipboard" 
    });
  };

  return (
    <div className="mobile-page bg-gradient-to-b from-background via-background to-primary/5">
      {/* Header */}
      <div className="mobile-header border-b border-primary/20">
        <h1 className="text-lg font-display font-bold text-primary">ACCOUNT</h1>
      </div>

      {/* Content */}
      <div className="mobile-content">
        {/* Compact User Card */}
        <div className="bg-gradient-to-r from-primary/10 via-chart-4/10 to-primary/10 rounded-lg p-4 mb-4 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center">
              <User className="w-6 h-6 text-background" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-lg font-display font-bold">@{user?.username}</p>
                {user?.isAdmin && (
                  <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 text-xs px-2 py-0">
                    ADMIN
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                ID: {user?.id?.slice(0, 8)}...
              </p>
            </div>
          </div>
        </div>

        {/* Compact Options Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Referral Code */}
          <Card className="p-3 bg-gradient-to-br from-background to-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-primary" />
              <p className="text-xs font-semibold text-muted-foreground">REFERRAL</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-display font-bold text-primary">
                  {referralData?.referralCode || '------'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {referralData?.totalReferrals || 0} refs
                </p>
              </div>
              <Button
                onClick={copyReferralCode}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                data-testid="button-copy-code"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </Card>

          {/* Security PIN */}
          <Card className="p-3 bg-gradient-to-br from-background to-chart-4/5 border-chart-4/20">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-chart-4" />
              <p className="text-xs font-semibold text-muted-foreground">SECURITY</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">PIN</p>
                <p className="text-xs text-muted-foreground">6-digit</p>
              </div>
              <Button
                onClick={() => setShowPinDialog(true)}
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs"
                data-testid="button-change-pin"
              >
                Change
              </Button>
            </div>
          </Card>
        </div>

        {/* Referral Stats */}
        <Card className="mobile-card bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">REFERRAL EARNINGS</p>
              <p className="text-xl font-display font-bold text-accent">
                ${referralData?.totalEarnings || '0.00'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">ACTIVE</p>
              <p className="text-xl font-display font-bold text-primary">
                {referralData?.activeReferrals || 0}
              </p>
            </div>
            <Button
              onClick={copyReferralLink}
              variant="outline"
              size="sm"
              className="border-primary/30 text-primary"
            >
              <Copy className="w-3 h-3 mr-1" />
              Link
            </Button>
          </div>
        </Card>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Logout Button */}
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