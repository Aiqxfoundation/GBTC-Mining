import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Bitcoin, Lock, Sparkles, Key } from "lucide-react";
import { useLocation } from "wouter";

export default function MysteriousBtcPage() {
  const [, setLocation] = useLocation();
  
  return (
    <div className="mobile-page bg-gradient-to-b from-purple-950 via-black to-purple-950">
      {/* Background Effects */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 25% 25%, #7e22ce 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, #7e22ce 0%, transparent 50%)`,
          }}>
        </div>
      </div>
      
      {/* Header */}
      <div className="mobile-header bg-black/50 backdrop-blur border-b border-purple-800/50 relative z-10">
        <div className="flex items-center">
          <Button
            onClick={() => setLocation('/wallet')}
            variant="ghost"
            size="sm"
            className="p-0 mr-3"
            data-testid="button-back-mysterious"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Button>
          <h1 className="text-lg font-medium text-white">🔮 Mysterious Bitcoin Chamber 🔮</h1>
        </div>
      </div>
      
      {/* Content */}
      <div className="mobile-content relative z-10">
        {/* Welcome Card */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-purple-900/50 to-black/50 border-purple-700/50 backdrop-blur">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#f7931a] to-purple-600 flex items-center justify-center animate-pulse">
              <Bitcoin className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to the Chamber</h2>
            <p className="text-purple-300">Where Real Bitcoin Awaits...</p>
          </div>
        </Card>
        
        {/* Mystery Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 bg-black/50 border-purple-700/50 backdrop-blur">
            <Lock className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-white font-medium">Locked Vault</p>
            <p className="text-purple-300 text-xs">Coming Soon</p>
          </Card>
          
          <Card className="p-4 bg-black/50 border-purple-700/50 backdrop-blur">
            <Key className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-white font-medium">Secret Keys</p>
            <p className="text-purple-300 text-xs">Unlock Power</p>
          </Card>
        </div>
        
        {/* Mysterious Message */}
        <Card className="p-6 bg-gradient-to-br from-black/70 to-purple-900/30 border-purple-700/50 backdrop-blur">
          <div className="flex items-center mb-4">
            <Sparkles className="w-6 h-6 text-yellow-400 mr-2" />
            <h3 className="text-lg font-bold text-white">The Path to Real Bitcoin</h3>
          </div>
          <p className="text-purple-200 mb-4">
            You have discovered the secret chamber. Here, the true power of Bitcoin mining awaits those who are worthy.
          </p>
          <p className="text-purple-300 text-sm italic">
            "The journey of a thousand satoshis begins with a single hash..."
          </p>
        </Card>
        
        {/* Coming Soon Button */}
        <Button
          className="w-full mt-6 py-6 bg-gradient-to-r from-[#f7931a] to-purple-600 text-white hover:from-[#f7931a]/90 hover:to-purple-700 font-bold text-lg"
          disabled
        >
          🔒 Chamber Under Construction 🔒
        </Button>
        
        <p className="text-center text-purple-400 text-xs mt-4">
          The master will guide you soon...
        </p>
      </div>
    </div>
  );
}