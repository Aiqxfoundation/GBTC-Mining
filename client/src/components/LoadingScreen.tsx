import { useEffect, useState } from "react";

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [binaryStream, setBinaryStream] = useState<string[]>([]);
  
  const phases = [
    "[BOOT] Initializing GBTC Mining OS...",
    "[NETWORK] Connecting to blockchain nodes...",
    "[SYNC] Synchronizing with mining pool...",
    "[HASH] Loading ASIC processors...",
    "[AUTH] Verifying security protocols...",
    "[READY] System operational!"
  ];

  useEffect(() => {
    // Generate binary stream
    const binaryInterval = setInterval(() => {
      setBinaryStream(prev => {
        const newBinary = Math.random().toString(2).substring(2, 10);
        return [...prev.slice(-20), newBinary];
      });
    }, 100);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(binaryInterval);
          setTimeout(onComplete, 800);
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
      clearInterval(binaryInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      {/* Matrix-style Background */}
      <div className="absolute inset-0 overflow-hidden bg-black">
        <div className="absolute inset-0 bitcoin-grid opacity-5"></div>
        
        {/* Binary rain effect */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute font-mono text-xs"
              style={{
                left: `${i * 3.33}%`,
                color: `hsl(142, ${50 + Math.random() * 30}%, ${30 + Math.random() * 20}%)`,
                animation: `matrix-fall ${5 + Math.random() * 10}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.8 + 0.2
              }}
            >
              {Array.from({length: 50}, () => Math.round(Math.random())).join('')}
            </div>
          ))}
        </div>

        {/* Hexadecimal particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute text-primary/20 font-mono text-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-up ${10 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          >
            0x{Math.random().toString(16).substr(2, 8).toUpperCase()}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-lg w-full px-8">
        {/* Animated Logo */}
        <div className="mb-8 text-center">
          <div className="w-32 h-32 mx-auto mb-6 relative">
            {/* Rotating rings */}
            <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
            <div className="absolute inset-2 border-2 border-accent/30 rounded-full animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}></div>
            <div className="absolute inset-4 border-2 border-chart-4/30 rounded-full animate-spin" style={{ animationDuration: '5s' }}></div>
            
            {/* Central logo */}
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-primary via-accent to-chart-4 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-28 h-28 bg-black rounded-full flex items-center justify-center border-2 border-primary/50">
                <span className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-chart-4 text-transparent bg-clip-text animate-pulse">₿</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-heading font-black mb-2">
            <span className="bg-gradient-to-r from-primary via-accent to-chart-4 text-transparent bg-clip-text animate-gradient">
              GBTC MINING
            </span>
          </h1>
          <p className="text-sm text-green-400 font-mono animate-pulse">
            &lt;Professional Mining Network/&gt;
          </p>
        </div>

        {/* Terminal-style Loading */}
        <div className="mb-6 bg-black/50 border border-primary/30 rounded-lg p-4 backdrop-blur">
          <div className="flex items-center justify-between mb-3">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-xs text-green-400 font-mono">GBTC_BOOT_v2.1.0</span>
          </div>
          
          {/* Progress bar */}
          <div className="h-3 bg-black rounded-full overflow-hidden border border-primary/20 mb-3">
            <div 
              className="h-full bg-gradient-to-r from-green-500 via-primary to-accent transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-primary/30 animate-pulse"></div>
            </div>
          </div>
          
          {/* Terminal output */}
          <div className="font-mono text-xs space-y-1">
            <div className="text-green-400">{phases[currentPhase]}</div>
            <div className="text-primary/60">
              {binaryStream.slice(-3).map((binary, i) => (
                <div key={i} className="opacity-${100 - i * 30}">
                  &gt; {binary}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-accent">Progress: {progress}%</span>
              <span className="text-chart-4">ETA: {Math.max(0, 5 - Math.floor(progress / 20))}s</span>
            </div>
          </div>
        </div>

        {/* Mining Cores Animation */}
        <div className="flex justify-center space-x-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="relative">
              <div
                className="w-3 h-12 bg-gradient-to-t from-primary to-accent rounded-full"
                style={{
                  animation: `pulse-scale 1.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                  opacity: progress > i * 14 ? 1 : 0.3
                }}
              ></div>
            </div>
          ))}
        </div>
        
        {/* Hash display */}
        <div className="mt-6 text-center">
          <div className="text-xs text-muted-foreground font-mono">
            Current Hash: <span className="text-primary">
              {progress > 0 ? `0x${Math.floor(progress * 999999).toString(16).toUpperCase().padStart(6, '0')}` : '0x000000'}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}