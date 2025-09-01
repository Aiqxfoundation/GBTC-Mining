import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Download, Bitcoin, Users, Coins, TrendingUp, Shield, Zap, Award, Activity, Globe, Target, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Whitepaper() {
  return (
    <div className="mobile-page bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Header */}
      <div className="mobile-header bg-black/80 backdrop-blur-lg border-b border-primary/20">
        <Link to="/mining">
          <Button variant="ghost" size="sm" className="text-primary">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="text-xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          WHITEPAPER
        </h1>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary"
          onClick={() => window.print()}
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>

      <div className="mobile-content space-y-4">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mobile-card bg-gradient-to-br from-orange-500/10 to-yellow-600/10 border-orange-400/30">
            <div className="text-center">
              <Bitcoin className="w-16 h-16 mx-auto mb-4 text-orange-500" />
              <h1 className="text-2xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-600 mb-2">
                GREEN BITCOIN (GBTC)
              </h1>
              <p className="text-sm text-muted-foreground">
                The Future of Sustainable Bitcoin Mining
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Version 1.0 | September 2025
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Executive Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mobile-card bg-black/50 border-primary/20">
            <div className="flex items-center mb-3">
              <Target className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-primary">Executive Summary</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Green Bitcoin (GBTC) revolutionizes cryptocurrency mining through an innovative simulation platform 
              that democratizes access to Bitcoin mining rewards. By eliminating the need for expensive hardware 
              and excessive energy consumption, GBTC creates a sustainable ecosystem where users can participate 
              in mining through hash power purchases, earning rewards proportional to their network contribution.
            </p>
          </Card>
        </motion.div>

        {/* Vision & Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="mobile-card bg-black/50 border-primary/20">
            <div className="flex items-center mb-3">
              <Sparkles className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-primary">Vision & Mission</h2>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Our Vision</h3>
                <p className="text-sm text-muted-foreground">
                  To become the leading sustainable Bitcoin mining platform, making cryptocurrency mining 
                  accessible to everyone while maintaining environmental responsibility.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Our Mission</h3>
                <p className="text-sm text-muted-foreground">
                  Democratize Bitcoin mining by providing a user-friendly platform that simulates real 
                  mining operations, distributes rewards fairly, and promotes sustainable practices.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Core Technology */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="mobile-card bg-black/50 border-primary/20">
            <div className="flex items-center mb-3">
              <Zap className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-primary">Core Technology</h2>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Mining Simulation Engine</h3>
                <p className="text-sm text-muted-foreground">
                  Our advanced simulation engine generates new blocks every 10 minutes, mirroring Bitcoin's 
                  actual block time. The system automatically calculates and distributes rewards based on 
                  each user's hash power contribution to the network.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Smart Distribution Algorithm</h3>
                <p className="text-sm text-muted-foreground">
                  Rewards are distributed proportionally using the formula: 
                  <span className="font-mono text-xs block mt-1 text-accent">
                    User Reward = (User Hash Power / Total Network Hash Power) × Block Reward
                  </span>
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Real-time Processing</h3>
                <p className="text-sm text-muted-foreground">
                  All mining operations, reward calculations, and distributions happen in real-time, 
                  ensuring transparency and immediate feedback for all participants.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* GBTC Token Economics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="mobile-card bg-black/50 border-primary/20">
            <div className="flex items-center mb-3">
              <Coins className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-primary">GBTC Token Economics</h2>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-black/30 p-2 rounded">
                  <p className="text-muted-foreground text-xs">Max Supply</p>
                  <p className="font-bold text-accent">21,000,000 GBTC</p>
                </div>
                <div className="bg-black/30 p-2 rounded">
                  <p className="text-muted-foreground text-xs">Block Reward</p>
                  <p className="font-bold text-accent">6.25 GBTC</p>
                </div>
                <div className="bg-black/30 p-2 rounded">
                  <p className="text-muted-foreground text-xs">Block Time</p>
                  <p className="font-bold text-accent">10 Minutes</p>
                </div>
                <div className="bg-black/30 p-2 rounded">
                  <p className="text-muted-foreground text-xs">Halving Cycle</p>
                  <p className="font-bold text-accent">210,000 Blocks</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Token Utility</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Mining rewards distribution</li>
                  <li>• Platform transaction currency</li>
                  <li>• Governance participation rights</li>
                  <li>• Staking for additional benefits</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Hash Power System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="mobile-card bg-black/50 border-primary/20">
            <div className="flex items-center mb-3">
              <Activity className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-primary">Hash Power System</h2>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">How It Works</h3>
                <p className="text-sm text-muted-foreground">
                  Users purchase hash power using USDT, which represents their mining capability in the network. 
                  Higher hash power means a larger share of block rewards. Hash power is measured in GH/s 
                  (Gigahashes per second) and directly correlates to mining efficiency.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Pricing Tiers</h3>
                <div className="space-y-2">
                  <div className="bg-black/30 p-2 rounded flex justify-between text-sm">
                    <span className="text-muted-foreground">10 GH/s</span>
                    <span className="text-accent font-bold">$10 USDT</span>
                  </div>
                  <div className="bg-black/30 p-2 rounded flex justify-between text-sm">
                    <span className="text-muted-foreground">100 GH/s</span>
                    <span className="text-accent font-bold">$95 USDT</span>
                  </div>
                  <div className="bg-black/30 p-2 rounded flex justify-between text-sm">
                    <span className="text-muted-foreground">1000 GH/s</span>
                    <span className="text-accent font-bold">$900 USDT</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Mining Rewards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="mobile-card bg-black/50 border-primary/20">
            <div className="flex items-center mb-3">
              <Award className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-primary">Mining Rewards System</h2>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Reward Distribution</h3>
                <p className="text-sm text-muted-foreground">
                  Every 10 minutes, when a new block is mined, the 6.25 GBTC reward is distributed among 
                  all active miners based on their hash power contribution. Rewards are automatically 
                  credited to user wallets.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Claiming Process</h3>
                <p className="text-sm text-muted-foreground">
                  Users can claim their mining rewards at any time. Unclaimed rewards remain available 
                  for 48 hours, after which they are returned to the mining pool for redistribution.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Estimated Earnings</h3>
                <p className="text-sm text-muted-foreground">
                  Daily earnings = (Your Hash Power / Total Network Hash Power) × 144 blocks × 6.25 GBTC
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Referral Program */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="mobile-card bg-black/50 border-primary/20">
            <div className="flex items-center mb-3">
              <Users className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-primary">Referral Program</h2>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Three-Tier Structure</h3>
                <div className="space-y-2">
                  <div className="bg-black/30 p-2 rounded">
                    <p className="text-xs text-muted-foreground">Level 1 (Direct Referrals)</p>
                    <p className="text-sm font-bold text-accent">10% Commission</p>
                  </div>
                  <div className="bg-black/30 p-2 rounded">
                    <p className="text-xs text-muted-foreground">Level 2 (Indirect Referrals)</p>
                    <p className="text-sm font-bold text-accent">5% Commission</p>
                  </div>
                  <div className="bg-black/30 p-2 rounded">
                    <p className="text-xs text-muted-foreground">Level 3 (Third-tier Referrals)</p>
                    <p className="text-sm font-bold text-accent">2% Commission</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Benefits</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Earn USDT commissions from referral deposits</li>
                  <li>• Build passive income through network growth</li>
                  <li>• Track referral performance in real-time</li>
                  <li>• Instant commission credits to wallet</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* USDT Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="mobile-card bg-black/50 border-primary/20">
            <div className="flex items-center mb-3">
              <Coins className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-primary">USDT Integration</h2>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Deposit & Withdrawal</h3>
                <p className="text-sm text-muted-foreground">
                  USDT serves as the primary fiat gateway for the platform. Users can deposit USDT to 
                  purchase hash power and withdraw their earnings or trading profits at any time, 
                  subject to minimum withdrawal limits.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Transaction Limits</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-black/30 p-2 rounded">
                    <p className="text-xs text-muted-foreground">Min Deposit</p>
                    <p className="font-bold text-accent">$10 USDT</p>
                  </div>
                  <div className="bg-black/30 p-2 rounded">
                    <p className="text-xs text-muted-foreground">Min Withdrawal</p>
                    <p className="font-bold text-accent">$50 USDT</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Security & Trust */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <Card className="mobile-card bg-black/50 border-primary/20">
            <div className="flex items-center mb-3">
              <Shield className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-primary">Security & Trust</h2>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Platform Security</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Secure authentication with encrypted passwords</li>
                  <li>• Two-factor authentication support</li>
                  <li>• SSL encryption for all data transmission</li>
                  <li>• Regular security audits and updates</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Fund Safety</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Cold wallet storage for majority of funds</li>
                  <li>• Multi-signature wallet implementation</li>
                  <li>• Daily backup and disaster recovery protocols</li>
                  <li>• Insurance coverage for digital assets</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Roadmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <Card className="mobile-card bg-black/50 border-primary/20">
            <div className="flex items-center mb-3">
              <TrendingUp className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-primary">Development Roadmap</h2>
            </div>
            <div className="space-y-3">
              <div className="border-l-2 border-primary/30 pl-4 space-y-4">
                <div>
                  <p className="text-xs text-primary font-semibold">Q3 2025 - Platform Launch</p>
                  <p className="text-sm text-muted-foreground">
                    • Core mining simulation engine<br/>
                    • User registration and wallet system<br/>
                    • Basic hash power marketplace
                  </p>
                </div>
                <div>
                  <p className="text-xs text-primary font-semibold">Q4 2025 - Feature Expansion</p>
                  <p className="text-sm text-muted-foreground">
                    • Advanced referral system<br/>
                    • Mobile app development<br/>
                    • Enhanced security features
                  </p>
                </div>
                <div>
                  <p className="text-xs text-primary font-semibold">Q1 2026 - Ecosystem Growth</p>
                  <p className="text-sm text-muted-foreground">
                    • GBTC exchange listings<br/>
                    • Staking mechanism implementation<br/>
                    • Partnership integrations
                  </p>
                </div>
                <div>
                  <p className="text-xs text-primary font-semibold">Q2 2026 - Global Expansion</p>
                  <p className="text-sm text-muted-foreground">
                    • Multi-language support<br/>
                    • Regional payment gateways<br/>
                    • Community governance launch
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Team & Advisory */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          <Card className="mobile-card bg-black/50 border-primary/20">
            <div className="flex items-center mb-3">
              <Globe className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-primary">Global Vision</h2>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Green Bitcoin aims to create a global community of miners who can participate in the 
                Bitcoin revolution without the traditional barriers of entry. Our platform bridges the 
                gap between cryptocurrency enthusiasts and mining opportunities.
              </p>
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Key Objectives</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Democratize access to Bitcoin mining</li>
                  <li>• Promote sustainable mining practices</li>
                  <li>• Build a transparent, fair ecosystem</li>
                  <li>• Foster financial inclusion globally</li>
                  <li>• Support blockchain education and adoption</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Legal Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <Card className="mobile-card bg-black/50 border-primary/20">
            <div className="flex items-center mb-3">
              <Shield className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-primary">Legal Disclaimer</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This whitepaper is for informational purposes only and does not constitute financial advice. 
              Cryptocurrency investments carry inherent risks, and past performance does not guarantee 
              future results. Users should conduct their own research and consult with financial advisors 
              before making investment decisions. Green Bitcoin operates in compliance with applicable 
              regulations and reserves the right to modify platform features and tokenomics as needed.
            </p>
          </Card>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.3 }}
        >
          <Card className="mobile-card bg-gradient-to-br from-orange-500/10 to-yellow-600/10 border-orange-400/30">
            <div className="text-center">
              <h2 className="text-lg font-bold text-primary mb-3">Join the Revolution</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Start your sustainable Bitcoin mining journey today
              </p>
              <Link to="/mining">
                <Button className="bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 text-white font-bold">
                  Start Mining Now
                </Button>
              </Link>
              <div className="mt-4 text-xs text-muted-foreground">
                <p>© 2025 Green Bitcoin (GBTC)</p>
                <p>All Rights Reserved</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}