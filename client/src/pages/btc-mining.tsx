import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Pickaxe, Bitcoin } from "lucide-react";
import { useLocation } from "wouter";

export default function BtcMiningPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();


  return (
    <div className="mobile-page bg-[#1a1a1a]">
      {/* Header */}
      <div className="mobile-header bg-[#1a1a1a] border-b border-gray-800">
        <div className="flex items-center">
          <Button
            onClick={() => setLocation('/wallet')}
            variant="ghost"
            size="sm"
            className="p-0 mr-3"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Button>
          <h1 className="text-lg font-medium text-white">Bitcoin Mining</h1>
        </div>
      </div>

      {/* Content */}
      <div className="mobile-content">
        <Card className="p-6 bg-[#242424] border-gray-800">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-[#f7931a] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 16 16" fill="white">
                <path d="M5.5 13v1.25c0 .138.112.25.25.25h1a.25.25 0 0 0 .25-.25V13h.5v1.25c0 .138.112.25.25.25h1a.25.25 0 0 0 .25-.25V13h.084c1.992 0 3.416-1.033 3.416-2.82 0-1.502-1.007-2.323-2.186-2.44v-.088c.97-.242 1.683-.974 1.683-2.19C11.997 3.93 10.847 3 9.092 3H9V1.75a.25.25 0 0 0-.25-.25h-1a.25.25 0 0 0-.25.25V3h-.573V1.75a.25.25 0 0 0-.25-.25H5.75a.25.25 0 0 0-.25.25V3l-1.998.011a.25.25 0 0 0-.25.25v.989c0 .137.11.25.248.25l.755-.005a.75.75 0 0 1 .745.75v5.505a.75.75 0 0 1-.75.75l-.748.011a.25.25 0 0 0-.25.25v1c0 .138.112.25.25.25zm1.427-8.513h1.719c.906 0 1.438.498 1.438 1.312 0 .871-.575 1.362-1.877 1.362h-1.28zm0 4.051h1.84c1.137 0 1.756.58 1.756 1.524 0 .953-.626 1.45-2.158 1.45H6.927z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Bitcoin Mining</h2>
            <p className="text-gray-400 text-center">
              Real Bitcoin mining feature coming soon!
            </p>
          </div>
        </Card>

        <Card className="mt-4 p-4 bg-[#242424] border-gray-800">
          <h3 className="text-[#f7931a] font-medium mb-3">How It Works</h3>
          <div className="space-y-3 text-sm text-gray-400">
            <div className="flex items-start">
              <span className="text-[#f7931a] mr-2">1.</span>
              <p>Join mining pools to earn real Bitcoin rewards</p>
            </div>
            <div className="flex items-start">
              <span className="text-[#f7931a] mr-2">2.</span>
              <p>Use your hash power to mine Bitcoin blocks</p>
            </div>
            <div className="flex items-start">
              <span className="text-[#f7931a] mr-2">3.</span>
              <p>Receive BTC rewards directly to your wallet</p>
            </div>
            <div className="flex items-start">
              <span className="text-[#f7931a] mr-2">4.</span>
              <p>Withdraw your Bitcoin earnings anytime</p>
            </div>
          </div>
        </Card>

        <Card className="mt-4 p-4 bg-[#242424] border-gray-800">
          <div className="bg-[#f7931a]/10 border border-[#f7931a]/30 rounded p-3">
            <div className="flex items-center gap-2">
              <Pickaxe className="w-4 h-4 text-[#f7931a]" />
              <p className="text-sm text-[#f7931a]">
                This feature is under development and will be available soon
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}