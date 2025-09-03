import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Check, Shield, Users, Settings, DollarSign, Activity, ArrowDown, ArrowUp, User, Ban, CheckCircle, XCircle, Wallet, Hash, Edit2, AlertCircle, TrendingUp } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiEthereum } from "react-icons/si";

export default function AdminPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [editingDeposit, setEditingDeposit] = useState<any>(null);
  const [editingWithdrawal, setEditingWithdrawal] = useState<any>(null);
  const [actualAmount, setActualAmount] = useState("");
  const [txHashInput, setTxHashInput] = useState("");
  const [blockRewardInput, setBlockRewardInput] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userBalanceEdit, setUserBalanceEdit] = useState({ usdt: "", eth: "", gbtc: "", hashPower: "" });
  const [usdtAddress, setUsdtAddress] = useState("");
  const [ethAddress, setEthAddress] = useState("");
  const [addressEditMode, setAddressEditMode] = useState<'usdt' | 'eth' | null>(null);
  
  const handleCopyHash = (hash: string, depositId: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(depositId);
    setTimeout(() => setCopiedHash(null), 500);
    toast({ title: "Copied!", description: "Transaction hash copied to clipboard" });
  };
  
  const handleCopyAddress = (address: string, withdrawalId: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(withdrawalId);
    setTimeout(() => setCopiedAddress(null), 500);
    toast({ title: "Copied!", description: "Withdrawal address copied to clipboard" });
  };

  const { data: pendingDeposits = [], isLoading: depositsLoading } = useQuery<any[]>({
    queryKey: ["/api/deposits/pending"],
    enabled: !!user?.isAdmin
  });

  const { data: pendingWithdrawals = [], isLoading: withdrawalsLoading } = useQuery<any[]>({
    queryKey: ["/api/withdrawals/pending"],
    enabled: !!user?.isAdmin
  });

  const { data: adminStats = { userCount: 0, totalDeposits: "0", totalWithdrawals: "0", totalHashPower: "0" } } = useQuery<{
    userCount: number;
    totalDeposits: string;
    totalWithdrawals: string;
    totalHashPower: string;
  }>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin
  });

  const { data: allUsers = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin
  });

  const { data: blockRewardSetting = { value: "50" } } = useQuery<{ value: string }>({
    queryKey: ["/api/settings/blockReward"],
    enabled: !!user?.isAdmin
  });

  const { data: globalAddresses = { usdt: '', eth: '' } } = useQuery<{ usdt: string; eth: string }>({
    queryKey: ["/api/admin/deposit-addresses"],
    enabled: !!user?.isAdmin
  });

  // Separate deposits by currency
  const usdtDeposits = pendingDeposits.filter(d => d.currency === 'USDT');
  const ethDeposits = pendingDeposits.filter(d => d.currency === 'ETH');
  
  // Separate withdrawals by currency
  const usdtWithdrawals = pendingWithdrawals.filter(w => w.currency === 'USDT');
  const ethWithdrawals = pendingWithdrawals.filter(w => w.currency === 'ETH');
  const gbtcWithdrawals = pendingWithdrawals.filter(w => w.currency === 'GBTC');

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
        description: "The user account has been frozen. They cannot perform any operations.",
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
        description: "The user account has been unfrozen and can now perform operations." 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to unfreeze user", description: error.message, variant: "destructive" });
    }
  });

  const banUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}/ban`);
      return res.json();
    },
    onSuccess: () => {
      toast({ 
        title: "User Banned", 
        description: "The user has been permanently banned. All functions are disabled.",
        variant: "destructive" 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to ban user", description: error.message, variant: "destructive" });
    }
  });

  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}/unban`);
      return res.json();
    },
    onSuccess: () => {
      toast({ 
        title: "User Unbanned", 
        description: "The user ban has been lifted." 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to unban user", description: error.message, variant: "destructive" });
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
      setUserBalanceEdit({ usdt: "", eth: "", gbtc: "", hashPower: "" });
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

  const updateGlobalAddressMutation = useMutation({
    mutationFn: async ({ currency, address }: { currency: 'USDT' | 'ETH'; address: string }) => {
      const res = await apiRequest("POST", "/api/admin/deposit-address", { currency, address });
      return res.json();
    },
    onSuccess: (_, variables) => {
      toast({ 
        title: "Address Updated", 
        description: `Global ${variables.currency} deposit address has been updated for all users.` 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposit-addresses"] });
      setAddressEditMode(null);
      setUsdtAddress("");
      setEthAddress("");
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                ADMIN CONTROL CENTER
              </h1>
            </div>
            <Button
              onClick={() => logoutMutation.mutate()}
              variant="destructive"
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{adminStats?.userCount || 0}</p>
                </div>
                <Users className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-500/50 bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Deposits</p>
                  <p className="text-2xl font-bold text-green-500">
                    ${parseFloat(adminStats?.totalDeposits || "0").toFixed(0)}
                  </p>
                </div>
                <ArrowDown className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-red-500/50 bg-gradient-to-br from-red-500/10 to-red-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Withdrawals</p>
                  <p className="text-2xl font-bold text-red-500">
                    ${parseFloat(adminStats?.totalWithdrawals || "0").toFixed(0)}
                  </p>
                </div>
                <ArrowUp className="w-8 h-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-500/50 bg-gradient-to-br from-orange-500/10 to-orange-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Hash Power</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {parseFloat(adminStats?.totalHashPower || "0").toFixed(0)} TH/s
                  </p>
                </div>
                <Activity className="w-8 h-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* USDT Deposits Management */}
          <Card className="border-green-500/30">
            <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-500/5">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                USDT Deposits
                {usdtDeposits.length > 0 && (
                  <Badge className="ml-auto bg-green-500">{usdtDeposits.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>Manage pending USDT deposit requests</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-[400px] pr-4">
                {depositsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : usdtDeposits.length > 0 ? (
                  <div className="space-y-3">
                    {usdtDeposits.map((deposit: any) => (
                      <div key={deposit.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{deposit.user.username}</p>
                            <p className="text-xs text-muted-foreground">{deposit.network}</p>
                          </div>
                          <Badge variant="outline" className="bg-yellow-500/10">
                            ${parseFloat(deposit.amount).toFixed(2)}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => {
                              setEditingDeposit(deposit);
                              setActualAmount("");
                            }}
                            size="sm"
                            className="flex-1 bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verify
                          </Button>
                          <Button 
                            onClick={() => rejectDepositMutation.mutate({ id: deposit.id })}
                            variant="destructive"
                            size="sm"
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No pending USDT deposits</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* ETH Deposits Management */}
          <Card className="border-blue-500/30">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-500/5">
              <CardTitle className="flex items-center gap-2">
                <SiEthereum className="w-5 h-5 text-blue-500" />
                ETH Deposits
                {ethDeposits.length > 0 && (
                  <Badge className="ml-auto bg-blue-500">{ethDeposits.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>Manage pending ETH deposit requests</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-[400px] pr-4">
                {depositsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : ethDeposits.length > 0 ? (
                  <div className="space-y-3">
                    {ethDeposits.map((deposit: any) => (
                      <div key={deposit.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{deposit.user.username}</p>
                            <p className="text-xs text-muted-foreground">ETH Network</p>
                          </div>
                          <Badge variant="outline" className="bg-blue-500/10">
                            {parseFloat(deposit.amount).toFixed(8)} ETH
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => {
                              setEditingDeposit(deposit);
                              setActualAmount("");
                            }}
                            size="sm"
                            className="flex-1 bg-blue-500 hover:bg-blue-600"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verify
                          </Button>
                          <Button 
                            onClick={() => rejectDepositMutation.mutate({ id: deposit.id })}
                            variant="destructive"
                            size="sm"
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <SiEthereum className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No pending ETH deposits</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Withdrawals Management */}
          <Card className="border-red-500/30">
            <CardHeader className="bg-gradient-to-r from-red-500/10 to-red-500/5">
              <CardTitle className="flex items-center gap-2">
                <ArrowUp className="w-5 h-5 text-red-500" />
                All Withdrawals
                {pendingWithdrawals.length > 0 && (
                  <Badge className="ml-auto bg-red-500">{pendingWithdrawals.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>Process withdrawal requests</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-[400px] pr-4">
                {withdrawalsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : pendingWithdrawals.length > 0 ? (
                  <div className="space-y-3">
                    {pendingWithdrawals.map((withdrawal: any) => (
                      <div key={withdrawal.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{withdrawal.user?.username}</p>
                            <p className="text-xs text-muted-foreground">{withdrawal.network}</p>
                          </div>
                          <Badge variant="outline" className="bg-red-500/10">
                            {withdrawal.currency === 'ETH' ? 
                              `${parseFloat(withdrawal.amount).toFixed(8)} ETH` :
                              withdrawal.currency === 'GBTC' ?
                              `${parseFloat(withdrawal.amount).toFixed(8)} GBTC` :
                              `${parseFloat(withdrawal.amount).toFixed(2)} USDT`
                            }
                          </Badge>
                        </div>
                        <div className="text-xs bg-muted p-2 rounded break-all">
                          {withdrawal.address}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => {
                              setEditingWithdrawal(withdrawal);
                              setTxHashInput("");
                            }}
                            size="sm"
                            className="flex-1 bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Process
                          </Button>
                          <Button 
                            onClick={() => rejectWithdrawalMutation.mutate(withdrawal.id)}
                            variant="destructive"
                            size="sm"
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ArrowUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No pending withdrawals</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Users Management */}
          <Card className="border-purple-500/30">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-purple-500/5">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                Users Management
              </CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {allUsers.map((u: any) => (
                    <div key={u.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{u.username}</p>
                            {u.isAdmin && <Badge className="bg-purple-500">Admin</Badge>}
                            {u.isFrozen && <Badge variant="outline" className="text-yellow-500 border-yellow-500">Frozen</Badge>}
                            {u.isBanned && <Badge variant="destructive">Banned</Badge>}
                          </div>
                          <div className="grid grid-cols-2 gap-1 mt-1 text-xs">
                            <span>USDT: ${parseFloat(u.usdtBalance || "0").toFixed(2)}</span>
                            <span>ETH: {parseFloat(u.ethBalance || "0").toFixed(4)}</span>
                            <span>GBTC: {parseFloat(u.gbtcBalance || "0").toFixed(4)}</span>
                            <span>Hash: {parseFloat(u.hashPower || "0").toFixed(2)} TH/s</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => {
                            setSelectedUser(u);
                            setUserBalanceEdit({
                              usdt: u.usdtBalance || "",
                              eth: u.ethBalance || "",
                              gbtc: u.gbtcBalance || "",
                              hashPower: u.hashPower || ""
                            });
                          }}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        {!u.isBanned ? (
                          <>
                            {u.isFrozen ? (
                              <Button
                                onClick={() => unfreezeUserMutation.mutate(u.id)}
                                size="sm"
                                variant="outline"
                                className="flex-1 text-green-500 border-green-500"
                              >
                                Unfreeze
                              </Button>
                            ) : (
                              <Button
                                onClick={() => freezeUserMutation.mutate(u.id)}
                                size="sm"
                                variant="outline"
                                className="flex-1 text-yellow-500 border-yellow-500"
                              >
                                Freeze
                              </Button>
                            )}
                            <Button
                              onClick={() => banUserMutation.mutate(u.id)}
                              size="sm"
                              variant="destructive"
                              className="flex-1"
                            >
                              <Ban className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => unbanUserMutation.mutate(u.id)}
                            size="sm"
                            variant="outline"
                            className="flex-1 text-green-500 border-green-500"
                          >
                            Unban
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Mining Management */}
          <Card className="border-orange-500/30">
            <CardHeader className="bg-gradient-to-r from-orange-500/10 to-orange-500/5">
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-orange-500" />
                Mining Management
              </CardTitle>
              <CardDescription>Control mining rewards and halving</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-semibold">Current Block Reward</span>
                  <Badge className="bg-orange-500 text-lg px-3 py-1">
                    {parseFloat(blockRewardSetting?.value || "50").toFixed(2)} GBTC
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Set Custom Reward</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="number"
                        placeholder="Enter new reward"
                        value={blockRewardInput}
                        onChange={(e) => setBlockRewardInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => {
                          if (blockRewardInput) {
                            updateBlockRewardMutation.mutate(blockRewardInput);
                          }
                        }}
                        size="sm"
                        disabled={!blockRewardInput || updateBlockRewardMutation.isPending}
                      >
                        {updateBlockRewardMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Update"
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold">Execute Halving</p>
                        <p className="text-xs text-muted-foreground">
                          Reduce block reward by 50%
                        </p>
                      </div>
                      <Button
                        onClick={() => halveRewardMutation.mutate()}
                        variant="destructive"
                        disabled={halveRewardMutation.isPending}
                      >
                        {halveRewardMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <TrendingUp className="w-4 h-4 mr-2" />
                        )}
                        Execute Halving
                      </Button>
                    </div>
                    <div className="bg-destructive/10 border border-destructive/30 rounded p-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive" />
                        <p className="text-xs text-destructive">
                          Warning: This will permanently halve mining rewards
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Global Deposit Addresses */}
          <Card className="border-blue-500/30">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-500/5">
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-500" />
                Global Deposit Addresses
              </CardTitle>
              <CardDescription>Update deposit addresses for all users</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-3">
                {/* USDT Address */}
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-semibold">USDT Deposit Address</Label>
                    <Button
                      onClick={() => setAddressEditMode(addressEditMode === 'usdt' ? null : 'usdt')}
                      size="sm"
                      variant="ghost"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                  </div>
                  {addressEditMode === 'usdt' ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Enter new USDT address"
                        value={usdtAddress}
                        onChange={(e) => setUsdtAddress(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            if (usdtAddress) {
                              updateGlobalAddressMutation.mutate({ 
                                currency: 'USDT', 
                                address: usdtAddress 
                              });
                            }
                          }}
                          size="sm"
                          className="flex-1"
                          disabled={!usdtAddress || updateGlobalAddressMutation.isPending}
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => {
                            setAddressEditMode(null);
                            setUsdtAddress("");
                          }}
                          size="sm"
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <code className="text-xs bg-background p-2 rounded block break-all">
                      {globalAddresses?.usdt || 'TBGxYmP3tFrbKvJRvQcF9cENKixQeJdfQc'}
                    </code>
                  )}
                </div>

                {/* ETH Address */}
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-semibold">ETH Deposit Address</Label>
                    <Button
                      onClick={() => setAddressEditMode(addressEditMode === 'eth' ? null : 'eth')}
                      size="sm"
                      variant="ghost"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                  </div>
                  {addressEditMode === 'eth' ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Enter new ETH address"
                        value={ethAddress}
                        onChange={(e) => setEthAddress(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            if (ethAddress) {
                              updateGlobalAddressMutation.mutate({ 
                                currency: 'ETH', 
                                address: ethAddress 
                              });
                            }
                          }}
                          size="sm"
                          className="flex-1"
                          disabled={!ethAddress || updateGlobalAddressMutation.isPending}
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => {
                            setAddressEditMode(null);
                            setEthAddress("");
                          }}
                          size="sm"
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <code className="text-xs bg-background p-2 rounded block break-all">
                      {globalAddresses?.eth || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'}
                    </code>
                  )}
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <div className="text-xs text-yellow-500">
                    <p className="font-semibold mb-1">Important:</p>
                    <p>Changing deposit addresses will affect all users immediately. Make sure the new addresses are correct before updating.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Deposit Verification Dialog */}
      <Dialog open={!!editingDeposit} onOpenChange={() => setEditingDeposit(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Deposit</DialogTitle>
            <DialogDescription>
              Review and verify the deposit amount
            </DialogDescription>
          </DialogHeader>
          {editingDeposit && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">User:</span>
                  <span className="font-semibold">{editingDeposit.user?.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Network:</span>
                  <span>{editingDeposit.network}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Claimed Amount:</span>
                  <span className="font-bold text-destructive">
                    {editingDeposit.currency === 'ETH' ? 
                      `${parseFloat(editingDeposit.amount).toFixed(8)} ETH` : 
                      `$${parseFloat(editingDeposit.amount).toFixed(2)}`
                    }
                  </span>
                </div>
              </div>
              
              <div>
                <Label>Transaction Hash</Label>
                <div className="bg-muted p-2 rounded text-xs font-mono break-all">
                  {editingDeposit.txHash}
                </div>
              </div>
              
              <div>
                <Label>Verified Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={editingDeposit.currency === 'ETH' ? "Enter verified ETH amount" : "Enter verified amount in USD"}
                  value={actualAmount}
                  onChange={(e) => setActualAmount(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the actual amount confirmed on blockchain
                </p>
              </div>
              
              <DialogFooter>
                <Button
                  onClick={() => setEditingDeposit(null)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (actualAmount) {
                      approveDepositMutation.mutate({ 
                        id: editingDeposit.id, 
                        actualAmount 
                      });
                    }
                  }}
                  disabled={!actualAmount || approveDepositMutation.isPending}
                >
                  {approveDepositMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Approve Deposit
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Withdrawal Processing Dialog */}
      <Dialog open={!!editingWithdrawal} onOpenChange={() => setEditingWithdrawal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Withdrawal</DialogTitle>
            <DialogDescription>
              Complete the withdrawal transaction
            </DialogDescription>
          </DialogHeader>
          {editingWithdrawal && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">User:</span>
                  <span className="font-semibold">{editingWithdrawal.user?.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Network:</span>
                  <span>{editingWithdrawal.network}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="font-bold">
                    {editingWithdrawal.currency === 'ETH' ? 
                      `${parseFloat(editingWithdrawal.amount).toFixed(8)} ETH` :
                      editingWithdrawal.currency === 'GBTC' ?
                      `${parseFloat(editingWithdrawal.amount).toFixed(8)} GBTC` :
                      `${parseFloat(editingWithdrawal.amount).toFixed(2)} USDT`
                    }
                  </span>
                </div>
              </div>
              
              <div>
                <Label>Destination Address</Label>
                <div className="bg-muted p-2 rounded text-xs font-mono break-all">
                  {editingWithdrawal.address}
                </div>
              </div>
              
              <div>
                <Label>Transaction Hash (Optional)</Label>
                <Input
                  placeholder="Enter blockchain transaction hash"
                  value={txHashInput}
                  onChange={(e) => setTxHashInput(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the transaction hash after sending funds
                </p>
              </div>
              
              <DialogFooter>
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
                      txHash: txHashInput || undefined
                    });
                  }}
                  disabled={approveWithdrawalMutation.isPending}
                >
                  {approveWithdrawalMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Complete Withdrawal
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Balance Edit Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Balances</DialogTitle>
            <DialogDescription>
              Update {selectedUser?.username}'s account balances
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label>USDT Balance</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={userBalanceEdit.usdt}
                  onChange={(e) => setUserBalanceEdit(prev => ({ ...prev, usdt: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>ETH Balance</Label>
                <Input
                  type="number"
                  step="0.00000001"
                  value={userBalanceEdit.eth}
                  onChange={(e) => setUserBalanceEdit(prev => ({ ...prev, eth: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>GBTC Balance</Label>
                <Input
                  type="number"
                  step="0.00000001"
                  value={userBalanceEdit.gbtc}
                  onChange={(e) => setUserBalanceEdit(prev => ({ ...prev, gbtc: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Hash Power (TH/s)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={userBalanceEdit.hashPower}
                  onChange={(e) => setUserBalanceEdit(prev => ({ ...prev, hashPower: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <DialogFooter>
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
                        ethBalance: userBalanceEdit.eth,
                        gbtcBalance: userBalanceEdit.gbtc,
                        hashPower: userBalanceEdit.hashPower
                      }
                    });
                  }}
                  disabled={updateUserBalanceMutation.isPending}
                >
                  {updateUserBalanceMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
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