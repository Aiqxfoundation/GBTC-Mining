import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Users, Lock, Copy, TrendingUp, Award, Calendar, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AccountPage() {
  const { user } = useAuth();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Username */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">@{user?.username}</h1>
          <p className="text-gray-400">Account Management</p>
          {user?.isAdmin && (
            <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
              ADMIN
            </Badge>
          )}
        </motion.div>

        {/* Account Info Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-xl text-orange-500">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">User ID</p>
                  <p className="text-sm font-mono text-white">{user?.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Account Type</p>
                  <p className="text-sm font-semibold text-white">
                    {user?.isAdmin ? 'Administrator' : 'Standard User'}
                  </p>
                </div>
              </div>
              
              {/* Security Section */}
              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Security PIN</p>
                    <p className="text-xs text-gray-400">6-digit PIN for login</p>
                  </div>
                  <Button
                    onClick={() => setShowPinDialog(true)}
                    variant="outline"
                    className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
                    data-testid="button-change-pin"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Change PIN
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Referral System Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-orange-500">Referral System</CardTitle>
              <CardDescription className="text-gray-400">
                Earn rewards by inviting friends to join
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Referral Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <p className="text-xs text-gray-400">Total Referrals</p>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {referralData?.totalReferrals || 0}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <p className="text-xs text-gray-400">Active Users</p>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {referralData?.activeReferrals || 0}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <p className="text-xs text-gray-400">Total Earned</p>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      ${referralData?.totalEarnings || '0.00'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Referral Code */}
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Your Referral Code</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-black/50 rounded px-4 py-2">
                    <p className="text-lg font-mono text-orange-500">
                      {referralData?.referralCode || user?.username?.toUpperCase()}
                    </p>
                  </div>
                  <Button
                    onClick={copyReferralCode}
                    variant="outline"
                    className="border-gray-600"
                    data-testid="button-copy-code"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  onClick={copyReferralLink}
                  className="w-full mt-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  data-testid="button-copy-link"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Referral Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Referral History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-orange-500">Referral History</CardTitle>
            </CardHeader>
            <CardContent>
              {referralData?.referrals && referralData.referrals.length > 0 ? (
                <div className="space-y-2">
                  {referralData.referrals.map((ref) => (
                    <div
                      key={ref.id}
                      className="bg-gray-800 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">@{ref.username}</p>
                          <div className="flex items-center space-x-2 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(ref.joinedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          className={ref.status === 'active' 
                            ? 'bg-green-500/20 text-green-500 border-green-500/30' 
                            : 'bg-gray-500/20 text-gray-500 border-gray-500/30'
                          }
                        >
                          {ref.status}
                        </Badge>
                        <p className="text-sm font-mono text-orange-500 mt-1">
                          +${ref.earned}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No referrals yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Share your referral code to start earning
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Change PIN Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-black to-gray-900 border-orange-500/20">
          <DialogHeader>
            <DialogTitle className="text-orange-500">Change Security PIN</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter your current PIN and choose a new 6-digit PIN
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-pin" className="text-gray-300">Current PIN</Label>
              <Input
                id="current-pin"
                type="password"
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                placeholder="Enter current PIN"
                maxLength={6}
                className="bg-black/50 border-gray-700"
                data-testid="input-current-pin"
              />
            </div>
            <div>
              <Label htmlFor="new-pin" className="text-gray-300">New PIN</Label>
              <Input
                id="new-pin"
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Enter new 6-digit PIN"
                maxLength={6}
                className="bg-black/50 border-gray-700"
                data-testid="input-new-pin"
              />
            </div>
            <div>
              <Label htmlFor="confirm-pin" className="text-gray-300">Confirm New PIN</Label>
              <Input
                id="confirm-pin"
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Confirm new PIN"
                maxLength={6}
                className="bg-black/50 border-gray-700"
                data-testid="input-confirm-pin"
              />
            </div>
            <Button
              onClick={handlePinChange}
              disabled={changePinMutation.isPending}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
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