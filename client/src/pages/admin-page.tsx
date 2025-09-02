import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Check, Edit, Shield, Users, Settings, DollarSign, Activity } from "lucide-react";
import { Link } from "wouter";
import bitcoinLogo from "@assets/file_00000000221c61fab63936953b889556_1756633909848.png";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export default function AdminPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [editingDeposit, setEditingDeposit] = useState<any>(null);
  const [editingWithdrawal, setEditingWithdrawal] = useState<any>(null);
  const [actualAmount, setActualAmount] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [txHashInput, setTxHashInput] = useState("");
  const [blockRewardInput, setBlockRewardInput] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userBalanceEdit, setUserBalanceEdit] = useState({ usdt: "", gbtc: "", hashPower: "" });
  
  const handleCopyHash = (hash: string, depositId: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(depositId);
    setTimeout(() => setCopiedHash(null), 2000);
    toast({ title: "Copied!", description: "Transaction hash copied to clipboard" });
  };
  
  const handleCopyAddress = (address: string, withdrawalId: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(withdrawalId);
    setTimeout(() => setCopiedAddress(null), 2000);
    toast({ title: "Copied!", description: "Withdrawal address copied to clipboard" });
  };

  const { data: pendingDeposits, isLoading: depositsLoading } = useQuery({
    queryKey: ["/api/deposits/pending"],
    enabled: !!user?.isAdmin
  });

  const { data: pendingWithdrawals, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ["/api/withdrawals/pending"],
    enabled: !!user?.isAdmin
  });

  const { data: adminStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin
  });

  const { data: allUsers } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin
  });

  const { data: blockRewardSetting } = useQuery({
    queryKey: ["/api/settings/blockReward"],
    enabled: !!user?.isAdmin
  });

  const approveDepositMutation = useMutation({
    mutationFn: async ({ id, actualAmount, adminNote }: { id: string; actualAmount: string; adminNote?: string }) => {
      const res = await apiRequest("PATCH", `/api/deposits/${id}/approve`, { actualAmount, adminNote });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Deposit approved", description: "The deposit has been approved with verified amount." });
      queryClient.invalidateQueries({ queryKey: ["/api/deposits/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setEditingDeposit(null);
      setActualAmount("");
      setAdminNote("");
    },
    onError: (error: Error) => {
      toast({ title: "Approval failed", description: error.message, variant: "destructive" });
    }
  });

  const rejectDepositMutation = useMutation({
    mutationFn: async ({ id, adminNote }: { id: string; adminNote?: string }) => {
      const res = await apiRequest("PATCH", `/api/deposits/${id}/reject`, { adminNote });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Deposit rejected", description: "The deposit has been rejected." });
      queryClient.invalidateQueries({ queryKey: ["/api/deposits/pending"] });
      setEditingDeposit(null);
      setAdminNote("");
    },
    onError: (error: Error) => {
      toast({ title: "Rejection failed", description: error.message, variant: "destructive" });
    }
  });

  const freezeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}/freeze`);
      return res.json();
    },
    onSuccess: () => {
      toast({ 
        title: "User Frozen", 
        description: "The user account has been frozen.",
        variant: "destructive" 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/deposits/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to freeze user", description: error.message, variant: "destructive" });
    }
  });

  const unfreezeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}/unfreeze`);
      return res.json();
    },
    onSuccess: () => {
      toast({ 
        title: "User Unfrozen", 
        description: "The user account has been unfrozen." 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to unfreeze user", description: error.message, variant: "destructive" });
    }
  });

  const updateUserBalanceMutation = useMutation({
    mutationFn: async ({ userId, balances }: { userId: string; balances: any }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}/balances`, balances);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "User balances updated", description: "The user's balances have been updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setSelectedUser(null);
      setUserBalanceEdit({ usdt: "", gbtc: "", hashPower: "" });
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    }
  });

  const approveWithdrawalMutation = useMutation({
    mutationFn: async ({ id, txHash }: { id: string; txHash?: string }) => {
      const res = await apiRequest("PATCH", `/api/withdrawals/${id}/approve`, { txHash });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Withdrawal approved", description: "The withdrawal has been processed successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setEditingWithdrawal(null);
      setTxHashInput("");
    },
    onError: (error: Error) => {
      toast({ title: "Approval failed", description: error.message, variant: "destructive" });
    }
  });

  const rejectWithdrawalMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/withdrawals/${id}/reject`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Withdrawal rejected", description: "The withdrawal request has been rejected." });
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals/pending"] });
      setEditingWithdrawal(null);
    },
    onError: (error: Error) => {
      toast({ title: "Rejection failed", description: error.message, variant: "destructive" });
    }
  });

  const updateBlockRewardMutation = useMutation({
    mutationFn: async (newReward: string) => {
      const res = await apiRequest("POST", "/api/settings", { key: "blockReward", value: newReward });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Block reward updated", description: "The block reward has been updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/blockReward"] });
      setBlockRewardInput("");
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    }
  });

  const halveRewardMutation = useMutation({
    mutationFn: async () => {
      const currentReward = blockRewardSetting?.value ? parseFloat(blockRewardSetting.value) : 6.25;
      const newReward = (currentReward / 2).toString();
      const res = await apiRequest("POST", "/api/settings", { key: "blockReward", value: newReward });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Block reward halved", description: "The block reward has been successfully halved." });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/blockReward"] });
    },
    onError: (error: Error) => {
      toast({ title: "Halving failed", description: error.message, variant: "destructive" });
    }
  });

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You don't have admin privileges to access this page.
            </p>
            <Link href="/dashboard">
              <Button>Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <img src={bitcoinLogo} alt="GBTC" className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">GBTC Admin Control Center</h1>
                <p className="text-xs text-muted-foreground">Full System Management</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-foreground hover:text-primary transition-colors">
                <i className="fas fa-tachometer-alt mr-2"></i>Dashboard
              </Link>
              <button 
                onClick={() => logoutMutation.mutate()}
                className="text-foreground hover:text-destructive transition-colors"
                data-testid="button-logout"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Admin Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                  <p className="text-xl font-bold" data-testid="text-total-users">
                    {adminStats?.userCount || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-chart-4" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Deposits</p>
                  <p className="text-xl font-bold text-accent" data-testid="text-total-deposits">
                    ${parseFloat(adminStats?.totalDeposits || "0").toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Withdrawals</p>
                  <p className="text-xl font-bold text-destructive" data-testid="text-total-withdrawals">
                    {parseFloat(adminStats?.totalWithdrawals || "0").toFixed(2)}
                  </p>
                </div>
                <i className="fas fa-arrow-up text-destructive text-xl"></i>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Hash Power</p>
                  <p className="text-xl font-bold text-primary" data-testid="text-global-hash-power">
                    {parseFloat(adminStats?.totalHashPower || "0").toFixed(0)} TH/s
                  </p>
                </div>
                <Activity className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Block Reward</p>
                  <p className="text-xl font-bold text-green-500">
                    {parseFloat(blockRewardSetting?.value || "6.25").toFixed(2)} GBTC
                  </p>
                </div>
                <Settings className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Admin Tabs */}
        <Tabs defaultValue="deposits" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="deposits" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <i className="fas fa-arrow-down mr-2"></i>
              Deposits
              {pendingDeposits && pendingDeposits.length > 0 && (
                <Badge className="ml-2" variant="secondary">{pendingDeposits.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
              <i className="fas fa-arrow-up mr-2"></i>
              Withdrawals
              {pendingWithdrawals && pendingWithdrawals.length > 0 && (
                <Badge className="ml-2" variant="secondary">{pendingWithdrawals.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="system">
              <Settings className="w-4 h-4 mr-2" />
              System Control
            </TabsTrigger>
          </TabsList>
          
          {/* Deposits Tab */}
          <TabsContent value="deposits">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-arrow-down text-accent mr-3"></i>
                  Pending Deposits - Verify Amounts Carefully
                </CardTitle>
              </CardHeader>
              <CardContent>
                {depositsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : pendingDeposits && pendingDeposits.length > 0 ? (
                  <div className="space-y-4">
                    {pendingDeposits.map((deposit: any) => (
                      <div key={deposit.id} className="bg-muted/30 p-4 rounded-lg border border-border">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-lg">
                              {deposit.user.username}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Network: {deposit.network} | Status: <span className="text-yellow-500">Pending Verification</span>
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                            REQUIRES VERIFICATION
                          </Badge>
                        </div>
                        
                        <div className="bg-destructive/10 border border-destructive/30 rounded p-3 mb-3">
                          <div className="flex justify-between items-center">
                            <span className="text-destructive font-semibold">Claimed Amount:</span>
                            <span className="text-xl font-bold text-destructive">
                              ${parseFloat(deposit.amount).toFixed(2)}
                            </span>
                          </div>
                          <p className="text-xs text-destructive/70 mt-1">
                            ⚠️ Verify this amount matches the actual transaction
                          </p>
                        </div>
                        
                        <div className="mb-3 p-2 bg-muted rounded">
                          <p className="text-xs text-muted-foreground mb-1">Transaction Hash:</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-xs bg-background p-2 rounded">
                              {deposit.txHash}
                            </code>
                            <Button
                              onClick={() => handleCopyHash(deposit.txHash, deposit.id)}
                              size="sm"
                              variant="outline"
                            >
                              {copiedHash === deposit.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => {
                              setEditingDeposit(deposit);
                              setActualAmount("");
                              setAdminNote("");
                            }}
                            className="flex-1 bg-primary"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Verify & Approve
                          </Button>
                          <Button 
                            onClick={() => rejectDepositMutation.mutate({ id: deposit.id, adminNote: "Transaction not verified" })}
                            variant="destructive"
                            className="flex-1"
                          >
                            <i className="fas fa-times mr-2"></i>
                            Reject
                          </Button>
                          <Button 
                            onClick={() => freezeUserMutation.mutate(deposit.userId)}
                            variant="outline"
                            className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                          >
                            <i className="fas fa-ban"></i>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <i className="fas fa-inbox text-4xl mb-4"></i>
                    <p>No pending deposits</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-arrow-up text-destructive mr-3"></i>
                  Pending Withdrawals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {withdrawalsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : pendingWithdrawals && pendingWithdrawals.length > 0 ? (
                  <div className="space-y-4">
                    {pendingWithdrawals.map((withdrawal: any) => (
                      <div key={withdrawal.id} className="bg-muted/30 p-4 rounded-lg border border-border">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-lg">
                              {withdrawal.user?.username}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Network: {withdrawal.network}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                            PENDING
                          </Badge>
                        </div>
                        
                        <div className="bg-muted rounded p-3 mb-3">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Withdrawal Amount:</span>
                            <span className="text-xl font-bold">
                              {parseFloat(withdrawal.amount).toFixed(2)} USDT
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2 text-sm">
                            <span className="text-muted-foreground">User Balance:</span>
                            <span>
                              {parseFloat(withdrawal.user?.usdtBalance || '0').toFixed(2)} USDT
                            </span>
                          </div>
                        </div>
                        
                        <div className="mb-3 p-2 bg-muted rounded">
                          <p className="text-xs text-muted-foreground mb-1">Withdrawal Address:</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-xs bg-background p-2 rounded">
                              {withdrawal.address}
                            </code>
                            <Button
                              onClick={() => handleCopyAddress(withdrawal.address, withdrawal.id)}
                              size="sm"
                              variant="outline"
                            >
                              {copiedAddress === withdrawal.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => {
                              setEditingWithdrawal(withdrawal);
                              setTxHashInput("");
                            }}
                            className="flex-1 bg-primary"
                          >
                            <i className="fas fa-check mr-2"></i>
                            Process & Approve
                          </Button>
                          <Button 
                            onClick={() => rejectWithdrawalMutation.mutate(withdrawal.id)}
                            variant="destructive"
                            className="flex-1"
                          >
                            <i className="fas fa-times mr-2"></i>
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <i className="fas fa-inbox text-4xl mb-4"></i>
                    <p>No pending withdrawals</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Users Management Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-3" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allUsers && allUsers.length > 0 ? (
                  <div className="space-y-3">
                    {allUsers.map((u: any) => (
                      <div key={u.id} className="bg-muted/30 p-4 rounded-lg border border-border">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-lg">{u.username}</p>
                            <p className="text-xs text-muted-foreground">
                              ID: {u.id} | Status: {u.isFrozen ? 
                                <span className="text-destructive">FROZEN</span> : 
                                <span className="text-green-500">ACTIVE</span>
                              }
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {u.isFrozen ? (
                              <Button 
                                onClick={() => unfreezeUserMutation.mutate(u.id)}
                                size="sm"
                                variant="outline"
                                className="border-green-500 text-green-500"
                              >
                                Unfreeze
                              </Button>
                            ) : (
                              <Button 
                                onClick={() => freezeUserMutation.mutate(u.id)}
                                size="sm"
                                variant="outline"
                                className="border-destructive text-destructive"
                              >
                                Freeze
                              </Button>
                            )}
                            <Button 
                              onClick={() => {
                                setSelectedUser(u);
                                setUserBalanceEdit({
                                  usdt: u.usdtBalance,
                                  gbtc: u.gbtcBalance,
                                  hashPower: u.hashPower
                                });
                              }}
                              size="sm"
                              variant="outline"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="bg-background p-2 rounded">
                            <p className="text-xs text-muted-foreground">USDT</p>
                            <p className="font-mono font-bold">${parseFloat(u.usdtBalance).toFixed(2)}</p>
                          </div>
                          <div className="bg-background p-2 rounded">
                            <p className="text-xs text-muted-foreground">GBTC</p>
                            <p className="font-mono font-bold">{parseFloat(u.gbtcBalance).toFixed(4)}</p>
                          </div>
                          <div className="bg-background p-2 rounded">
                            <p className="text-xs text-muted-foreground">Hash Power</p>
                            <p className="font-mono font-bold">{parseFloat(u.hashPower).toFixed(0)} TH/s</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4" />
                    <p>No users found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* System Control Tab */}
          <TabsContent value="system">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-3" />
                    Block Reward Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Current Block Reward</p>
                    <p className="text-3xl font-bold text-green-500">
                      {parseFloat(blockRewardSetting?.value || "6.25").toFixed(4)} GBTC
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="New block reward..."
                      value={blockRewardInput}
                      onChange={(e) => setBlockRewardInput(e.target.value)}
                      step="0.01"
                      min="0"
                    />
                    <Button 
                      onClick={() => blockRewardInput && updateBlockRewardMutation.mutate(blockRewardInput)}
                      disabled={!blockRewardInput || updateBlockRewardMutation.isPending}
                    >
                      Update Reward
                    </Button>
                    <Button 
                      onClick={() => halveRewardMutation.mutate()}
                      variant="destructive"
                      disabled={halveRewardMutation.isPending}
                    >
                      <i className="fas fa-cut mr-2"></i>
                      Execute Halving
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-3" />
                    System Operations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full" variant="outline">
                      <i className="fas fa-sync mr-2"></i>
                      Force Block Generation
                    </Button>
                    <Button className="w-full" variant="outline">
                      <i className="fas fa-calculator mr-2"></i>
                      Recalculate All Balances
                    </Button>
                    <Button className="w-full" variant="destructive">
                      <i className="fas fa-trash mr-2"></i>
                      Clear All Pending Transactions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Deposit Verification Dialog */}
      <Dialog open={!!editingDeposit} onOpenChange={() => setEditingDeposit(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Deposit Amount</DialogTitle>
            <DialogDescription>
              Verify the actual transaction amount before approving. The claimed amount may not match the real transaction.
            </DialogDescription>
          </DialogHeader>
          {editingDeposit && (
            <div className="space-y-4">
              <div className="bg-destructive/10 border border-destructive/30 rounded p-3">
                <Label className="text-destructive">Claimed Amount (Unverified)</Label>
                <p className="text-2xl font-bold text-destructive">
                  ${parseFloat(editingDeposit.amount).toFixed(2)}
                </p>
              </div>
              
              <div>
                <Label>Transaction Hash</Label>
                <Input value={editingDeposit.txHash} readOnly className="font-mono text-xs" />
              </div>
              
              <div>
                <Label htmlFor="actual-amount">
                  Actual Verified Amount (USDT) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="actual-amount"
                  type="number"
                  placeholder="Enter the actual amount from blockchain"
                  value={actualAmount}
                  onChange={(e) => setActualAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the exact amount you verified from the blockchain transaction
                </p>
              </div>
              
              <div>
                <Label htmlFor="admin-note">Admin Note (Optional)</Label>
                <Textarea
                  id="admin-note"
                  placeholder="Add any notes about this verification..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                />
              </div>
              
              <DialogFooter className="flex gap-2">
                <Button 
                  onClick={() => setEditingDeposit(null)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (!actualAmount) {
                      toast({ 
                        title: "Amount Required", 
                        description: "Please enter the verified amount", 
                        variant: "destructive" 
                      });
                      return;
                    }
                    approveDepositMutation.mutate({
                      id: editingDeposit.id,
                      actualAmount,
                      adminNote
                    });
                  }}
                  disabled={!actualAmount || approveDepositMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve with ${actualAmount || '0.00'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Withdrawal Processing Dialog */}
      <Dialog open={!!editingWithdrawal} onOpenChange={() => setEditingWithdrawal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Process Withdrawal</DialogTitle>
            <DialogDescription>
              Enter the transaction hash after sending the withdrawal.
            </DialogDescription>
          </DialogHeader>
          {editingWithdrawal && (
            <div className="space-y-4">
              <div className="bg-muted rounded p-3">
                <Label>Withdrawal Amount</Label>
                <p className="text-2xl font-bold">
                  {parseFloat(editingWithdrawal.amount).toFixed(2)} USDT
                </p>
              </div>
              
              <div>
                <Label>Withdrawal Address</Label>
                <Input value={editingWithdrawal.address} readOnly className="font-mono text-xs" />
              </div>
              
              <div>
                <Label htmlFor="tx-hash">Transaction Hash (Optional)</Label>
                <Input
                  id="tx-hash"
                  placeholder="Enter transaction hash after sending..."
                  value={txHashInput}
                  onChange={(e) => setTxHashInput(e.target.value)}
                  className="font-mono"
                />
              </div>
              
              <DialogFooter className="flex gap-2">
                <Button 
                  onClick={() => setEditingWithdrawal(null)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    approveWithdrawalMutation.mutate({
                      id: editingWithdrawal.id,
                      txHash: txHashInput
                    });
                  }}
                  disabled={approveWithdrawalMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve Withdrawal
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Balance Edit Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Balances</DialogTitle>
            <DialogDescription>
              Manually adjust user balances. Use with caution.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label>Username</Label>
                <Input value={selectedUser.username} readOnly />
              </div>
              
              <div>
                <Label htmlFor="usdt-balance">USDT Balance</Label>
                <Input
                  id="usdt-balance"
                  type="number"
                  value={userBalanceEdit.usdt}
                  onChange={(e) => setUserBalanceEdit({ ...userBalanceEdit, usdt: e.target.value })}
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div>
                <Label htmlFor="gbtc-balance">GBTC Balance</Label>
                <Input
                  id="gbtc-balance"
                  type="number"
                  value={userBalanceEdit.gbtc}
                  onChange={(e) => setUserBalanceEdit({ ...userBalanceEdit, gbtc: e.target.value })}
                  step="0.0001"
                  min="0"
                />
              </div>
              
              <div>
                <Label htmlFor="hash-power">Hash Power (TH/s)</Label>
                <Input
                  id="hash-power"
                  type="number"
                  value={userBalanceEdit.hashPower}
                  onChange={(e) => setUserBalanceEdit({ ...userBalanceEdit, hashPower: e.target.value })}
                  step="1"
                  min="0"
                />
              </div>
              
              <DialogFooter className="flex gap-2">
                <Button 
                  onClick={() => setSelectedUser(null)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    updateUserBalanceMutation.mutate({
                      userId: selectedUser.id,
                      balances: {
                        usdtBalance: userBalanceEdit.usdt,
                        gbtcBalance: userBalanceEdit.gbtc,
                        hashPower: userBalanceEdit.hashPower
                      }
                    });
                  }}
                  disabled={updateUserBalanceMutation.isPending}
                >
                  Update Balances
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}