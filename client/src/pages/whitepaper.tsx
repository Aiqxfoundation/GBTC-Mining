import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Download, Bitcoin, Users, Cpu, TrendingUp, Zap, Globe, Target, Coins, Activity, Clock, Hash, Wallet, Shield, Network, Rocket, Calendar, ChevronRight, Lock } from "lucide-react";
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
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #1a1a1a; color: #f7931a; padding: 12px; text-align: left; border: 1px solid #333; }
        td { padding: 10px; border: 1px solid #333; background: #0f0f0f; }
        .chart-bar { background: linear-gradient(to right, #f7931a, #fbbf24); height: 20px; border-radius: 3px; }
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
        <h2>💎 Token Supply Parameters</h2>
        
        <table>
            <tr>
                <th>Parameter</th>
                <th>Value</th>
                <th>Details</th>
            </tr>
            <tr>
                <td><strong>Maximum Supply</strong></td>
                <td style="color: #f7931a; font-weight: bold;">2,100,000 GBTC</td>
                <td>10x rarer than Bitcoin</td>
            </tr>
            <tr>
                <td><strong>Block Time</strong></td>
                <td style="color: #fbbf24;">1 hour</td>
                <td>Predictable mining schedule</td>
            </tr>
            <tr>
                <td><strong>Blocks per Day</strong></td>
                <td style="color: #fbbf24;">24</td>
                <td>One block every hour</td>
            </tr>
            <tr>
                <td><strong>Halving Interval</strong></td>
                <td style="color: #fbbf24;">4,200 blocks</td>
                <td>Approximately 6 months</td>
            </tr>
            <tr>
                <td><strong>Initial Block Reward</strong></td>
                <td style="color: #f7931a; font-weight: bold;">50 GBTC</td>
                <td>Starting reward per block</td>
            </tr>
        </table>
    </div>
    
    <div class="section">
        <h2>⚡ Block Rewards & Halving Schedule</h2>
        
        <table>
            <tr>
                <th>Halving Event</th>
                <th>Block Number</th>
                <th>Time Period</th>
                <th>Block Reward</th>
                <th>Daily Rewards</th>
            </tr>
            <tr>
                <td>Launch</td>
                <td>0</td>
                <td>Month 0</td>
                <td style="color: #f7931a; font-weight: bold;">50 GBTC</td>
                <td>1,200 GBTC</td>
            </tr>
            <tr>
                <td>1st Halving</td>
                <td>4,200</td>
                <td>~6 months</td>
                <td style="color: #fbbf24;">25 GBTC</td>
                <td>600 GBTC</td>
            </tr>
            <tr>
                <td>2nd Halving</td>
                <td>8,400</td>
                <td>~12 months</td>
                <td style="color: #fbbf24;">12.5 GBTC</td>
                <td>300 GBTC</td>
            </tr>
            <tr>
                <td>3rd Halving</td>
                <td>12,600</td>
                <td>~18 months</td>
                <td>6.25 GBTC</td>
                <td>150 GBTC</td>
            </tr>
            <tr>
                <td>4th Halving</td>
                <td>16,800</td>
                <td>~24 months</td>
                <td>3.125 GBTC</td>
                <td>75 GBTC</td>
            </tr>
        </table>
        
        <p style="margin-top: 20px;">The halving continues every 4,200 blocks until the maximum supply of 2.1 million GBTC is reached, creating a deflationary supply curve that rewards early adopters.</p>
    </div>
    
    <div class="section">
        <h2>📊 Supply Release Curve</h2>
        
        <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; border: 1px solid #333;">
            <h4 style="color: #fbbf24; margin-bottom: 15px;">Projected GBTC in Circulation</h4>
            
            <div style="margin-bottom: 10px;">
                <span style="color: #888;">Year 1:</span>
                <div style="width: 15%; margin-top: 5px;" class="chart-bar"></div>
                <span style="color: #f7931a; font-weight: bold;">~315,000 GBTC (15%)</span>
            </div>
            
            <div style="margin-bottom: 10px;">
                <span style="color: #888;">Year 2:</span>
                <div style="width: 19%; margin-top: 5px;" class="chart-bar"></div>
                <span style="color: #f7931a; font-weight: bold;">~393,750 GBTC (19%)</span>
            </div>
            
            <div style="margin-bottom: 10px;">
                <span style="color: #888;">Year 5:</span>
                <div style="width: 48%; margin-top: 5px;" class="chart-bar"></div>
                <span style="color: #f7931a; font-weight: bold;">~1,000,000 GBTC (48%)</span>
            </div>
            
            <div style="margin-bottom: 10px;">
                <span style="color: #888;">Year 10+:</span>
                <div style="width: 100%; margin-top: 5px;" class="chart-bar"></div>
                <span style="color: #f7931a; font-weight: bold;">2,100,000 GBTC (100%)</span>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>🚀 Launch Timeline (TGE)</h2>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            The Token Generation Event (TGE) will take place only when the GBTC ecosystem reaches <span class="highlight">100K - 1 Million verified participants</span>. This ensures strong community adoption, global visibility, and network stability.
        </p>
        
        <div class="feature-grid">
            <div class="feature">
                <h4>📦 Mining Phase</h4>
                <p>Users accumulate mining rewards before TGE. All mined GBTC is stored securely in user accounts, ready for the official launch.</p>
            </div>
            
            <div class="feature">
                <h4>🎯 TGE Milestone</h4>
                <p>Official GBTC release when we achieve 100K-1M network participants, ensuring massive adoption from day one.</p>
            </div>
            
            <div class="feature">
                <h4>💰 Exchange Listings</h4>
                <p>Major CEX and DEX listings immediately after TGE, providing instant liquidity and trading opportunities.</p>
            </div>
            
            <div class="feature">
                <h4>🔓 Withdrawals Enabled</h4>
                <p>After TGE, users can withdraw mined tokens directly to personal wallets or trade on exchanges.</p>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>🌐 Utility & Multi-Chain Expansion</h2>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            GBTC is built for multi-chain interoperability and real-world DeFi use cases:
        </p>
        
        <div class="feature">
            <h4>1. Wrapped Bitcoin (wBTC-style)</h4>
            <p>GBTC can be wrapped and bridged to multiple chains (Ethereum, Solana, BSC, Polygon, etc.), enabling cross-chain liquidity and maximum flexibility.</p>
        </div>
        
        <div class="feature">
            <h4>2. DeFi Integration</h4>
            <p>GBTC can be staked, farmed, or provided as liquidity on decentralized exchanges. Earn additional rewards through various DeFi protocols.</p>
        </div>
        
        <div class="feature">
            <h4>3. Bridge Utility</h4>
            <p>Seamlessly move GBTC between chains for optimal trading, staking, and yield farming opportunities across the entire crypto ecosystem.</p>
        </div>
        
        <div class="feature">
            <h4>4. BTC Relationship</h4>
            <p>GBTC mirrors Bitcoin's scarcity model but is 10x rarer (2.1M vs 21M supply). It serves as a complementary asset alongside BTC, optimized for faster adoption in DeFi.</p>
        </div>
    </div>
    
    <div class="section">
        <h2>⚡ Core Technology</h2>
        
        <div class="feature-grid">
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
                    <li>24 blocks per day</li>
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
            
            <div class="feature">
                <h4>Direct Referral Network</h4>
                <ul>
                    <li>10% USDT commission</li>
                    <li>Instant reward distribution</li>
                    <li>Single-tier transparency</li>
                    <li>Build your mining network</li>
                </ul>
            </div>
        </div>
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
        <h2>🚀 Platform Features</h2>
        
        <h3>Hash Power Acquisition</h3>
        <p>Purchase computational power directly with USDT to begin mining immediately. Your hash power determines your share of block rewards.</p>
        
        <div class="formula">
            Mining Rewards = (Your Hash Power ÷ Network Hash Power) × Block Reward
        </div>
        
        <h3>Active Mining Protocol</h3>
        <p>Our 24-hour claim system ensures network vitality by requiring miners to actively participate. This prevents resource hoarding and maintains fair distribution among engaged participants.</p>
        
        <h3>GBTC Token Utility</h3>
        <ul>
            <li><span class="highlight">Mining Rewards:</span> Earn GBTC through proportional block reward distribution</li>
            <li><span class="highlight">Peer-to-Peer Transfers:</span> Send and receive GBTC directly between users</li>
            <li><span class="highlight">Future Gas Token:</span> Planned integration as network transaction fee currency</li>
            <li><span class="highlight">DeFi Integration:</span> Stake, farm, and provide liquidity across multiple chains</li>
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

        {/* Token Supply Parameters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-black border-[#f7931a]/20">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Coins className="w-6 h-6 text-[#f7931a] mr-2" />
                <h2 className="text-2xl font-bold text-[#f7931a]">Token Supply Parameters</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#333]">
                      <th className="text-left py-2 text-[#f7931a]">Parameter</th>
                      <th className="text-right py-2 text-[#f7931a]">Value</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-[#333]/50">
                      <td className="py-3">Maximum Supply</td>
                      <td className="text-right font-bold text-[#fbbf24]">2,100,000 GBTC</td>
                    </tr>
                    <tr className="border-b border-[#333]/50">
                      <td className="py-3">Block Time</td>
                      <td className="text-right text-[#fbbf24]">1 hour</td>
                    </tr>
                    <tr className="border-b border-[#333]/50">
                      <td className="py-3">Blocks per Day</td>
                      <td className="text-right text-[#fbbf24]">24</td>
                    </tr>
                    <tr className="border-b border-[#333]/50">
                      <td className="py-3">Halving Interval</td>
                      <td className="text-right text-[#fbbf24]">4,200 blocks (~6 months)</td>
                    </tr>
                    <tr>
                      <td className="py-3">Initial Block Reward</td>
                      <td className="text-right font-bold text-[#fbbf24]">50 GBTC</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Block Rewards & Halving Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-black border-[#f7931a]/20">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Zap className="w-6 h-6 text-[#f7931a] mr-2" />
                <h2 className="text-2xl font-bold text-[#f7931a]">Block Rewards & Halving Schedule</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#333]">
                      <th className="text-left py-2 text-[#f7931a]">Event</th>
                      <th className="text-center py-2 text-[#f7931a]">Block #</th>
                      <th className="text-center py-2 text-[#f7931a]">Time</th>
                      <th className="text-right py-2 text-[#f7931a]">Reward</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-[#333]/50">
                      <td className="py-2">Launch</td>
                      <td className="text-center">0</td>
                      <td className="text-center">Month 0</td>
                      <td className="text-right font-bold text-[#fbbf24]">50 GBTC</td>
                    </tr>
                    <tr className="border-b border-[#333]/50">
                      <td className="py-2">1st Halving</td>
                      <td className="text-center">4,200</td>
                      <td className="text-center">~6 months</td>
                      <td className="text-right text-[#fbbf24]">25 GBTC</td>
                    </tr>
                    <tr className="border-b border-[#333]/50">
                      <td className="py-2">2nd Halving</td>
                      <td className="text-center">8,400</td>
                      <td className="text-center">~12 months</td>
                      <td className="text-right text-[#fbbf24]">12.5 GBTC</td>
                    </tr>
                    <tr className="border-b border-[#333]/50">
                      <td className="py-2">3rd Halving</td>
                      <td className="text-center">12,600</td>
                      <td className="text-center">~18 months</td>
                      <td className="text-right text-gray-400">6.25 GBTC</td>
                    </tr>
                    <tr>
                      <td className="py-2">4th Halving</td>
                      <td className="text-center">16,800</td>
                      <td className="text-center">~24 months</td>
                      <td className="text-right text-gray-400">3.125 GBTC</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p className="text-xs text-gray-400 mt-4">
                Halving continues every 4,200 blocks until max supply is reached
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Supply Release Curve */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-black border-[#f7931a]/20">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="w-6 h-6 text-[#f7931a] mr-2" />
                <h2 className="text-2xl font-bold text-[#f7931a]">Supply Release Curve</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Year 1</span>
                    <span className="text-sm font-bold text-[#fbbf24]">~315,000 GBTC</span>
                  </div>
                  <div className="w-full bg-[#1a1a1a] rounded-full h-3">
                    <div className="bg-gradient-to-r from-[#f7931a] to-[#fbbf24] h-3 rounded-full" style={{width: '15%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Year 2</span>
                    <span className="text-sm font-bold text-[#fbbf24]">~393,750 GBTC</span>
                  </div>
                  <div className="w-full bg-[#1a1a1a] rounded-full h-3">
                    <div className="bg-gradient-to-r from-[#f7931a] to-[#fbbf24] h-3 rounded-full" style={{width: '19%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Year 5</span>
                    <span className="text-sm font-bold text-[#fbbf24]">~1,000,000 GBTC</span>
                  </div>
                  <div className="w-full bg-[#1a1a1a] rounded-full h-3">
                    <div className="bg-gradient-to-r from-[#f7931a] to-[#fbbf24] h-3 rounded-full" style={{width: '48%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Year 10+</span>
                    <span className="text-sm font-bold text-[#f7931a]">2,100,000 GBTC</span>
                  </div>
                  <div className="w-full bg-[#1a1a1a] rounded-full h-3">
                    <div className="bg-gradient-to-r from-[#f7931a] to-[#fbbf24] h-3 rounded-full" style={{width: '100%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Launch Timeline (TGE) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-black border-[#f7931a]/20">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Rocket className="w-6 h-6 text-[#f7931a] mr-2" />
                <h2 className="text-2xl font-bold text-[#f7931a]">Launch Timeline (TGE)</h2>
              </div>
              
              <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#f7931a]/30 mb-4">
                <p className="text-sm text-gray-300 mb-2">
                  Token Generation Event will occur when we reach:
                </p>
                <p className="text-2xl font-bold text-[#f7931a]">
                  100K - 1M Verified Participants
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Ensuring strong community adoption and network stability
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-[#f7931a]/20 flex items-center justify-center mr-3 mt-1">
                    <span className="text-[#f7931a] font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="text-[#fbbf24] font-semibold mb-1">Mining Phase</h4>
                    <p className="text-xs text-gray-400">Users accumulate rewards before TGE</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-[#f7931a]/20 flex items-center justify-center mr-3 mt-1">
                    <span className="text-[#f7931a] font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="text-[#fbbf24] font-semibold mb-1">TGE Milestone</h4>
                    <p className="text-xs text-gray-400">Official GBTC release at network milestone</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-[#f7931a]/20 flex items-center justify-center mr-3 mt-1">
                    <span className="text-[#f7931a] font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="text-[#fbbf24] font-semibold mb-1">Withdrawals Enabled</h4>
                    <p className="text-xs text-gray-400">Transfer tokens to wallets or exchanges</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Utility & Multi-Chain Expansion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="bg-black border-[#f7931a]/20">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Network className="w-6 h-6 text-[#f7931a] mr-2" />
                <h2 className="text-2xl font-bold text-[#f7931a]">Utility & Multi-Chain Expansion</h2>
              </div>
              
              <div className="space-y-4">
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333]">
                  <div className="flex items-center mb-2">
                    <ChevronRight className="w-5 h-5 text-[#fbbf24] mr-2" />
                    <h3 className="font-semibold text-[#fbbf24]">Wrapped Bitcoin Style</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    Bridge to Ethereum, Solana, BSC, Polygon for cross-chain liquidity
                  </p>
                </div>
                
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333]">
                  <div className="flex items-center mb-2">
                    <ChevronRight className="w-5 h-5 text-[#fbbf24] mr-2" />
                    <h3 className="font-semibold text-[#fbbf24]">DeFi Integration</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    Stake, farm, and provide liquidity on decentralized exchanges
                  </p>
                </div>
                
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333]">
                  <div className="flex items-center mb-2">
                    <ChevronRight className="w-5 h-5 text-[#fbbf24] mr-2" />
                    <h3 className="font-semibold text-[#fbbf24]">Bridge Utility</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    Seamlessly move GBTC between chains for maximum flexibility
                  </p>
                </div>
                
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333]">
                  <div className="flex items-center mb-2">
                    <ChevronRight className="w-5 h-5 text-[#fbbf24] mr-2" />
                    <h3 className="font-semibold text-[#fbbf24]">BTC Relationship</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    10x rarer than Bitcoin (2.1M vs 21M), optimized for DeFi adoption
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Core Technology */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="bg-black border-[#f7931a]/20">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Cpu className="w-6 h-6 text-[#f7931a] mr-2" />
                <h2 className="text-2xl font-bold text-[#f7931a]">Core Technology</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333]">
                  <div className="flex items-center mb-2">
                    <Hash className="w-5 h-5 text-[#fbbf24] mr-2" />
                    <h3 className="font-semibold text-[#fbbf24]">Smart Mining</h3>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Distributed hash power</li>
                    <li>• Proportional rewards</li>
                    <li>• Real-time adjustments</li>
                    <li>• Automated operations</li>
                  </ul>
                </div>
                
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333]">
                  <div className="flex items-center mb-2">
                    <Clock className="w-5 h-5 text-[#fbbf24] mr-2" />
                    <h3 className="font-semibold text-[#fbbf24]">Block Cycles</h3>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• 24 blocks per day</li>
                    <li>• Reset at 00:00 UTC</li>
                    <li>• Continuous height</li>
                    <li>• Predictable schedule</li>
                  </ul>
                </div>
                
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333]">
                  <div className="flex items-center mb-2">
                    <Shield className="w-5 h-5 text-[#fbbf24] mr-2" />
                    <h3 className="font-semibold text-[#fbbf24]">Security</h3>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Username identity</li>
                    <li>• 6-digit PIN</li>
                    <li>• Zero-knowledge</li>
                    <li>• Full anonymity</li>
                  </ul>
                </div>
                
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333]">
                  <div className="flex items-center mb-2">
                    <Users className="w-5 h-5 text-[#fbbf24] mr-2" />
                    <h3 className="font-semibold text-[#fbbf24]">Referral Network</h3>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• 10% USDT commission</li>
                    <li>• Instant rewards</li>
                    <li>• Single-tier system</li>
                    <li>• Build your network</li>
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
          transition={{ duration: 0.5, delay: 0.8 }}
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
                    Purchase computational power directly with USDT to begin mining immediately.
                  </p>
                  <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#f7931a]/50">
                    <p className="text-center font-mono text-[#fbbf24]">
                      Rewards = (Your Hash ÷ Network Hash) × Block Reward
                    </p>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <Activity className="w-5 h-5 text-[#fbbf24] mr-2" />
                    <h3 className="text-lg font-semibold text-[#fbbf24]">Active Mining Protocol</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    24-hour claim system ensures network vitality. Active participation prevents resource hoarding and maintains fair distribution.
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <Coins className="w-5 h-5 text-[#fbbf24] mr-2" />
                    <h3 className="text-lg font-semibold text-[#fbbf24]">GBTC Token Utility</h3>
                  </div>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>• <span className="text-[#f7931a]">Mining Rewards:</span> Proportional distribution</li>
                    <li>• <span className="text-[#f7931a]">P2P Transfers:</span> Direct user transactions</li>
                    <li>• <span className="text-[#f7931a]">DeFi Integration:</span> Multi-chain staking & farming</li>
                    <li>• <span className="text-[#f7931a]">Future Gas Token:</span> Network fee currency</li>
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
          transition={{ duration: 0.5, delay: 0.9 }}
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
                  <h4 className="text-[#fbbf24] font-semibold text-sm mb-1">Zero Hardware</h4>
                  <p className="text-gray-500 text-xs">No rigs, cooling, or maintenance</p>
                </div>
                
                <div className="bg-[#1a1a1a] p-3 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-[#fbbf24] mb-2" />
                  <h4 className="text-[#fbbf24] font-semibold text-sm mb-1">Predictable Returns</h4>
                  <p className="text-gray-500 text-xs">Transparent real-time monitoring</p>
                </div>
                
                <div className="bg-[#1a1a1a] p-3 rounded-lg">
                  <Globe className="w-5 h-5 text-[#fbbf24] mb-2" />
                  <h4 className="text-[#fbbf24] font-semibold text-sm mb-1">Global Access</h4>
                  <p className="text-gray-500 text-xs">Mine anywhere, 24/7 operations</p>
                </div>
                
                <div className="bg-[#1a1a1a] p-3 rounded-lg">
                  <Users className="w-5 h-5 text-[#fbbf24] mb-2" />
                  <h4 className="text-[#fbbf24] font-semibold text-sm mb-1">Community Growth</h4>
                  <p className="text-gray-500 text-xs">Mining & referral rewards</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Download Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <Button 
            onClick={downloadWhitepaper}
            className="w-full bg-gradient-to-r from-[#f7931a] to-[#fbbf24] hover:from-[#fbbf24] hover:to-[#f7931a] text-black font-bold py-6"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Full Whitepaper
          </Button>
        </motion.div>
      </div>
    </div>
  );
}