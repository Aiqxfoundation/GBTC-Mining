import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Download, Bitcoin, Users, Cpu, TrendingUp, Zap, Globe, Target, Coins, Activity, Clock, Hash, Wallet, Shield, Network } from "lucide-react";
import { motion } from "framer-motion";

export default function Whitepaper() {
  const downloadWhitepaper = () => {
    // Create the whitepaper content as HTML
    const content = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Green Bitcoin (GBTC) - Decentralized Mining Infrastructure</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 900px; margin: 40px auto; padding: 30px; line-height: 1.8; background: #0a0a0a; color: #e0e0e0; }
        h1 { color: #f7931a; border-bottom: 3px solid #f7931a; padding-bottom: 15px; font-size: 36px; letter-spacing: 1px; }
        h2 { color: #f7931a; margin-top: 35px; font-size: 24px; border-left: 4px solid #f7931a; padding-left: 15px; }
        h3 { color: #fbbf24; font-size: 18px; margin-top: 20px; }
        .header { text-align: center; padding: 40px 0; background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%); border-radius: 10px; margin-bottom: 40px; }
        .vision { font-size: 52px; font-weight: bold; color: #f7931a; text-align: center; margin: 50px 0; letter-spacing: 3px; text-transform: uppercase; }
        .subtitle { text-align: center; color: #fbbf24; font-size: 20px; margin-bottom: 40px; font-style: italic; }
        .feature-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
        .feature { background: #1a1a1a; padding: 20px; border-radius: 8px; border: 1px solid #333; }
        .feature h4 { color: #fbbf24; margin-bottom: 10px; }
        .metric { background: #1a1a1a; padding: 15px; border-left: 3px solid #f7931a; margin: 10px 0; }
        .formula { background: #1a1a1a; padding: 15px; font-family: 'Courier New', monospace; border: 1px solid #f7931a; border-radius: 5px; color: #fbbf24; text-align: center; font-size: 16px; }
        ul { margin: 15px 0; padding-left: 25px; }
        li { margin: 8px 0; }
        .section { margin: 35px 0; }
        .highlight { color: #f7931a; font-weight: bold; }
        .logo { font-size: 64px; color: #f7931a; text-align: center; margin-bottom: 20px; }
        .footer { text-align: center; margin-top: 60px; padding-top: 30px; border-top: 1px solid #333; color: #888; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">₿</div>
        <h1 style="border: none; margin: 0;">GREEN BITCOIN (GBTC)</h1>
        <p style="color: #fbbf24; font-size: 18px; margin-top: 10px;">Decentralized Mining Infrastructure</p>
    </div>
    
    <div class="vision">OUR VISION</div>
    <div class="subtitle">Democratizing Bitcoin Mining Through Innovation</div>
    
    <div class="section">
        <p style="font-size: 18px; text-align: center; line-height: 1.8;">
            Green Bitcoin represents the next evolution in cryptocurrency mining - a platform that eliminates traditional barriers to entry. We've built a decentralized infrastructure where anyone can participate in mining without expensive hardware, technical expertise, or operational overhead.
        </p>
        
        <p style="font-size: 18px; text-align: center; line-height: 1.8; margin-top: 20px;">
            Our mission is simple: make mining accessible to everyone, everywhere. By leveraging distributed hash power and smart distribution algorithms, we're creating a fair and transparent ecosystem where success isn't determined by capital alone, but by strategic participation and network growth.
        </p>
        
        <p style="text-align: center; font-size: 20px; color: #f7931a; font-weight: bold; margin-top: 30px;">
            Build. Mine. Prosper. Together.
        </p>
    </div>
    
    <div class="section">
        <h2>⚡ Core Technology</h2>
        
        <div class="feature-grid">
            <div class="feature">
                <h4>Bitcoin-Standard Economics</h4>
                <ul>
                    <li>21,000,000 GBTC maximum supply</li>
                    <li>6.25 GBTC block rewards</li>
                    <li>Halving every 210,000 blocks</li>
                    <li>10-minute block generation</li>
                </ul>
            </div>
            
            <div class="feature">
                <h4>Smart Mining System</h4>
                <ul>
                    <li>Distributed hash power</li>
                    <li>Proportional reward distribution</li>
                    <li>Real-time network adjustments</li>
                    <li>Automated mining operations</li>
                </ul>
            </div>
            
            <div class="feature">
                <h4>Daily Block Cycles</h4>
                <ul>
                    <li>144 blocks per day</li>
                    <li>Reset at 00:00 UTC</li>
                    <li>Continuous blockchain height</li>
                    <li>Predictable mining schedule</li>
                </ul>
            </div>
            
            <div class="feature">
                <h4>Secure Authentication</h4>
                <ul>
                    <li>Username-based identity</li>
                    <li>6-digit PIN protection</li>
                    <li>Zero-knowledge security</li>
                    <li>Complete user anonymity</li>
                </ul>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>🚀 Platform Features</h2>
        
        <h3>Hash Power Acquisition</h3>
        <p>Purchase computational power directly with USDT to begin mining immediately. Your hash power determines your share of block rewards, creating a fair and transparent distribution system.</p>
        
        <div class="formula">
            Mining Rewards = (Your Hash Power ÷ Network Hash Power) × Block Reward
        </div>
        
        <h3>Direct Referral Network</h3>
        <p>Build your mining network by inviting others to join. Our single-tier referral system ensures transparency and fairness:</p>
        
        <div class="metric">
            <strong>Instant USDT Commission:</strong> Earn 15% on every hash power purchase made by your direct referrals
        </div>
        
        <div class="metric">
            <strong>Dynamic Hash Bonus:</strong> Receive 5% additional hash power from active miners in your network
        </div>
        
        <h3>Active Mining Protocol</h3>
        <p>Our 24-hour claim system ensures network vitality by requiring miners to actively participate. This prevents resource hoarding and maintains fair distribution among engaged participants.</p>
        
        <h3>GBTC Token Utility</h3>
        <ul>
            <li><span class="highlight">Mining Rewards:</span> Earn GBTC through proportional block reward distribution</li>
            <li><span class="highlight">Peer-to-Peer Transfers:</span> Send and receive GBTC directly between users</li>
            <li><span class="highlight">Future Gas Token:</span> Planned integration as network transaction fee currency</li>
            <li><span class="highlight">Ecosystem Currency:</span> Foundation for future platform expansions</li>
        </ul>
    </div>
    
    
    <div class="section">
        <h2>🎯 Strategic Advantages</h2>
        
        <div class="feature-grid">
            <div class="feature">
                <h4>Zero Hardware Investment</h4>
                <p>No need for expensive mining rigs, cooling systems, or technical maintenance. Access professional mining capabilities through our infrastructure.</p>
            </div>
            
            <div class="feature">
                <h4>Predictable Returns</h4>
                <p>Transparent reward calculations based on your hash power percentage. Monitor your earnings in real-time with our comprehensive dashboard.</p>
            </div>
            
            <div class="feature">
                <h4>Global Accessibility</h4>
                <p>Mine from anywhere in the world with just an internet connection. Our platform operates 24/7 across all time zones.</p>
            </div>
            
            <div class="feature">
                <h4>Community Growth</h4>
                <p>Build your mining network and earn from both personal mining and referral commissions. Grow together with the ecosystem.</p>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>🚀 Roadmap & Future</h2>
        
        <p>Green Bitcoin is more than a mining platform - it's the foundation for a comprehensive decentralized mining ecosystem. Our roadmap includes:</p>
        
        <ul style="font-size: 16px;">
            <li>Advanced mining pool features and collaborative mining options</li>
            <li>GBTC integration as native gas token for platform transactions</li>
            <li>Cross-chain bridges for enhanced liquidity and accessibility</li>
            <li>Decentralized governance for community-driven development</li>
            <li>Mobile applications for iOS and Android platforms</li>
            <li>Strategic partnerships with major cryptocurrency exchanges</li>
        </ul>
    </div>
    
    <div class="footer">
        <p style="font-size: 20px; color: #f7931a; margin-bottom: 10px;">
            <strong>Green Bitcoin - Where Mining Meets Innovation</strong>
        </p>
        <p>© 2025 Green Bitcoin. Building the Future of Decentralized Mining.</p>
    </div>
</body>
</html>`;
    
    // Create a Blob from the content
    const blob = new Blob([content], { type: 'text/html' });
    
    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'GBTC_Whitepaper.html';
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-lg border-b border-[#f7931a]/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/mining">
            <Button variant="ghost" size="sm" className="text-[#f7931a] hover:text-[#fbbf24]">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-[#f7931a]">
            WHITEPAPER
          </h1>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#f7931a] hover:text-[#fbbf24]"
            onClick={downloadWhitepaper}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-black border-[#f7931a]/30">
            <div className="p-6 text-center">
              <Bitcoin className="w-20 h-20 mx-auto mb-4 text-[#f7931a]" />
              <h1 className="text-3xl font-bold text-[#f7931a] mb-2">
                GREEN BITCOIN
              </h1>
              <p className="text-lg text-[#fbbf24]">
                Decentralized Mining Infrastructure
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Vision Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-black border-[#f7931a]/20">
            <div className="p-6">
              <h2 className="text-4xl font-bold text-center text-[#f7931a] mb-6">
                OUR VISION
              </h2>
              <p className="text-[#fbbf24] text-center text-lg mb-6">
                Democratizing Bitcoin Mining Through Innovation
              </p>
              <div className="space-y-4 text-gray-300">
                <p>
                  Green Bitcoin represents the next evolution in cryptocurrency mining - a platform that eliminates traditional barriers to entry. We've built a decentralized infrastructure where anyone can participate in mining without expensive hardware, technical expertise, or operational overhead.
                </p>
                <p>
                  Our mission is simple: make mining accessible to everyone, everywhere. By leveraging distributed hash power and smart distribution algorithms, we're creating a fair and transparent ecosystem where success isn't determined by capital alone, but by strategic participation and network growth.
                </p>
                <p className="text-center text-xl font-bold text-[#f7931a] mt-6">
                  Build. Mine. Prosper. Together.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Core Technology */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-black border-[#f7931a]/20">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Zap className="w-6 h-6 text-[#f7931a] mr-2" />
                <h2 className="text-2xl font-bold text-[#f7931a]">Core Technology</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333]">
                  <div className="flex items-center mb-2">
                    <Bitcoin className="w-5 h-5 text-[#fbbf24] mr-2" />
                    <h3 className="font-semibold text-[#fbbf24]">Bitcoin-Standard Economics</h3>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• 21,000,000 GBTC maximum supply</li>
                    <li>• 6.25 GBTC block rewards</li>
                    <li>• Halving every 210,000 blocks</li>
                    <li>• 10-minute block generation</li>
                  </ul>
                </div>
                
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333]">
                  <div className="flex items-center mb-2">
                    <Cpu className="w-5 h-5 text-[#fbbf24] mr-2" />
                    <h3 className="font-semibold text-[#fbbf24]">Smart Mining System</h3>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Distributed hash power</li>
                    <li>• Proportional reward distribution</li>
                    <li>• Real-time network adjustments</li>
                    <li>• Automated mining operations</li>
                  </ul>
                </div>
                
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333]">
                  <div className="flex items-center mb-2">
                    <Clock className="w-5 h-5 text-[#fbbf24] mr-2" />
                    <h3 className="font-semibold text-[#fbbf24]">Daily Block Cycles</h3>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• 144 blocks per day</li>
                    <li>• Reset at 00:00 UTC</li>
                    <li>• Continuous blockchain height</li>
                    <li>• Predictable mining schedule</li>
                  </ul>
                </div>
                
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333]">
                  <div className="flex items-center mb-2">
                    <Shield className="w-5 h-5 text-[#fbbf24] mr-2" />
                    <h3 className="font-semibold text-[#fbbf24]">Secure Authentication</h3>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Username-based identity</li>
                    <li>• 6-digit PIN protection</li>
                    <li>• Zero-knowledge security</li>
                    <li>• Complete user anonymity</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Platform Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-black border-[#f7931a]/20">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Target className="w-6 h-6 text-[#f7931a] mr-2" />
                <h2 className="text-2xl font-bold text-[#f7931a]">Platform Features</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center mb-2">
                    <Hash className="w-5 h-5 text-[#fbbf24] mr-2" />
                    <h3 className="text-lg font-semibold text-[#fbbf24]">Hash Power Acquisition</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    Purchase computational power directly with USDT to begin mining immediately. Your hash power determines your share of block rewards.
                  </p>
                  <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#f7931a]/50">
                    <p className="text-center font-mono text-[#fbbf24]">
                      Rewards = (Your Hash ÷ Network Hash) × Block Reward
                    </p>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <Users className="w-5 h-5 text-[#fbbf24] mr-2" />
                    <h3 className="text-lg font-semibold text-[#fbbf24]">Direct Referral Network</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    Build your mining network by inviting others. Our single-tier system ensures transparency:
                  </p>
                  <div className="space-y-2">
                    <div className="bg-[#1a1a1a] p-3 rounded-lg border-l-4 border-[#f7931a]">
                      <p className="text-[#fbbf24] font-semibold">15% USDT Commission</p>
                      <p className="text-gray-400 text-sm">Earn instantly on every referral's hash power purchase</p>
                    </div>
                    <div className="bg-[#1a1a1a] p-3 rounded-lg border-l-4 border-[#f7931a]">
                      <p className="text-[#fbbf24] font-semibold">5% Hash Power Bonus</p>
                      <p className="text-gray-400 text-sm">Receive additional hash from active miners in your network</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <Activity className="w-5 h-5 text-[#fbbf24] mr-2" />
                    <h3 className="text-lg font-semibold text-[#fbbf24]">Active Mining Protocol</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Our 24-hour claim system ensures network vitality. Miners must actively participate to maintain their rewards, preventing resource hoarding and ensuring fair distribution.
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <Coins className="w-5 h-5 text-[#fbbf24] mr-2" />
                    <h3 className="text-lg font-semibold text-[#fbbf24]">GBTC Token Utility</h3>
                  </div>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>• <span className="text-[#f7931a]">Mining Rewards:</span> Earn through proportional distribution</li>
                    <li>• <span className="text-[#f7931a]">P2P Transfers:</span> Send and receive between users</li>
                    <li>• <span className="text-[#f7931a]">Future Gas Token:</span> Network transaction fees</li>
                    <li>• <span className="text-[#f7931a]">Ecosystem Currency:</span> Platform expansion foundation</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>


        {/* Strategic Advantages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-black border-[#f7931a]/20">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Globe className="w-6 h-6 text-[#f7931a] mr-2" />
                <h2 className="text-2xl font-bold text-[#f7931a]">Strategic Advantages</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[#1a1a1a] p-3 rounded-lg">
                  <Wallet className="w-5 h-5 text-[#fbbf24] mb-2" />
                  <h4 className="text-[#fbbf24] font-semibold text-sm mb-1">Zero Hardware Investment</h4>
                  <p className="text-gray-500 text-xs">No mining rigs, cooling, or maintenance required</p>
                </div>
                
                <div className="bg-[#1a1a1a] p-3 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-[#fbbf24] mb-2" />
                  <h4 className="text-[#fbbf24] font-semibold text-sm mb-1">Predictable Returns</h4>
                  <p className="text-gray-500 text-xs">Transparent calculations, real-time monitoring</p>
                </div>
                
                <div className="bg-[#1a1a1a] p-3 rounded-lg">
                  <Globe className="w-5 h-5 text-[#fbbf24] mb-2" />
                  <h4 className="text-[#fbbf24] font-semibold text-sm mb-1">Global Accessibility</h4>
                  <p className="text-gray-500 text-xs">Mine from anywhere, 24/7 operations</p>
                </div>
                
                <div className="bg-[#1a1a1a] p-3 rounded-lg">
                  <Users className="w-5 h-5 text-[#fbbf24] mb-2" />
                  <h4 className="text-[#fbbf24] font-semibold text-sm mb-1">Community Growth</h4>
                  <p className="text-gray-500 text-xs">Earn from mining and referral commissions</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Future Roadmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-black border-[#f7931a]/20">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Target className="w-6 h-6 text-[#f7931a] mr-2" />
                <h2 className="text-2xl font-bold text-[#f7931a]">Roadmap & Future</h2>
              </div>
              
              <p className="text-gray-400 text-sm mb-4">
                Green Bitcoin is the foundation for a comprehensive decentralized mining ecosystem:
              </p>
              
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-start">
                  <span className="text-[#f7931a] mr-2">•</span>
                  Advanced mining pool features and collaborative options
                </li>
                <li className="flex items-start">
                  <span className="text-[#f7931a] mr-2">•</span>
                  GBTC as native gas token for platform transactions
                </li>
                <li className="flex items-start">
                  <span className="text-[#f7931a] mr-2">•</span>
                  Cross-chain bridges for enhanced liquidity
                </li>
                <li className="flex items-start">
                  <span className="text-[#f7931a] mr-2">•</span>
                  Decentralized governance for community development
                </li>
                <li className="flex items-start">
                  <span className="text-[#f7931a] mr-2">•</span>
                  Mobile applications for iOS and Android
                </li>
                <li className="flex items-start">
                  <span className="text-[#f7931a] mr-2">•</span>
                  Strategic exchange partnerships
                </li>
              </ul>
            </div>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="text-center py-8">
            <p className="text-lg font-bold text-[#f7931a] mb-2">
              Green Bitcoin
            </p>
            <p className="text-sm text-[#fbbf24]">
              Where Mining Meets Innovation
            </p>
            <p className="text-xs text-gray-500 mt-4">
              © 2025 Green Bitcoin. Building the Future of Decentralized Mining.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}