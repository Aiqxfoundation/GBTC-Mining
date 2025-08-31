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
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", password: "", confirmPassword: "" });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/dashboard" />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username && loginForm.password) {
      loginMutation.mutate(loginForm);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.username && registerForm.password && registerForm.password === registerForm.confirmPassword) {
      registerMutation.mutate({
        username: registerForm.username,
        password: registerForm.password
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
                  <span className="text-2xl font-bold text-gradient">₿</span>
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-heading font-bold text-gradient">Welcome to GBTC</h2>
            <p className="mt-2 text-muted-foreground">Join the green mining revolution</p>
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
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                        className="bg-background border-primary/20"
                        data-testid="input-login-password"
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
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="register-username">Username</Label>
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="Choose a username"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                        required
                        className="bg-background border-primary/20"
                        data-testid="input-register-username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Create a password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                        className="bg-background border-primary/20"
                        data-testid="input-register-password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-confirm">Confirm Password</Label>
                      <Input
                        id="register-confirm"
                        type="password"
                        placeholder="Confirm your password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        className="bg-background border-primary/20"
                        data-testid="input-register-confirm"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full btn-primary"
                      disabled={registerMutation.isPending || registerForm.password !== registerForm.confirmPassword}
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
                      <span>What is GBTC Mining?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    GBTC (Green Bitcoin) is a revolutionary cryptocurrency mining platform that simulates Bitcoin mining 
                    with eco-friendly principles. Mine GBTC tokens using hashrate power, with blocks generated every 10 minutes 
                    just like Bitcoin. Our platform features a fixed supply of 21 million tokens and real USDT deposits.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="how-to-start">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-rocket text-chart-4"></i>
                      <span>How to Start Mining?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Create your account with a unique username</li>
                      <li>Make a USDT deposit (minimum 10 USDT)</li>
                      <li>Purchase hashrate power (1 USDT = 1 GH/s)</li>
                      <li>Start mining automatically - earn rewards every 10 minutes!</li>
                      <li>Claim your rewards within 24 hours to avoid penalties</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="how-to-earn">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-coins text-accent"></i>
                      <span>How to Earn & Mine?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <div className="space-y-3">
                      <div>
                        <strong className="text-foreground">Mining Rewards:</strong>
                        <p>Your share of rewards = (Your Hashrate ÷ Total Network Hashrate) × Block Reward</p>
                        <p className="text-xs mt-1">Example: With 100 GH/s in a 10,000 GH/s network, you earn 1% of each block</p>
                      </div>
                      <div>
                        <strong className="text-foreground">Deposit Methods:</strong>
                        <ul className="list-disc list-inside text-sm mt-1">
                          <li>TRC20 (Tron Network)</li>
                          <li>BEP20 (Binance Smart Chain)</li>
                          <li>ERC20 (Ethereum Network)</li>
                        </ul>
                      </div>
                      <div>
                        <strong className="text-foreground">Important:</strong>
                        <p className="text-sm">Claim rewards within 24 hours or lose 50% as penalty!</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="referral-commission">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-users text-chart-3"></i>
                      <span>Referral Commission in USDT</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <div className="space-y-3">
                      <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <strong className="text-primary">Earn 10% Commission!</strong>
                        <p className="text-sm mt-1">Get 10% USDT commission from every hashrate purchase made by your referrals</p>
                      </div>
                      <div>
                        <strong className="text-foreground">How it works:</strong>
                        <ol className="list-decimal list-inside text-sm space-y-1 mt-1">
                          <li>Share your unique referral link</li>
                          <li>Friends register using your link</li>
                          <li>When they purchase hashrate, you get 10% in USDT</li>
                          <li>Use commission to buy hashrate without depositing!</li>
                        </ol>
                      </div>
                      <div className="text-sm">
                        <strong>Example:</strong> Your friend buys 100 GH/s for 100 USDT → You earn 10 USDT instantly!
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="mining-status">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-info-circle text-chart-2"></i>
                      <span>Mining Status for New Users</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <div className="space-y-2">
                      <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                        <strong className="text-destructive">⚠️ Mining Inactive by Default</strong>
                        <p className="text-sm mt-1">New users start with INACTIVE mining status</p>
                      </div>
                      <div>
                        <strong className="text-foreground">To Activate Mining:</strong>
                        <ul className="list-disc list-inside text-sm space-y-1 mt-1">
                          <li>Make a USDT deposit AND purchase hashrate, OR</li>
                          <li>Earn referral commission and use it to buy hashrate</li>
                          <li>Mining starts automatically after hashrate purchase</li>
                          <li>Keep claiming rewards to stay active (24-hour rule)</li>
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
                <div>
                  <div className="w-12 h-12 mx-auto mb-2 bg-primary/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-shield-alt text-primary"></i>
                  </div>
                  <p className="text-xs font-semibold">Secure Platform</p>
                </div>
                <div>
                  <div className="w-12 h-12 mx-auto mb-2 bg-accent/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-clock text-accent"></i>
                  </div>
                  <p className="text-xs font-semibold">10 Min Blocks</p>
                </div>
                <div>
                  <div className="w-12 h-12 mx-auto mb-2 bg-chart-3/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-percentage text-chart-3"></i>
                  </div>
                  <p className="text-xs font-semibold">10% Referral</p>
                </div>
                <div>
                  <div className="w-12 h-12 mx-auto mb-2 bg-chart-4/20 rounded-full flex items-center justify-center">
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