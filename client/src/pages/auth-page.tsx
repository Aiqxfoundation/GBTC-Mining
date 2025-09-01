import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [loginForm, setLoginForm] = useState({ username: "", pin: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", pin: "", confirmPin: "", referrerUsername: "" });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/dashboard" />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username && loginForm.pin && loginForm.pin.length === 6) {
      loginMutation.mutate({ username: loginForm.username, password: loginForm.pin });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.username && registerForm.pin && registerForm.pin === registerForm.confirmPin && registerForm.pin.length === 6) {
      // @ts-ignore - referrerCode is handled on backend but not in type
      registerMutation.mutate({
        username: registerForm.username,
        password: registerForm.pin,
        referrerCode: registerForm.referrerUsername
      });
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-8">
          {/* Logo Section */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-primary to-chart-4 rounded-full flex items-center justify-center glow-orange">
                <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-gradient animate-pulse">₿</span>
                </div>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-3">
              <span className="inline-block animate-fade-in-up" style={{ animationDelay: '0.1s' }}>🌍</span>
              <span className="ml-2 bg-gradient-to-r from-primary via-accent to-chart-4 text-transparent bg-clip-text animate-gradient">
                Green Bitcoin (GBTC)
              </span>
            </h2>
            <p className="text-lg font-semibold text-foreground mb-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Empowering Miners
            </p>
            <div className="space-y-2 text-sm text-muted-foreground max-w-md mx-auto">
              <p className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                GBTC is an L1 blockchain with its own native gas currency.
              </p>
              <p className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                It fixes what Bitcoin left behind: accessibility, fair distribution, and real miner control.
              </p>
              <p className="animate-fade-in-up font-medium text-primary" style={{ animationDelay: '0.5s' }}>
                We empower miners through mobile-first mining, ensuring rewards go to individuals — not just corporations.
              </p>
            </div>
          </div>

          {/* Auth Tabs */}
          <Tabs defaultValue="register" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-secondary">
              <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-center text-gradient">Sign In</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-username">Username</Label>
                      <Input
                        id="login-username"
                        type="text"
                        placeholder="Enter your username"
                        value={loginForm.username}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                        required
                        className="bg-background border-primary/20"
                        data-testid="input-login-username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-pin">6-Digit PIN</Label>
                      <Input
                        id="login-pin"
                        type="password"
                        placeholder="Enter your 6-digit PIN"
                        value={loginForm.pin}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setLoginForm(prev => ({ ...prev, pin: value }));
                        }}
                        maxLength={6}
                        required
                        className="bg-background border-primary/20 text-center font-mono text-lg"
                        data-testid="input-login-pin"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full btn-primary"
                      disabled={loginMutation.isPending}
                      data-testid="button-login"
                    >
                      {loginMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <i className="fas fa-sign-in-alt mr-2"></i>
                      )}
                      Sign In
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-center text-gradient">Create Account</CardTitle>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Fair mining based on purchased hash power only
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20 mb-4">
                      <div className="flex items-start space-x-2">
                        <i className="fas fa-exclamation-triangle text-destructive mt-1"></i>
                        <div className="text-xs">
                          <strong className="text-destructive">⚠️ IMPORTANT SECURITY WARNING</strong>
                          <p className="text-muted-foreground mt-1">
                            If you forget your username or PIN, you will <strong>permanently lose access</strong> to your account.
                            There is <strong>NO recovery option</strong>. Write down your credentials and keep them safe!
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="register-username">Username</Label>
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="Choose a unique username"
                        value={registerForm.username}
                        onChange={(e) => {
                          const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
                          setRegisterForm(prev => ({ ...prev, username: value }));
                        }}
                        required
                        className="bg-background border-primary/20"
                        data-testid="input-register-username"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Only letters, numbers, and underscores allowed</p>
                    </div>
                    <div>
                      <Label htmlFor="register-pin">Create 6-Digit PIN</Label>
                      <Input
                        id="register-pin"
                        type="password"
                        placeholder="Create a 6-digit PIN"
                        value={registerForm.pin}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setRegisterForm(prev => ({ ...prev, pin: value }));
                        }}
                        maxLength={6}
                        required
                        className="bg-background border-primary/20 text-center font-mono text-lg"
                        data-testid="input-register-pin"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Must be exactly 6 digits</p>
                    </div>
                    <div>
                      <Label htmlFor="register-confirm-pin">Confirm 6-Digit PIN</Label>
                      <Input
                        id="register-confirm-pin"
                        type="password"
                        placeholder="Confirm your 6-digit PIN"
                        value={registerForm.confirmPin}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setRegisterForm(prev => ({ ...prev, confirmPin: value }));
                        }}
                        maxLength={6}
                        required
                        className="bg-background border-primary/20 text-center font-mono text-lg"
                        data-testid="input-register-confirm-pin"
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-referrer">Inviter's Username (Optional)</Label>
                      <Input
                        id="register-referrer"
                        type="text"
                        placeholder="Enter your inviter's username"
                        value={registerForm.referrerUsername}
                        onChange={(e) => {
                          const value = e.target.value.toLowerCase();
                          setRegisterForm(prev => ({ ...prev, referrerUsername: value }));
                        }}
                        className="bg-background border-primary/20"
                        data-testid="input-register-referrer"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full btn-primary"
                      disabled={registerMutation.isPending || registerForm.pin !== registerForm.confirmPin || registerForm.pin.length !== 6}
                      data-testid="button-register"
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <i className="fas fa-user-plus mr-2"></i>
                      )}
                      Create Account
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* FAQ Section */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-center text-gradient">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="what-is-gbtc">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-question-circle text-primary"></i>
                      <span>What is GBTC?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    GBTC (Green Bitcoin) is a decentralized token inspired by Bitcoin's scarcity model, with a total supply 
                    of 21 million tokens and a fair mining + hashrate-based distribution system. It features real USDT deposits, 
                    10-minute block times, and rewards based on your purchased hash power.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="how-to-start">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-rocket text-chart-4"></i>
                      <span>How can I start mining GBTC?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Sign up with your account</li>
                      <li>Deposit USDT into the project's main wallet</li>
                      <li>Purchase hash power (your mining strength)</li>
                      <li>Start mining automatically</li>
                      <li>Without a deposit, your hash power = 0 (no mining)</li>
                    </ol>
                    <p className="text-xs mt-2 text-warning">Note: You must claim rewards daily to stay active!</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="how-mining-works">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-coins text-accent"></i>
                      <span>How are tokens mined?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <div className="space-y-3">
                      <div>
                        <strong className="text-foreground">Mining Process:</strong>
                        <ul className="list-disc list-inside text-sm space-y-1 mt-1">
                          <li>Every 10 minutes = 1 block mined</li>
                          <li>Active miners share the block reward based on their hash power</li>
                          <li>Your share = (Your Hashrate ÷ Total Network Hashrate) × Block Reward</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                        <strong className="text-warning">⚠️ Daily Claiming Required:</strong>
                        <p className="text-sm mt-1">If you don't claim daily, your account is marked inactive. You won't receive rewards until you return active.</p>
                      </div>
                      <div>
                        <strong className="text-foreground">Supply Model:</strong>
                        <ul className="list-disc list-inside text-sm space-y-1 mt-1">
                          <li>Total supply = 21M GBTC</li>
                          <li>Supply gets harder as more miners join</li>
                          <li>Reward per block decreases over time</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="referral-system">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-users text-chart-3"></i>
                      <span>How does the referral system work?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <div className="space-y-3">
                      <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <strong className="text-primary">Direct Miners Commission System:</strong>
                        <p className="text-sm mt-2">When your direct miner purchases hash power:</p>
                        <ul className="list-disc list-inside text-sm space-y-1 mt-1">
                          <li><strong>USDT Commission:</strong> You earn 15% of their purchase amount</li>
                          <li><strong>Hash Power Bonus:</strong> You receive 5% of their hash power when they're active</li>
                        </ul>
                      </div>
                      <div>
                        <strong className="text-foreground">How it works:</strong>
                        <ol className="list-decimal list-inside text-sm space-y-1 mt-1">
                          <li>Your username is your referral code</li>
                          <li>Friends register using your username as inviter</li>
                          <li>When they buy $100 hashrate, you get $15 USDT instantly</li>
                          <li>Plus 5% of their hash power contributes to yours when active</li>
                        </ol>
                      </div>
                      <div className="p-3 bg-accent/10 rounded-lg">
                        <strong className="text-accent">Important:</strong>
                        <p className="text-sm mt-1">Only direct referrals count. No multi-level rewards. You can withdraw USDT commissions anytime!</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="withdrawals-transfers">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-exchange-alt text-chart-2"></i>
                      <span>Withdrawals & Transfers</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <div className="space-y-3">
                      <div>
                        <strong className="text-foreground">Can I withdraw mined tokens?</strong>
                        <p className="text-sm mt-1">No, mined tokens can only be transferred between existing users inside the system until 25% of total supply is mined. After that, GBTC becomes tradable on exchanges.</p>
                      </div>
                      <div>
                        <strong className="text-foreground">What can I withdraw now?</strong>
                        <p className="text-sm mt-1">You can only withdraw USDT earned through referral commissions.</p>
                      </div>
                      <div>
                        <strong className="text-foreground">Internal Transfers:</strong>
                        <p className="text-sm mt-1">Yes, you can transfer GBTC tokens to other users within the system (user-to-user transfer) until exchange listing.</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <strong className="text-primary">25% Milestone:</strong>
                        <p className="text-sm mt-1">At 25% mined, GBTC lists on exchanges. Mining continues long-term with decreasing rewards.</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="important-rules">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-exclamation-triangle text-warning"></i>
                      <span>Important Rules & Warnings</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <div className="space-y-3">
                      <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                        <strong className="text-destructive">⚠️ Fake Deposits:</strong>
                        <p className="text-sm mt-1">If you fake a deposit transaction, your account can be frozen or blocked permanently. Only real blockchain transactions are accepted.</p>
                      </div>
                      <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                        <strong className="text-warning">⚠️ 24-Hour Claiming Rule:</strong>
                        <p className="text-sm mt-1">If you don't claim your mined blocks within 24 hours, your mining will STOP. You must claim daily to keep mining active!</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <strong className="text-primary">Fair Mining Policy:</strong>
                        <p className="text-sm mt-1">Mining depends ONLY on your purchased hash power. Multiple accounts and bots gain NO advantage. Don't waste time creating fake accounts - only real hash power investment earns rewards!</p>
                      </div>
                      <div>
                        <strong className="text-foreground">System Controls:</strong>
                        <ul className="list-disc list-inside text-sm space-y-1 mt-1">
                          <li>Approve/Reject deposits</li>
                          <li>Approve/Reject withdrawals</li>
                          <li>Freeze/Unfreeze accounts if rules are broken</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-accent/10 rounded-lg">
                        <strong className="text-accent">Why is the system fair?</strong>
                        <ul className="list-disc list-inside text-sm space-y-1 mt-1">
                          <li>Rewards depend on real investment (hash power)</li>
                          <li>Inactive users don't get free tokens</li>
                          <li>Global supply calculator ensures transparent tokenomics</li>
                          <li>System cannot manipulate balances—only verify deposits/withdrawals</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="animate-scale-in" style={{ animationDelay: '0.6s' }}>
                  <div className="w-12 h-12 mx-auto mb-2 bg-primary/20 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <i className="fas fa-mobile-alt text-primary"></i>
                  </div>
                  <p className="text-xs font-semibold">Mobile-First</p>
                </div>
                <div className="animate-scale-in" style={{ animationDelay: '0.7s' }}>
                  <div className="w-12 h-12 mx-auto mb-2 bg-accent/20 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <i className="fas fa-users text-accent"></i>
                  </div>
                  <p className="text-xs font-semibold">Fair Distribution</p>
                </div>
                <div className="animate-scale-in" style={{ animationDelay: '0.8s' }}>
                  <div className="w-12 h-12 mx-auto mb-2 bg-chart-3/20 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <i className="fas fa-link text-chart-3"></i>
                  </div>
                  <p className="text-xs font-semibold">L1 Blockchain</p>
                </div>
                <div className="animate-scale-in" style={{ animationDelay: '0.9s' }}>
                  <div className="w-12 h-12 mx-auto mb-2 bg-chart-4/20 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <i className="fas fa-coins text-chart-4"></i>
                  </div>
                  <p className="text-xs font-semibold">21M Supply</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}