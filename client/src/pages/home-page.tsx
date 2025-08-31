import { Link } from "wouter";
import bitcoinLogo from "@assets/file_00000000221c61fab63936953b889556_1756633909848.png";

export default function HomePage() {
  return (
    <div className="min-h-screen matrix-bg">
      {/* Floating particles effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full mining-float opacity-60"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-chart-4 rounded-full mining-float opacity-40" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-accent rounded-full mining-float opacity-50" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-primary rounded-full mining-float opacity-30" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Cyber Header */}
      <header className="bg-card/80 border-b border-primary/20 sticky top-0 z-50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 cyber-border rounded-xl flex items-center justify-center glow-bitcoin">
                  <img src={bitcoinLogo} alt="GBTC" className="w-8 h-8 mining-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full mining-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-primary glow-green">
                  GBTC<span className="text-chart-4">MINE</span>
                </h1>
                <p className="text-xs text-muted-foreground font-mono">Next-Gen Mining Protocol</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <button className="text-primary font-medium transition-all hover:glow-green font-display">
                <i className="fas fa-cube mr-2 mining-spin"></i>Mine
              </button>
              <Link href="/auth" className="text-foreground hover:text-primary transition-colors font-medium">
                <i className="fas fa-user-astronaut mr-2"></i>Enter
              </Link>
              <Link href="/dashboard" className="text-foreground hover:text-primary transition-colors font-medium">
                <i className="fas fa-satellite-dish mr-2"></i>Control
              </Link>
              <Link href="/mining" className="text-foreground hover:text-primary transition-colors font-medium">
                <i className="fas fa-microchip mr-2"></i>Mining
              </Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex items-center space-x-2 text-sm hologram-card px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full mining-pulse"></div>
                <span className="text-primary font-mono font-bold">ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Cyber Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="mining-grid absolute inset-0 opacity-30"></div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-6xl mx-auto">
            {/* 3D Bitcoin Logo */}
            <div className="relative mx-auto mb-12">
              <div className="w-32 h-32 mx-auto relative block-3d">
                <div className="cyber-border rounded-2xl w-full h-full flex items-center justify-center glow-bitcoin">
                  <img src={bitcoinLogo} alt="GBTC" className="w-20 h-20 mining-float" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full mining-pulse glow-green"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-chart-4 rounded-full mining-pulse"></div>
              </div>
            </div>

            <h1 className="text-6xl md:text-8xl font-display font-black mb-8 leading-tight">
              <span className="text-primary glow-green">QUANTUM</span>
              <br />
              <span className="text-chart-4 glow-bitcoin">MINING</span>
              <br />
              <span className="text-foreground">PROTOCOL</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto font-mono leading-relaxed">
              Harness the power of distributed quantum mining. 
              <br />
              <span className="text-primary">21,000,000 GBTC</span> • 
              <span className="text-chart-4">Next-Gen Proof</span> • 
              <span className="text-accent">Real Rewards</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/auth">
                <button 
                  className="cyber-border bg-gradient-to-r from-primary to-chart-4 text-primary-foreground px-10 py-5 rounded-xl font-display font-bold text-lg hover:scale-105 transition-all glow-green mining-pulse"
                  data-testid="button-start-mining"
                >
                  <i className="fas fa-rocket mr-3"></i>
                  INITIALIZE MINING
                </button>
              </Link>
              
              <Link href="/mining">
                <button className="hologram-card text-foreground px-10 py-5 rounded-xl font-display font-bold text-lg hover:scale-105 transition-all">
                  <i className="fas fa-chart-line mr-3"></i>
                  VIEW PROTOCOL
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Protocol Features */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              <span className="text-primary">QUANTUM</span> PROTOCOL FEATURES
            </h2>
            <p className="text-xl text-muted-foreground font-mono">Advanced mining technology with proven economics</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="hologram-card p-8 rounded-xl block-3d group">
              <div className="w-16 h-16 cyber-border rounded-xl flex items-center justify-center mb-6 glow-bitcoin group-hover:mining-pulse">
                <i className="fas fa-atom text-primary text-2xl"></i>
              </div>
              <h3 className="text-xl font-display font-bold mb-4 text-primary">QUANTUM CORE</h3>
              <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                Advanced quantum-resistant algorithm with 21M fixed supply ensuring maximum scarcity
              </p>
            </div>
            
            <div className="hologram-card p-8 rounded-xl block-3d group">
              <div className="w-16 h-16 cyber-border rounded-xl flex items-center justify-center mb-6 glow-green group-hover:mining-pulse">
                <i className="fas fa-microchip text-chart-4 text-2xl"></i>
              </div>
              <h3 className="text-xl font-display font-bold mb-4 text-chart-4">SMART HALVING</h3>
              <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                Automated reward reduction every 365 days maintaining deflationary pressure
              </p>
            </div>
            
            <div className="hologram-card p-8 rounded-xl block-3d group">
              <div className="w-16 h-16 cyber-border rounded-xl flex items-center justify-center mb-6 glow-green group-hover:mining-pulse">
                <i className="fas fa-bolt text-accent text-2xl"></i>
              </div>
              <h3 className="text-xl font-display font-bold mb-4 text-accent">INSTANT REWARDS</h3>
              <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                Real-time mining rewards with instant claim and USDT-backed hash power
              </p>
            </div>
            
            <div className="hologram-card p-8 rounded-xl block-3d group">
              <div className="w-16 h-16 cyber-border rounded-xl flex items-center justify-center mb-6 glow-bitcoin group-hover:mining-pulse">
                <i className="fas fa-shield-alt text-chart-3 text-2xl"></i>
              </div>
              <h3 className="text-xl font-display font-bold mb-4 text-chart-3">SECURE VAULT</h3>
              <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                Multi-network deposits with admin verification for maximum security
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quantum Economics */}
      <section className="py-24 bg-gradient-to-br from-card/50 to-background relative">
        <div className="absolute inset-0 mining-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                <span className="text-chart-4">QUANTUM</span> ECONOMICS
              </h2>
              <p className="text-xl text-muted-foreground font-mono">Mathematically perfect distribution protocol</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Token Distribution */}
              <div className="space-y-6">
                <div className="hologram-card p-6 rounded-xl flex items-center justify-between block-3d">
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 bg-primary rounded-full mining-pulse"></div>
                    <span className="font-display font-bold text-primary">QUANTUM MINING</span>
                  </div>
                  <span className="font-display font-black text-2xl text-primary">65%</span>
                </div>
                
                <div className="hologram-card p-6 rounded-xl flex items-center justify-between block-3d">
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 bg-chart-4 rounded-full mining-pulse" style={{animationDelay: '0.5s'}}></div>
                    <span className="font-display font-bold text-chart-4">PRESALE PROTOCOL</span>
                  </div>
                  <span className="font-display font-black text-2xl text-chart-4">15%</span>
                </div>
                
                <div className="hologram-card p-6 rounded-xl flex items-center justify-between block-3d">
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 bg-accent rounded-full mining-pulse" style={{animationDelay: '1s'}}></div>
                    <span className="font-display font-bold text-accent">DEX LIQUIDITY</span>
                  </div>
                  <span className="font-display font-black text-2xl text-accent">10%</span>
                </div>
                
                <div className="hologram-card p-6 rounded-xl flex items-center justify-between block-3d">
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 bg-chart-3 rounded-full mining-pulse" style={{animationDelay: '1.5s'}}></div>
                    <span className="font-display font-bold text-chart-3">DEVELOPMENT</span>
                  </div>
                  <span className="font-display font-black text-2xl text-chart-3">7%</span>
                </div>
                
                <div className="hologram-card p-6 rounded-xl flex items-center justify-between block-3d">
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 bg-chart-5 rounded-full mining-pulse" style={{animationDelay: '2s'}}></div>
                    <span className="font-display font-bold text-chart-5">EMERGENCY RESERVE</span>
                  </div>
                  <span className="font-display font-black text-2xl text-chart-5">3%</span>
                </div>
              </div>
              
              {/* Protocol Metrics */}
              <div className="cyber-border p-8 rounded-xl bg-gradient-to-br from-card/80 to-background/80 backdrop-blur-sm">
                <h3 className="text-2xl font-display font-bold mb-8 text-primary glow-green">PROTOCOL METRICS</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-mono">TOTAL_SUPPLY:</span>
                    <span className="font-display font-black text-xl text-primary">21,000,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-mono">GENESIS_REWARD:</span>
                    <span className="font-display font-black text-xl text-chart-4">12.5 GBTC</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-mono">HALVING_CYCLE:</span>
                    <span className="font-display font-black text-xl text-accent">365 DAYS</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-mono">BLOCK_TIME:</span>
                    <span className="font-display font-black text-xl text-chart-3">600 SEC</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-mono">HASH_POWER_RATE:</span>
                    <span className="font-display font-black text-xl text-chart-5">1:1 USDT</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-mono">NEXT_HALVING:</span>
                    <span className="font-display font-black text-xl text-destructive mining-pulse">287 DAYS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <img src={bitcoinLogo} alt="GBTC" className="w-4 h-4" />
                </div>
                <span className="font-bold text-primary">Green Bitcoin</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Sustainable cryptocurrency mining platform with eco-friendly approach.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Mining</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Tokenomics</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Staking</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Governance</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <i className="fab fa-discord"></i>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <i className="fab fa-telegram"></i>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <i className="fab fa-github"></i>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 GBTC Foundation – Green Bitcoin Mining Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
