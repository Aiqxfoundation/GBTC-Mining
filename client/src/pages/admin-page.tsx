import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import bitcoinLogo from "@assets/file_00000000221c61fab63936953b889556_1756633909848.png";

export default function AdminPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

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

  const { data: blockRewardSetting } = useQuery({
    queryKey: ["/api/settings/blockReward"],
    enabled: !!user?.isAdmin
  });

  const approveDepositMutation = useMutation({
    mutationFn: async ({ id, adminNote }: { id: string; adminNote?: string }) => {
      const res = await apiRequest("PATCH", `/api/deposits/${id}/approve`, { adminNote });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Deposit approved", description: "The deposit has been approved successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/deposits/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
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
        description: "The user account has been frozen due to suspicious activity.",
        variant: "destructive" 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/deposits/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
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
        description: "The user account has been unfrozen and can now operate normally." 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to unfreeze user", description: error.message, variant: "destructive" });
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
    },
    onError: (error: Error) => {
      toast({ title: "Rejection failed", description: error.message, variant: "destructive" });
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
            <i className="fas fa-shield-alt text-destructive text-4xl mb-4"></i>
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
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <img src={bitcoinLogo} alt="GBTC" className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">Green Bitcoin</h1>
                <p className="text-xs text-muted-foreground">GBTC Admin Panel</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-foreground hover:text-primary transition-colors">
                <i className="fas fa-home mr-2"></i>Home
              </Link>
              <Link href="/dashboard" className="text-foreground hover:text-primary transition-colors">
                <i className="fas fa-tachometer-alt mr-2"></i>Dashboard
              </Link>
              <button className="text-primary transition-colors">
                <i className="fas fa-cog mr-2"></i>Admin
              </button>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <i className="fas fa-shield-alt text-destructive mr-3"></i>
            Admin Panel
          </h1>
          <p className="text-muted-foreground">Manage users, deposits, and system settings</p>
        </div>
        
        {/* Admin Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold" data-testid="text-total-users">
                    {adminStats?.userCount || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-chart-4/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-users text-chart-4"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Deposits</p>
                  <p className="text-2xl font-bold text-accent" data-testid="text-total-deposits">
                    ${parseFloat(adminStats?.totalDeposits || "0").toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-arrow-down text-accent"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Withdrawals</p>
                  <p className="text-2xl font-bold text-destructive" data-testid="text-total-withdrawals">
                    {parseFloat(adminStats?.totalWithdrawals || "0").toFixed(4)} GBTC
                  </p>
                </div>
                <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-arrow-up text-destructive"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Global Hash Power</p>
                  <p className="text-2xl font-bold text-primary" data-testid="text-global-hash-power">
                    {parseFloat(adminStats?.totalHashPower || "0").toFixed(2)} TH/s
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-microchip text-primary"></i>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Pending Deposits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-clock text-accent mr-3"></i>
                Pending Deposits
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
                    <div key={deposit.id} className="bg-background p-4 rounded-lg border border-border">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold" data-testid={`text-deposit-user-${deposit.id}`}>
                            {deposit.user.username}
                          </p>
                          <p className="text-sm text-muted-foreground code-font break-all" data-testid={`text-deposit-hash-${deposit.id}`}>
                            {deposit.txHash}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Network: {deposit.network}
                          </p>
                        </div>
                        <span className="bg-accent/20 text-accent px-2 py-1 rounded text-xs font-medium">
                          Pending
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold" data-testid={`text-deposit-amount-${deposit.id}`}>
                          ${parseFloat(deposit.amount).toFixed(2)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => approveDepositMutation.mutate({ id: deposit.id })}
                            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                            disabled={approveDepositMutation.isPending}
                            data-testid={`button-approve-${deposit.id}`}
                          >
                            {approveDepositMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            ) : (
                              <i className="fas fa-check mr-1"></i>
                            )}
                            Approve
                          </Button>
                          <Button 
                            onClick={() => rejectDepositMutation.mutate({ id: deposit.id })}
                            variant="destructive"
                            className="flex-1"
                            disabled={rejectDepositMutation.isPending}
                            data-testid={`button-reject-${deposit.id}`}
                          >
                            {rejectDepositMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            ) : (
                              <i className="fas fa-times mr-1"></i>
                            )}
                            Reject
                          </Button>
                        </div>
                        <Button 
                          onClick={() => freezeUserMutation.mutate(deposit.userId)}
                          variant="outline"
                          className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          disabled={freezeUserMutation.isPending}
                          data-testid={`button-freeze-${deposit.id}`}
                        >
                          {freezeUserMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <i className="fas fa-ban mr-2"></i>
                          )}
                          Freeze User (Suspicious Activity)
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
          
          {/* System Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-cogs text-primary mr-3"></i>
                System Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Block Reward Control */}
                <div className="bg-background p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Block Reward Management</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-muted-foreground">Current Reward:</span>
                    <span className="font-semibold text-primary" data-testid="text-current-reward">
                      {blockRewardSetting?.value || "6.25"} GBTC
                    </span>
                  </div>
                  <Button 
                    onClick={() => halveRewardMutation.mutate()}
                    variant="destructive"
                    className="w-full"
                    disabled={halveRewardMutation.isPending}
                    data-testid="button-halve-reward"
                  >
                    {halveRewardMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <i className="fas fa-cut mr-2"></i>
                    )}
                    Execute Halving
                  </Button>
                </div>
                
                {/* User Management */}
                <div className="bg-background p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">User Management</h3>
                  <div className="space-y-2">
                    <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 justify-start">
                      <i className="fas fa-ban mr-2"></i>
                      Freeze Account
                    </Button>
                    <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 justify-start">
                      <i className="fas fa-unlock mr-2"></i>
                      Unfreeze Account
                    </Button>
                    <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 justify-start">
                      <i className="fas fa-trash mr-2"></i>
                      Delete Account
                    </Button>
                  </div>
                </div>
                
                {/* Mining Controls */}
                <div className="bg-background p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Mining Controls</h3>
                  <div className="space-y-2">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      <i className="fas fa-play mr-2"></i>
                      Start Mining Simulation
                    </Button>
                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      <i className="fas fa-pause mr-2"></i>
                      Pause Mining
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Withdrawals Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-money-bill-transfer text-destructive mr-3"></i>
              Pending Withdrawals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {withdrawalsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : pendingWithdrawals && pendingWithdrawals.length > 0 ? (
              <div className="grid lg:grid-cols-2 gap-4">
                {pendingWithdrawals.map((withdrawal: any) => (
                  <div key={withdrawal.id} className="bg-background p-4 rounded-lg border border-border">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold" data-testid={`text-withdrawal-user-${withdrawal.id}`}>
                            {withdrawal.user?.username}
                          </p>
                          <span className="bg-destructive/20 text-destructive px-2 py-0.5 rounded text-xs font-medium">
                            {withdrawal.network === 'GBTC' ? 'GBTC' : 'USDT'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Network: {withdrawal.network}
                        </p>
                        <p className="text-xs text-muted-foreground code-font break-all mt-1">
                          Address: {withdrawal.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-semibold text-lg" data-testid={`text-withdrawal-amount-${withdrawal.id}`}>
                        {parseFloat(withdrawal.amount).toFixed(
                          withdrawal.network === 'GBTC' ? 8 : 2
                        )} {withdrawal.network === 'GBTC' ? 'GBTC' : 'USDT'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2 text-xs">
                      <span className="text-muted-foreground">Available Balance:</span>
                      <span className="font-mono">
                        {withdrawal.network === 'GBTC' 
                          ? `${parseFloat(withdrawal.user?.gbtcBalance || '0').toFixed(8)} GBTC`
                          : `${parseFloat(withdrawal.user?.usdtBalance || '0').toFixed(2)} USDT`}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => approveWithdrawalMutation.mutate({ id: withdrawal.id })}
                          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                          disabled={approveWithdrawalMutation.isPending}
                          data-testid={`button-approve-withdrawal-${withdrawal.id}`}
                        >
                          {approveWithdrawalMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          ) : (
                            <i className="fas fa-check mr-1"></i>
                          )}
                          Approve
                        </Button>
                        <Button 
                          onClick={() => rejectWithdrawalMutation.mutate(withdrawal.id)}
                          variant="destructive"
                          className="flex-1"
                          disabled={rejectWithdrawalMutation.isPending}
                          data-testid={`button-reject-withdrawal-${withdrawal.id}`}
                        >
                          {rejectWithdrawalMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          ) : (
                            <i className="fas fa-times mr-1"></i>
                          )}
                          Reject
                        </Button>
                      </div>
                      <Button 
                        onClick={() => freezeUserMutation.mutate(withdrawal.userId)}
                        variant="outline"
                        className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        disabled={freezeUserMutation.isPending}
                        data-testid={`button-freeze-withdrawal-${withdrawal.id}`}
                      >
                        {freezeUserMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <i className="fas fa-ban mr-2"></i>
                        )}
                        Freeze User
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
      </div>
    </div>
  );
}
