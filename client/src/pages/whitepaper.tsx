import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Download, Bitcoin, Users, Coins, TrendingUp, Shield, Zap, Award, Activity, Globe, Target, Sparkles, AlertTriangle, Key } from "lucide-react";
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
                Fair Mining Through Real Hash Power Investment
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Version 2.0 | September 2025
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Critical Warning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mobile-card bg-destructive/10 border-destructive/30">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-destructive mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-bold text-destructive mb-2">CRITICAL SECURITY NOTICE</h2>
                <p className="text-sm text-muted-foreground font-semibold mb-2">
                  NOT YOUR KEYS, NOT YOUR COINS!
                </p>
                <p className="text-sm text-muted-foreground">
                  Green Bitcoin operates on a principle of absolute security. Your account is protected by 
                  a username and 6-digit PIN combination. If you forget either credential, there is 
                  <strong className="text-destructive"> NO RECOVERY OPTION</strong>. Your account and all 
                  assets will be permanently inaccessible. This is by design to ensure maximum security 
                  and prevent unauthorized access. Write down your credentials and store them safely.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Executive Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="mobile-card bg-black/50 border-primary/20">
            <div className="flex items-center mb-3">
              <Target className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-primary">Executive Summary</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Green Bitcoin (GBTC) is a revolutionary mining platform that ensures fair distribution through 
              real hash power investment. Unlike traditional mining or cloud mining services, GBTC rewards 
              are distributed purely based on purchased hash power, making it impossible for bots or multiple 
              accounts to gain unfair advantages. Every user must actively claim their rewards within 24 hours 
              to maintain mining activity, ensuring only engaged participants receive rewards.
            </p>
          </Card>
        </motion.div>

        {/* Fair Mining Philosophy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="mobile-card bg-black/50 border-primary/20">
            <div className="flex items-center mb-3">
              <Shield className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-primary">Fair Mining Philosophy</h2>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <h3 className="text-sm font-semibold text-orange-500 mb-1">No Free Mining</h3>
                <p className="text-sm text-muted-foreground">
                  Mining rewards are distributed ONLY based on purchased hash power. No registration bonuses, 
                  no free mining, no advantages for early adopters. Your investment determines your rewards.
                </p>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Anti-Bot Protection</h3>
                <p className="text-sm text-muted-foreground">
                  Creating multiple accounts provides zero advantage. Each account must purchase hash power 
                  separately to earn rewards. Bots cannot exploit the system as there's no way to earn without 
                  real USDT investment.
                </p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Self-Effort Based</h3>
                <p className="text-sm text-muted-foreground">
                  Success depends entirely on personal investment and activity. No one can mine for free, 
                  ensuring fair competition among all participants.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Authentication System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="mobile-card bg-black/50 border-primary/20">
            <div className="flex items-center mb-3">
              <Key className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-primary">Authentication System</h2>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Simple & Secure</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Username: Your unique identifier and referral code</li>
                  <li>• 6-Digit PIN: Your secure access code</li>
                  <li>• No email or phone number required</li>
                  <li>• Complete anonymity and privacy</li>
                </ul>
              </div>
              <div className="p-3 bg-destructive/10 rounded-lg">
                <h3 className="text-sm font-semibold text-destructive mb-1">⚠️ No Recovery System</h3>
                <p className="text-sm text-muted-foreground">
                  Following the principle "Not Your Keys, Not Your Coins" - if you forget your username 
                  or PIN, your account is permanently lost. There is no password reset, no recovery 
                  questions, no support intervention possible. This ensures maximum security but requires 
                  responsible credential management.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* GBTC Token Economics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
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
                  <p className="text-muted-foreground text-xs">Daily Blocks</p>
                  <p className="font-bold text-accent">144 Blocks</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Distribution Formula</h3>
                <div className="bg-black/30 p-2 rounded">
                  <p className="font-mono text-xs text-accent">
                    Your Reward = (Your Hash Power ÷ Total Network Hash Power) × Block Reward
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Hash Power System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="mobile-card bg-black/50 border-primary/20">
            <div className="flex items-center mb-3">
              <Activity className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-primary">Hash Power System</h2>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Purchase & Mining</h3>
                <p className="text-sm text-muted-foreground">
                  Hash power represents your mining capability in the network. Higher hash power means 
                  larger share of block rewards. You must purchase hash power with USDT to start mining.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Pricing Structure</h3>
                <div className="space-y-2">
                  <div className="bg-black/30 p-2 rounded flex justify-between text-sm">
                    <span className="text-muted-foreground">Starter</span>
                    <span className="text-accent font-bold">$10 - $99 USDT</span>
                  </div>
                  <div className="bg-black/30 p-2 rounded flex justify-between text-sm">
                    <span className="text-muted-foreground">Professional</span>
                    <span className="text-accent font-bold">$100 - $999 USDT</span>
                  </div>
                  <div className="bg-black/30 p-2 rounded flex justify-between text-sm">
                    <span className="text-muted-foreground">Enterprise</span>
                    <span className="text-accent font-bold">$1000+ USDT</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <h3 className="text-sm font-semibold text-warning mb-1">⚠️ 24-Hour Claim Rule</h3>
                <p className="text-sm text-muted-foreground">
                  You must claim your mined blocks within 24 hours or your mining will STOP. 
                  This ensures only active users receive rewards and prevents abandoned accounts 
                  from diluting the reward pool.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Direct Miners Referral System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="mobile-card bg-black/50 border-primary/20">
            <div className="flex items-center mb-3">
              <Users className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-primary">Direct Miners System</h2>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Single-Level Referral Only</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  You earn rewards ONLY from users you directly invite. No multi-level marketing, 
                  no pyramid structure. Simple and transparent.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your username is your referral code</li>
                  <li>• Direct invites become your "miners"</li>
                  <li>• No indirect or second-level rewards</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Commission Structure</h3>
                <div className="space-y-2">
                  <div className="bg-black/30 p-3 rounded">
                    <p className="text-xs text-primary font-semibold mb-1">USDT Commission: 15%</p>
                    <p className="text-sm text-muted-foreground">
                      When your direct miner purchases hash power, you instantly receive 15% of their 
                      purchase amount in USDT. Example: They buy $100 worth, you get $15 USDT.
                    </p>
                  </div>
                  <div className="bg-black/30 p-3 rounded">
                    <p className="text-xs text-primary font-semibold mb-1">Hash Power Contribution: 5%</p>
                    <p className="text-sm text-muted-foreground">
                      When your miners are actively mining, 5% of their hash power contributes to 
                      your total hash power, increasing your mining rewards.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <h3 className="text-sm font-semibold text-accent mb-1">Commission Withdrawals</h3>
                <p className="text-sm text-muted-foreground">
                  USDT commissions can be withdrawn anytime or used to purchase your own hash power. 
                  This is the only way to earn without personal investment.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Mining Operations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="mobile-card bg-black/50 border-primary/20">
            <div className="flex items-center mb-3">
              <Zap className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-primary">Mining Operations</h2>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Automatic Mining Process</h3>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Purchase hash power with USDT</li>
                  <li>Mining starts automatically</li>
                  <li>New block generated every 10 minutes</li>
                  <li>Rewards distributed proportionally</li>
                  <li>Claim rewards within 24 hours to continue</li>
                </ol>
              </div>
              <div className="p-3 bg-destructive/10 rounded-lg">
                <h3 className="text-sm font-semibold text-destructive mb-1">Mining Stop Conditions</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Not claiming rewards within 24 hours</li>
                  <li>• Zero hash power (no investment)</li>
                  <li>• Account suspension for rule violations</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Reward Calculation Example</h3>
                <div className="bg-black/30 p-3 rounded text-sm text-muted-foreground">
                  <p className="mb-2">Network Total: 10,000 GH/s</p>
                  <p className="mb-2">Your Hash Power: 100 GH/s (1%)</p>
                  <p className="mb-2">Block Reward: 6.25 GBTC</p>
                  <p className="font-semibold text-accent">Your Reward: 0.0625 GBTC per block</p>
                  <p className="text-xs mt-2">Daily: 0.0625 × 144 blocks = 9 GBTC</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* USDT Operations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <Card className="mobile-card bg-black/50 border-primary/20">
            <div className="flex items-center mb-3">
              <Coins className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-primary">USDT Operations</h2>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Deposits</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Minimum deposit: $10 USDT</li>
                  <li>• Used to purchase hash power</li>
                  <li>• Instant processing after admin approval</li>
                  <li>• Multiple deposit methods supported</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Withdrawals</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Only referral commissions can be withdrawn</li>
                  <li>• Minimum withdrawal: $50 USDT</li>
                  <li>• Processing time: 24-48 hours</li>
                  <li>• GBTC tokens cannot be withdrawn until exchange listing</li>
                </ul>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <h3 className="text-sm font-semibold text-warning mb-1">Important Note</h3>
                <p className="text-sm text-muted-foreground">
                  Deposited USDT used for hash power purchases cannot be withdrawn. Only referral 
                  commissions earned in USDT are withdrawable. This ensures mining commitment.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Security Measures */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <Card className="mobile-card bg-black/50 border-primary/20">
            <div className="flex items-center mb-3">
              <Shield className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-primary">Security & Anti-Fraud</h2>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Account Security</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Unique username + 6-digit PIN authentication</li>
                  <li>• No recovery options for maximum security</li>
                  <li>• Session-based authentication</li>
                  <li>• Automatic logout on inactivity</li>
                </ul>
              </div>
              <div className="p-3 bg-destructive/10 rounded-lg">
                <h3 className="text-sm font-semibold text-destructive mb-1">Fraud Prevention</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Fake deposit = permanent account ban</li>
                  <li>• All transactions verified on blockchain</li>
                  <li>• Admin approval for deposits/withdrawals</li>
                  <li>• Multiple account creation provides no benefit</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Fair Play Enforcement</h3>
                <p className="text-sm text-muted-foreground">
                  The system is designed to be unexploitable. Since mining rewards depend entirely 
                  on purchased hash power, creating multiple accounts or using bots provides zero 
                  advantage. Each account must invest separately to earn.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Roadmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          <Card className="mobile-card bg-black/50 border-primary/20">
            <div className="flex items-center mb-3">
              <TrendingUp className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-primary">Development Phases</h2>
            </div>
            <div className="space-y-3">
              <div className="border-l-2 border-primary/30 pl-4 space-y-4">
                <div>
                  <p className="text-xs text-primary font-semibold">Phase 1: Mining Launch</p>
                  <p className="text-sm text-muted-foreground">
                    • Platform launch with core mining features<br/>
                    • Hash power marketplace active<br/>
                    • Direct referral system operational<br/>
                    • 24-hour claiming requirement enforced
                  </p>
                </div>
                <div>
                  <p className="text-xs text-primary font-semibold">Phase 2: Growth (Current)</p>
                  <p className="text-sm text-muted-foreground">
                    • Expanding user base through referrals<br/>
                    • Mining optimization and improvements<br/>
                    • Community building and education<br/>
                    • Reaching 25% of total supply mined
                  </p>
                </div>
                <div>
                  <p className="text-xs text-primary font-semibold">Phase 3: Exchange Listing (At 25% Mined)</p>
                  <p className="text-sm text-muted-foreground">
                    • GBTC token becomes tradeable<br/>
                    • Exchange partnerships established<br/>
                    • External withdrawals enabled<br/>
                    • Market price discovery begins
                  </p>
                </div>
                <div>
                  <p className="text-xs text-primary font-semibold">Phase 4: Ecosystem Expansion</p>
                  <p className="text-sm text-muted-foreground">
                    • Additional use cases for GBTC<br/>
                    • Partnership integrations<br/>
                    • Advanced trading features<br/>
                    • Continued mining until max supply
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Important Rules Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <Card className="mobile-card bg-black/50 border-primary/20">
            <div className="flex items-center mb-3">
              <AlertTriangle className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-primary">Critical Rules Summary</h2>
            </div>
            <div className="space-y-2">
              <div className="p-2 bg-destructive/10 rounded text-sm">
                <strong className="text-destructive">1. No Recovery:</strong>
                <span className="text-muted-foreground ml-2">Lost credentials = lost account forever</span>
              </div>
              <div className="p-2 bg-warning/10 rounded text-sm">
                <strong className="text-warning">2. 24-Hour Rule:</strong>
                <span className="text-muted-foreground ml-2">Claim daily or mining stops</span>
              </div>
              <div className="p-2 bg-primary/10 rounded text-sm">
                <strong className="text-primary">3. Fair Mining:</strong>
                <span className="text-muted-foreground ml-2">Only purchased hash power earns rewards</span>
              </div>
              <div className="p-2 bg-accent/10 rounded text-sm">
                <strong className="text-accent">4. Direct Referrals:</strong>
                <span className="text-muted-foreground ml-2">15% USDT + 5% hash power from direct invites only</span>
              </div>
              <div className="p-2 bg-destructive/10 rounded text-sm">
                <strong className="text-destructive">5. No Fake Deposits:</strong>
                <span className="text-muted-foreground ml-2">Instant permanent ban for fraud</span>
              </div>
              <div className="p-2 bg-primary/10 rounded text-sm">
                <strong className="text-primary">6. No Multi-Accounts:</strong>
                <span className="text-muted-foreground ml-2">Multiple accounts provide zero advantage</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Legal Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.3 }}
        >
          <Card className="mobile-card bg-black/50 border-primary/20">
            <div className="flex items-center mb-3">
              <Shield className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-primary">Legal Disclaimer</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This whitepaper is for informational purposes only. Cryptocurrency investments carry 
              inherent risks. Green Bitcoin operates on principles of fair mining through real investment. 
              The platform does not guarantee profits and past performance does not indicate future results. 
              Users are responsible for their investment decisions and credential management. The no-recovery 
              policy is absolute and non-negotiable. By participating, users accept all terms and conditions 
              including the risk of permanent loss if credentials are forgotten.
            </p>
          </Card>
        </motion.div>

        {/* Final Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
        >
          <Card className="mobile-card bg-gradient-to-br from-orange-500/10 to-yellow-600/10 border-orange-400/30">
            <div className="text-center">
              <h2 className="text-lg font-bold text-primary mb-3">Join Fair Mining Revolution</h2>
              <p className="text-sm text-muted-foreground mb-2">
                Success through personal investment and effort
              </p>
              <p className="text-xs text-warning font-semibold mb-4">
                Remember: Write down your credentials safely!
              </p>
              <Link to="/mining">
                <Button className="bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 text-white font-bold">
                  Start Mining Now
                </Button>
              </Link>
              <div className="mt-4 text-xs text-muted-foreground">
                <p>© 2025 Green Bitcoin (GBTC)</p>
                <p>Fair Mining Through Real Investment</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}