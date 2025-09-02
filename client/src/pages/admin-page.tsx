import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Check, Edit, Shield, Users, Settings, DollarSign, Activity, ArrowDown, ArrowUp, User, Ban } from "lucide-react";
import { Link } from "wouter";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export default function AdminPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<'overview' | 'deposits' | 'withdrawals' | 'users' | 'system'>('overview');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [editingDeposit, setEditingDeposit] = useState<any>(null);
  const [editingWithdrawal, setEditingWithdrawal] = useState<any>(null);
  const [actualAmount, setActualAmount] = useState("");
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
    mutationFn: async ({ id, actualAmount }: { id: string; actualAmount: string }) => {
      const res = await apiRequest("PATCH", `/api/deposits/${id}/approve`, { actualAmount });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Deposit approved", description: "The deposit has been approved with verified amount." });
      queryClient.invalidateQueries({ queryKey: ["/api/deposits/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setEditingDeposit(null);
      setActualAmount("");
    },
    onError: (error: Error) => {
      toast({ title: "Approval failed", description: error.message, variant: "destructive" });
    }
  });

  const rejectDepositMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const res = await apiRequest("PATCH", `/api/deposits/${id}/reject`, {});
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Deposit rejected", description: "The deposit has been rejected." });
      queryClient.invalidateQueries({ queryKey: ["/api/deposits/pending"] });
      setEditingDeposit(null);
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
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
      const currentReward = blockRewardSetting?.value ? parseFloat(blockRewardSetting.value) : 50;
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
    <div className="mobile-page">
      {/* Header */}
      <div className="mobile-header">
        <h1 className="text-lg font-display font-bold text-primary">ADMIN PANEL</h1>
        <Button
          onClick={() => logoutMutation.mutate()}
          size="sm"
          variant="destructive"
          data-testid="button-logout"
        >
          Logout
        </Button>
      </div>

      {/* Navigation */}
      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            onClick={() => setActiveSection('overview')}
            variant={activeSection === 'overview' ? 'default' : 'outline'}
            size="sm"
            className="whitespace-nowrap"
          >
            <Activity className="w-4 h-4 mr-1" />
            Overview
          </Button>
          <Button
            onClick={() => setActiveSection('deposits')}
            variant={activeSection === 'deposits' ? 'default' : 'outline'}
            size="sm"
            className="whitespace-nowrap"
          >
            <ArrowDown className="w-4 h-4 mr-1" />
            Deposits
            {pendingDeposits && pendingDeposits.length > 0 && (
              <Badge className="ml-1" variant="secondary">{pendingDeposits.length}</Badge>
            )}
          </Button>
          <Button
            onClick={() => setActiveSection('withdrawals')}
            variant={activeSection === 'withdrawals' ? 'default' : 'outline'}
            size="sm"
            className="whitespace-nowrap"
          >
            <ArrowUp className="w-4 h-4 mr-1" />
            Withdrawals
            {pendingWithdrawals && pendingWithdrawals.length > 0 && (
              <Badge className="ml-1" variant="secondary">{pendingWithdrawals.length}</Badge>
            )}
          </Button>
          <Button
            onClick={() => setActiveSection('users')}
            variant={activeSection === 'users' ? 'default' : 'outline'}
            size="sm"
            className="whitespace-nowrap"
          >
            <Users className="w-4 h-4 mr-1" />
            Users
          </Button>
          <Button
            onClick={() => setActiveSection('system')}
            variant={activeSection === 'system' ? 'default' : 'outline'}
            size="sm"
            className="whitespace-nowrap"
          >
            <Settings className="w-4 h-4 mr-1" />
            System
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="mobile-content">
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Card className="mobile-card p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Users</p>
                    <p className="text-xl font-bold">{adminStats?.userCount || 0}</p>
                  </div>
                  <Users className="w-6 h-6 text-chart-4" />
                </div>
              </Card>
              
              <Card className="mobile-card p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Deposits</p>
                    <p className="text-xl font-bold text-accent">
                      ${parseFloat(adminStats?.totalDeposits || "0").toFixed(0)}
                    </p>
                  </div>
                  <DollarSign className="w-6 h-6 text-accent" />
                </div>
              </Card>
              
              <Card className="mobile-card p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Withdrawals</p>
                    <p className="text-xl font-bold text-destructive">
                      ${parseFloat(adminStats?.totalWithdrawals || "0").toFixed(0)}
                    </p>
                  </div>
                  <ArrowUp className="w-6 h-6 text-destructive" />
                </div>
              </Card>

              <Card className="mobile-card p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Hash Purchased</p>
                    <p className="text-xl font-bold text-primary">
                      {parseFloat(adminStats?.totalHashPower || "0").toFixed(0)} TH/s
                    </p>
                  </div>
                  <Activity className="w-6 h-6 text-primary" />
                </div>
              </Card>
            </div>

            <Card className="mobile-card">
              <p className="text-sm font-mono text-muted-foreground mb-3">QUICK STATS</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Block Reward</span>
                  <span className="text-sm font-bold text-green-500">
                    {parseFloat(blockRewardSetting?.value || "50").toFixed(2)} GBTC
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pending Deposits</span>
                  <span className="text-sm font-bold text-yellow-500">
                    {pendingDeposits?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pending Withdrawals</span>
                  <span className="text-sm font-bold text-orange-500">
                    {pendingWithdrawals?.length || 0}
                  </span>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Deposits Section */}
        {activeSection === 'deposits' && (
          <Card className="mobile-card">
            <p className="text-sm font-mono text-muted-foreground mb-3">PENDING DEPOSITS</p>
            {depositsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : pendingDeposits && pendingDeposits.length > 0 ? (
              <div className="space-y-3">
                {pendingDeposits.map((deposit: any) => (
                  <div key={deposit.id} className="bg-muted/30 p-3 rounded-lg border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{deposit.user.username}</p>
                        <p className="text-xs text-muted-foreground">{deposit.network}</p>
                      </div>
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                        VERIFY
                      </Badge>
                    </div>
                    
                    <div className="bg-destructive/10 border border-destructive/30 rounded p-2 mb-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-destructive">Claimed:</span>
                        <span className="font-bold text-destructive">
                          ${parseFloat(deposit.amount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground mb-1">TX Hash:</p>
                      <div className="flex items-center gap-1">
                        <code className="flex-1 text-xs bg-background p-1 rounded truncate">
                          {deposit.txHash}
                        </code>
                        <Button
                          onClick={() => handleCopyHash(deposit.txHash, deposit.id)}
                          size="sm"
                          variant="ghost"
                        >
                          {copiedHash === deposit.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          setEditingDeposit(deposit);
                          setActualAmount("");
                        }}
                        size="sm"
                        className="flex-1"
                      >
                        Verify
                      </Button>
                      <Button 
                        onClick={() => rejectDepositMutation.mutate({ id: deposit.id })}
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                      >
                        Reject
                      </Button>
                      <Button 
                        onClick={() => freezeUserMutation.mutate(deposit.userId)}
                        variant="outline"
                        size="sm"
                        className="border-orange-500 text-orange-500"
                      >
                        <Ban className="w-4 h-4" />
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
          </Card>
        )}

        {/* Withdrawals Section */}
        {activeSection === 'withdrawals' && (
          <Card className="mobile-card">
            <p className="text-sm font-mono text-muted-foreground mb-3">PENDING WITHDRAWALS</p>
            {withdrawalsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : pendingWithdrawals && pendingWithdrawals.length > 0 ? (
              <div className="space-y-3">
                {pendingWithdrawals.map((withdrawal: any) => (
                  <div key={withdrawal.id} className="bg-muted/30 p-3 rounded-lg border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{withdrawal.user?.username}</p>
                        <p className="text-xs text-muted-foreground">{withdrawal.network}</p>
                      </div>
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                        PENDING
                      </Badge>
                    </div>
                    
                    <div className="bg-muted rounded p-2 mb-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs">Amount:</span>
                        <span className="font-bold">
                          {parseFloat(withdrawal.amount).toFixed(2)} USDT
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted-foreground">Balance:</span>
                        <span className="text-xs">
                          {parseFloat(withdrawal.user?.usdtBalance || '0').toFixed(2)} USDT
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground mb-1">Address:</p>
                      <div className="flex items-center gap-1">
                        <code className="flex-1 text-xs bg-background p-1 rounded truncate">
                          {withdrawal.address}
                        </code>
                        <Button
                          onClick={() => handleCopyAddress(withdrawal.address, withdrawal.id)}
                          size="sm"
                          variant="ghost"
                        >
                          {copiedAddress === withdrawal.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          setEditingWithdrawal(withdrawal);
                          setTxHashInput("");
                        }}
                        size="sm"
                        className="flex-1"
                      >
                        Process
                      </Button>
                      <Button 
                        onClick={() => rejectWithdrawalMutation.mutate(withdrawal.id)}
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                      >
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
          </Card>
        )}

        {/* Users Section */}
        {activeSection === 'users' && (
          <Card className="mobile-card">
            <p className="text-sm font-mono text-muted-foreground mb-3">USER MANAGEMENT</p>
            {allUsers && allUsers.length > 0 ? (
              <div className="space-y-2">
                {allUsers.map((u: any) => (
                  <div key={u.id} className="bg-muted/30 p-3 rounded-lg border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{u.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {u.referralCode || 'No code'}
                          </p>
                        </div>
                      </div>
                      {u.isFrozen ? (
                        <Badge variant="destructive" className="text-xs">
                          FROZEN
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-xs">
                          ACTIVE
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1 text-xs mb-2">
                      <div className="bg-background p-1 rounded text-center">
                        <p className="text-muted-foreground">USDT</p>
                        <p className="font-bold">${parseFloat(u.usdtBalance).toFixed(0)}</p>
                      </div>
                      <div className="bg-background p-1 rounded text-center">
                        <p className="text-muted-foreground">GBTC</p>
                        <p className="font-bold">{parseFloat(u.gbtcBalance).toFixed(2)}</p>
                      </div>
                      <div className="bg-background p-1 rounded text-center">
                        <p className="text-muted-foreground">TH/s</p>
                        <p className="font-bold">{parseFloat(u.hashPower).toFixed(0)}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      {u.isFrozen ? (
                        <Button 
                          onClick={() => unfreezeUserMutation.mutate(u.id)}
                          size="sm"
                          variant="outline"
                          className="flex-1 border-green-500 text-green-500"
                        >
                          Unfreeze
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => freezeUserMutation.mutate(u.id)}
                          size="sm"
                          variant="outline"
                          className="flex-1 border-destructive text-destructive"
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
                        className="flex-1"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
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
          </Card>
        )}

        {/* System Section */}
        {activeSection === 'system' && (
          <>
            <Card className="mobile-card">
              <p className="text-sm font-mono text-muted-foreground mb-3">BLOCK REWARD</p>
              <div className="bg-muted p-3 rounded-lg mb-3">
                <p className="text-xs text-muted-foreground mb-1">Current Reward</p>
                <p className="text-2xl font-bold text-green-500">
                  {parseFloat(blockRewardSetting?.value || "50").toFixed(4)} GBTC
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="New reward..."
                    value={blockRewardInput}
                    onChange={(e) => setBlockRewardInput(e.target.value)}
                    step="0.01"
                    min="0"
                  />
                  <Button 
                    onClick={() => blockRewardInput && updateBlockRewardMutation.mutate(blockRewardInput)}
                    disabled={!blockRewardInput || updateBlockRewardMutation.isPending}
                    size="sm"
                  >
                    Update
                  </Button>
                </div>
                <Button 
                  onClick={() => halveRewardMutation.mutate()}
                  variant="destructive"
                  className="w-full"
                  disabled={halveRewardMutation.isPending}
                >
                  <i className="fas fa-cut mr-2"></i>
                  Execute Halving
                </Button>
              </div>
            </Card>
            
            <Card className="mobile-card">
              <p className="text-sm font-mono text-muted-foreground mb-3">SYSTEM OPERATIONS</p>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  <i className="fas fa-sync mr-2"></i>
                  Force Block Generation
                </Button>
                <Button className="w-full" variant="outline">
                  <i className="fas fa-calculator mr-2"></i>
                  Recalculate Balances
                </Button>
                <Button className="w-full" variant="destructive">
                  <i className="fas fa-trash mr-2"></i>
                  Clear Pending Transactions
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Deposit Verification Dialog */}
      <Dialog open={!!editingDeposit} onOpenChange={() => setEditingDeposit(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Deposit Amount</DialogTitle>
            <DialogDescription>
              Verify the actual transaction amount before approving.
            </DialogDescription>
          </DialogHeader>
          {editingDeposit && (
            <div className="space-y-4">
              <div className="bg-destructive/10 border border-destructive/30 rounded p-3">
                <Label className="text-destructive">Claimed Amount</Label>
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
                  Verified Amount (USDT) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="actual-amount"
                  type="number"
                  placeholder="Enter verified amount"
                  value={actualAmount}
                  onChange={(e) => setActualAmount(e.target.value)}
                  step="0.01"
                  min="0"
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
                      actualAmount
                    });
                  }}
                  disabled={!actualAmount || approveDepositMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve ${actualAmount || '0.00'}
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
              Enter transaction hash after sending.
            </DialogDescription>
          </DialogHeader>
          {editingWithdrawal && (
            <div className="space-y-4">
              <div className="bg-muted rounded p-3">
                <Label>Amount</Label>
                <p className="text-2xl font-bold">
                  {parseFloat(editingWithdrawal.amount).toFixed(2)} USDT
                </p>
              </div>
              
              <div>
                <Label>Address</Label>
                <div className="flex items-center gap-2">
                  <Input value={editingWithdrawal.address} readOnly className="font-mono text-xs" />
                  <Button
                    onClick={() => handleCopyAddress(editingWithdrawal.address, editingWithdrawal.id)}
                    size="sm"
                    variant="outline"
                    type="button"
                  >
                    {copiedAddress === editingWithdrawal.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="tx-hash">Transaction Hash</Label>
                <Input
                  id="tx-hash"
                  placeholder="Optional..."
                  value={txHashInput}
                  onChange={(e) => setTxHashInput(e.target.value)}
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
                  Approve
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
              Manually adjust user balances.
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
                  Update
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}