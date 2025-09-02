import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Shield, Copy, TrendingUp, Award, LogOut } from "lucide-react";
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
    <div className="mobile-page">
      {/* Header */}
      <div className="mobile-header">
        <h1 className="text-lg font-display font-bold text-primary">MY ACCOUNT</h1>
        <div className="text-right">
          <p className="text-xs text-muted-foreground font-mono">BALANCE</p>
          <p className="text-sm font-display font-bold text-accent">
            ${parseFloat(user?.usdtBalance || '0').toFixed(2)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mobile-content">
        {/* User Profile Card */}
        <Card className="mobile-card bg-gradient-to-br from-primary/10 to-chart-3/10">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-3 flex items-center justify-center">
              <User className="w-10 h-10 text-background" />
            </div>
            <h2 className="text-xl font-display font-bold mb-1">@{user?.username}</h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              {user?.isAdmin ? (
                <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                  <Shield className="w-3 h-3 mr-1" />
                  ADMINISTRATOR
                </Badge>
              ) : (
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  STANDARD USER
                </Badge>
              )}
            </div>
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
        </Card>

        {/* Security Section */}
        <Card className="mobile-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-display font-bold">Security Settings</p>
              <p className="text-xs text-muted-foreground">Manage your PIN</p>
            </div>
            <Button
              onClick={() => setShowPinDialog(true)}
              variant="outline"
              size="sm"
              className="border-primary text-primary"
              data-testid="button-change-pin"
            >
              <Shield className="w-4 h-4 mr-1" />
              Change PIN
            </Button>
          </div>
        </Card>

        {/* Referral Section */}
        <Card className="mobile-card">
          <p className="text-sm font-mono text-muted-foreground mb-3">YOUR REFERRAL CODE</p>
          
          <div className="bg-background rounded-lg p-4 mb-3 text-center">
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
              <p className="text-xs text-muted-foreground">Referrals</p>
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

        {/* Quick Actions */}
        <Card className="mobile-card">
          <p className="text-sm font-mono text-muted-foreground mb-3">QUICK ACTIONS</p>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => window.location.href = '/deposit'}
            >
              <i className="fas fa-arrow-down text-accent mr-3"></i>
              Make a Deposit
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => window.location.href = '/withdraw'}
            >
              <i className="fas fa-arrow-up text-destructive mr-3"></i>
              Request Withdrawal
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => window.location.href = '/transactions'}
            >
              <i className="fas fa-history text-chart-4 mr-3"></i>
              View Transactions
            </Button>
          </div>
        </Card>

        {/* Referral History (if any) */}
        {referralData?.referrals && referralData.referrals.length > 0 && (
          <Card className="mobile-card">
            <p className="text-sm font-mono text-muted-foreground mb-3">RECENT REFERRALS</p>
            <div className="space-y-2">
              {referralData.referrals.slice(0, 3).map((ref) => (
                <div
                  key={ref.id}
                  className="bg-background rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
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