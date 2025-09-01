import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

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
      registerMutation.mutate({
        username: registerForm.username,
        password: registerForm.pin
      });
    }
  };

  return (
    <div className="min-h-screen bg-black overflow-y-auto flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Logo Section */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-[#f7931a]/20 rounded-full animate-pulse"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-[#f7931a] to-[#ff9416] rounded-full flex items-center justify-center shadow-2xl shadow-[#f7931a]/40">
                <span className="text-4xl font-bold text-black">₿</span>
              </div>
            </div>
          </div>

          {/* Auth Tabs */}
          <Tabs defaultValue="register" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-900">
              <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border-[#f7931a]/20 bg-gray-950">
                <CardHeader>
                  <CardTitle className="text-center text-white">Sign In</CardTitle>
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
                        className="bg-black border-gray-800"
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
                        className="bg-black border-gray-800 text-center font-mono text-lg"
                        data-testid="input-login-pin"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-[#f7931a] hover:bg-[#ff9416] text-black font-bold"
                      disabled={loginMutation.isPending}
                      data-testid="button-login"
                    >
                      {loginMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Sign In
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="border-[#f7931a]/20 bg-gray-950">
                <CardHeader>
                  <CardTitle className="text-center text-white">Create Account</CardTitle>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Fair mining based on purchased hash power only
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="p-3 bg-red-950/30 rounded-lg border border-red-500/20 mb-4">
                      <div className="flex items-start space-x-2">
                        <span className="text-red-500">⚠</span>
                        <div className="text-xs">
                          <strong className="text-red-500">IMPORTANT SECURITY WARNING</strong>
                          <p className="text-gray-400 mt-1">
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
                        className="bg-black border-gray-800"
                        data-testid="input-register-username"
                      />
                      <p className="text-xs text-gray-500 mt-1">Only letters, numbers, and underscores allowed</p>
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
                        className="bg-black border-gray-800 text-center font-mono text-lg"
                        data-testid="input-register-pin"
                      />
                      <p className="text-xs text-gray-500 mt-1">Must be exactly 6 digits</p>
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
                        className="bg-black border-gray-800 text-center font-mono text-lg"
                        data-testid="input-register-confirm-pin"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-[#f7931a] hover:bg-[#ff9416] text-black font-bold"
                      disabled={registerMutation.isPending || registerForm.pin !== registerForm.confirmPin || registerForm.pin.length !== 6}
                      data-testid="button-register"
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Create Account
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}