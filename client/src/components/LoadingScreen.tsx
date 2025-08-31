import { useEffect, useState } from "react";

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  
  const phases = [
    "Initializing quantum cores...",
    "Connecting to blockchain network...",
    "Synchronizing mining nodes...",
    "Loading hashrate engines...",
    "Establishing secure connection...",
    "Ready to mine!"
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    const phaseInterval = setInterval(() => {
      setCurrentPhase(prev => {
        if (prev >= phases.length - 1) {
          clearInterval(phaseInterval);
          return phases.length - 1;
        }
        return prev + 1;
      });
    }, 500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(phaseInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bitcoin-grid opacity-10"></div>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-primary/5 font-mono text-xs"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-up ${10 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          >
            {Math.random().toString(16).substr(2, 8)}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-md w-full px-8">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="w-24 h-24 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-primary to-chart-4 rounded-full flex items-center justify-center">
              <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-gradient">₿</span>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-heading font-bold text-gradient mb-2">GBTC MINING</h1>
          <p className="text-sm text-muted-foreground">Professional Bitcoin Mining Platform</p>
        </div>

        {/* Loading Bar */}
        <div className="mb-6">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-chart-4 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="h-full bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{progress}%</span>
            <span className="font-mono">{phases[currentPhase]}</span>
          </div>
        </div>

        {/* Mining Animation */}
        <div className="flex justify-center space-x-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-8 bg-primary/30 rounded-full"
              style={{
                animation: `pulse-scale 1.5s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`
              }}
            ></div>
          ))}
        </div>
      </div>

    </div>
  );
}