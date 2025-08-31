import { Link } from "wouter";
import bitcoinLogo from "@assets/file_00000000221c61fab63936953b889556_1756633909848.png";

export default function HomePage() {
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
                <p className="text-xs text-muted-foreground">GBTC Mining Platform</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <button className="text-primary transition-colors">
                <i className="fas fa-home mr-2"></i>Home
              </button>
              <Link href="/auth" className="text-foreground hover:text-primary transition-colors">
                <i className="fas fa-sign-in-alt mr-2"></i>Login
              </Link>
              <Link href="/dashboard" className="text-foreground hover:text-primary transition-colors">
                <i className="fas fa-tachometer-alt mr-2"></i>Dashboard
              </Link>
              <Link href="/admin" className="text-foreground hover:text-primary transition-colors">
                <i className="fas fa-cog mr-2"></i>Admin
              </Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-muted-foreground">Network Active</span>
              </div>
              <button className="md:hidden text-foreground">
                <i className="fas fa-bars"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-background to-card py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-8 glow-green">
              <img src={bitcoinLogo} alt="GBTC" className="w-12 h-12" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Green Bitcoin <span className="text-primary">Mining</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience the future of sustainable cryptocurrency mining with GBTC. 
              A Bitcoin-inspired token with eco-friendly approach and fixed 21M supply.
            </p>
            <Link href="/auth">
              <button 
                className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all transform hover:scale-105 glow-green"
                data-testid="button-start-mining"
              >
                Start Mining Now
                <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-lg border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-coins text-primary text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Fixed Supply</h3>
              <p className="text-muted-foreground">Total supply capped at 21,000,000 GBTC tokens, ensuring scarcity and value preservation.</p>
            </div>
            
            <div className="bg-card p-8 rounded-lg border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-clock text-accent text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Halving Cycle</h3>
              <p className="text-muted-foreground">Block rewards halve every 2 years, creating a deflationary mechanism similar to Bitcoin.</p>
            </div>
            
            <div className="bg-card p-8 rounded-lg border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-chart-3/20 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-leaf text-chart-3 text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Eco-Friendly</h3>
              <p className="text-muted-foreground">Sustainable mining approach with reduced energy consumption compared to traditional mining.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tokenomics Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Tokenomics</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                    <span className="text-foreground">Mining</span>
                    <span className="text-primary font-semibold">50%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                    <span className="text-foreground">Presale</span>
                    <span className="text-accent font-semibold">25%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                    <span className="text-foreground">Listings</span>
                    <span className="text-chart-3 font-semibold">10%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                    <span className="text-foreground">VCs</span>
                    <span className="text-chart-4 font-semibold">5%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                    <span className="text-foreground">Team</span>
                    <span className="text-chart-5 font-semibold">5%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                    <span className="text-foreground">Reserve</span>
                    <span className="text-muted-foreground font-semibold">5%</span>
                  </div>
                </div>
              </div>
              <div className="bg-background p-8 rounded-lg">
                <h3 className="text-xl font-semibold mb-6">Key Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Supply:</span>
                    <span className="font-semibold">21,000,000 GBTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Reward:</span>
                    <span className="font-semibold text-primary">6.25 GBTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Next Halving:</span>
                    <span className="font-semibold">730 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Block Time:</span>
                    <span className="font-semibold">10 minutes</span>
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
