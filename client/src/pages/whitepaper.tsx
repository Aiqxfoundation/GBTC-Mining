import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Download, Bitcoin, Users, Coins, TrendingUp, Shield, Zap, Award, Activity, Globe, Target, Sparkles, AlertTriangle, Key } from "lucide-react";
import { motion } from "framer-motion";

export default function Whitepaper() {
  const downloadWhitepaper = () => {
    // Create the whitepaper content as HTML
    const content = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Green Bitcoin (GBTC) Whitepaper</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
        h1 { color: #f97316; border-bottom: 3px solid #f97316; padding-bottom: 10px; }
        h2 { color: #ea580c; margin-top: 30px; }
        h3 { color: #dc2626; }
        .vision { font-size: 48px; font-weight: bold; color: #f97316; text-align: center; margin: 40px 0; letter-spacing: 3px; }
        .warning { background: #fee2e2; border: 2px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .info { background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; margin: 10px 0; border-radius: 5px; }
        .section { margin: 20px 0; }
        ul { margin: 10px 0; }
        .formula { background: #f3f4f6; padding: 10px; font-family: monospace; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>GREEN BITCOIN (GBTC) WHITEPAPER</h1>
    <p><strong>Version 2.0 | September 2025</strong></p>
    
    <div class="vision">OUR VISION</div>
    
    <div class="section">
        <p>GBTC will be used as a native gas fee token for decentralized mining infrastructure. We are NOT competing with Bitcoin or its values. We are here to empower miners and create digital infrastructure for those who can't afford expensive rigs or handle machine operations and maintenance fees.</p>
        
        <p>Bitcoin mining is no longer profitable for small miners due to reduced rewards and heavy competition from corporations and large-scale industrial operations. We chose to remain anonymous to ensure this system remains fair for everyone.</p>
        
        <p>We make GBTC transferable for users to send, receive, and trade personally. This project is for visionary people - not financial advice for everybody. Let's put our efforts, invest, and build something together to achieve our goals.</p>
        
        <p><strong>Grow your network hash. Grow with decentralized mining.</strong></p>
    </div>
    
    <div class="warning">
        <h2>⚠️ CRITICAL SECURITY NOTICE</h2>
        <p>Green Bitcoin operates on a principle of absolute security. Your account is protected by a username and 6-digit PIN combination. If you forget either credential, there is <strong>NO RECOVERY OPTION</strong>. Your account and all assets will be permanently inaccessible. This is by design to ensure maximum security and prevent unauthorized access. Write down your credentials and store them safely.</p>
    </div>
    
    <div class="section">
        <h2>GBTC Token Economics</h2>
        <ul>
            <li><strong>Max Supply:</strong> 21,000,000 GBTC</li>
            <li><strong>Block Reward:</strong> 6.25 GBTC (halves every 210,000 blocks)</li>
            <li><strong>Block Time:</strong> 10 Minutes</li>
            <li><strong>Daily Blocks:</strong> 144 Blocks (resets at 00:00 UTC)</li>
            <li><strong>Daily Block Reset:</strong> Block counter resets to #1 every day at 00:00 UTC</li>
            <li><strong>Total Block Height:</strong> Cumulative count of all blocks ever mined</li>
        </ul>
        
        <h3>Distribution Formula</h3>
        <div class="formula">
            Your Reward = (Your Hash Power ÷ Total Network Hash Power) × Block Reward
        </div>
    </div>
    
    <div class="section">
        <h2>Hash Power System</h2>
        <h3>Purchase & Mining</h3>
        <p>Hash power represents your mining capability in the network. Higher hash power means larger share of block rewards. You must purchase hash power with USDT to start mining.</p>
        
        <div class="warning">
            <h3>24-Hour Claim Rule</h3>
            <p>You must claim your mined blocks within 24 hours or your mining will STOP. This ensures only active users receive rewards and prevents abandoned accounts from diluting the reward pool.</p>
        </div>
    </div>
    
    <div class="section">
        <h2>Direct Miners System</h2>
        <h3>Single-Level Referral Only</h3>
        <p>You earn rewards ONLY from users you directly invite. No multi-level marketing, no pyramid structure. Simple and transparent.</p>
        <ul>
            <li>Your username is your referral code</li>
            <li>Direct invites become your "miners"</li>
            <li>No indirect or second-level rewards</li>
        </ul>
        
        <h3>Commission Structure</h3>
        <div class="info">
            <p><strong>USDT Commission: 15%</strong><br>
            When your direct miner purchases hash power, you instantly receive 15% of their purchase amount in USDT.</p>
        </div>
        <div class="info">
            <p><strong>Hash Power Contribution: 5%</strong><br>
            When your miners are actively mining, 5% of their hash power contributes to your total hash power. If they stop mining (inactive), their contribution is automatically removed from your hash power.</p>
        </div>
        <div class="warning">
            <p><strong>Active Mining Requirement:</strong><br>
            To participate in block rewards, users must have claimed rewards from the previous block. New miners must wait for the next block to start earning rewards. This ensures fair distribution among active participants.</p>
        </div>
    </div>
    
    <div class="section">
        <h2>Mining Operations</h2>
        <h3>Daily Block Reset System</h3>
        <p>Every day at 00:00 UTC, the daily block counter resets to Block #1 while the total blockchain height continues counting. This creates a 24-hour mining cycle of 144 blocks.</p>
        <ul>
            <li>Daily blocks: #1 to #144 (resets at midnight UTC)</li>
            <li>Total height: Cumulative count (never resets)</li>
            <li>Block rewards: 6.25 GBTC per block until halving</li>
            <li>Halving schedule: Every 210,000 total blocks</li>
        </ul>
        
        <h3>Automatic Mining Process</h3>
        <ol>
            <li>Purchase hash power with USDT</li>
            <li>Wait for next block to start participating</li>
            <li>New block generated every 10 minutes</li>
            <li>Rewards distributed to active miners only</li>
            <li>Must have claimed previous block to participate</li>
            <li>Claim rewards within 24 hours to continue</li>
        </ol>
        
        <h3>Active Participation Rules</h3>
        <ul>
            <li>New miners must wait for the next block to start earning</li>
            <li>Must claim previous block rewards to participate in new blocks</li>
            <li>Inactive miners are excluded from reward distribution</li>
            <li>Referral hash contributions removed when referrals become inactive</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>USDT Operations</h2>
        <h3>Deposits</h3>
        <ul>
            <li>Minimum deposit: $10 USDT</li>
            <li>Used to purchase hash power</li>
            <li>Instant processing after system verification</li>
        </ul>
        
        <h3>Withdrawals</h3>
        <ul>
            <li>Only referral commissions can be withdrawn</li>
            <li>Minimum withdrawal: $50 USDT</li>
            <li>Processing time: 24-48 hours</li>
            <li>GBTC tokens transferable between users</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>Security & Fair Play</h2>
        <h3>Account Security</h3>
        <ul>
            <li>Unique username + 6-digit PIN authentication</li>
            <li>No recovery options for maximum security</li>
            <li>Session-based authentication</li>
            <li>Automatic logout on inactivity</li>
        </ul>
        
        <h3>Fraud Prevention</h3>
        <ul>
            <li>Fake deposit = permanent account ban</li>
            <li>All transactions verified on blockchain</li>
            <li>System verification for all deposits/withdrawals</li>
            <li>Multiple account creation provides no benefit</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>Disclaimer</h2>
        <p>This project is for visionary people who understand the potential of decentralized mining. This is not financial advice. Participation involves risk. Never invest more than you can afford to lose. The value of GBTC tokens is determined by the community and market. Always conduct your own research before participating.</p>
    </div>
    
    <div class="section">
        <p><strong>© 2025 Green Bitcoin. All Rights Reserved.</strong></p>
        <p>Decentralized Mining for Everyone</p>
    </div>
</body>
</html>`;
    
    // Create a Blob from the content
    const blob = new Blob([content], { type: 'text/html' });
    
    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Whitepaper.html';
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

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
          onClick={downloadWhitepaper}
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
                Decentralized Mining for Everyone
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Version 2.0 | September 2025
              </p>
            </div>
          </Card>
        </motion.div>

        {/* OUR VISION Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <Card className="mobile-card bg-gradient-to-br from-primary/20 to-accent/20 border-primary/30">
            <h1 className="text-4xl font-display font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-600 mb-4">
              OUR VISION
            </h1>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                GBTC will be used as a native gas fee token for decentralized mining infrastructure. We are NOT competing with Bitcoin or its values. We are here to empower miners and create digital infrastructure for those who can't afford expensive rigs or handle machine operations and maintenance fees.
              </p>
              <p>
                Bitcoin mining is no longer profitable for small miners due to reduced rewards and heavy competition from corporations and large-scale industrial operations. We chose to remain anonymous to ensure this system remains fair for everyone.
              </p>
              <p>
                We make GBTC transferable for users to send, receive, and trade personally. This project is for visionary people - not financial advice for everybody. Let's put our efforts, invest, and build something together to achieve our goals.
              </p>
              <p className="font-bold text-primary text-center text-base">
                Grow your network hash. Grow with decentralized mining.
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
                  If you forget your username 
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
                  <p className="text-xs text-muted-foreground">(Halves every 210K blocks)</p>
                </div>
                <div className="bg-black/30 p-2 rounded">
                  <p className="text-muted-foreground text-xs">Block Time</p>
                  <p className="font-bold text-accent">10 Minutes</p>
                </div>
                <div className="bg-black/30 p-2 rounded">
                  <p className="text-muted-foreground text-xs">Daily Blocks</p>
                  <p className="font-bold text-accent">144 Blocks</p>
                  <p className="text-xs text-muted-foreground">(Resets at 00:00 UTC)</p>
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
                      your total hash power. This bonus is dynamic - if they stop claiming blocks, 
                      their contribution is automatically removed from your hash power.
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
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Daily Block Reset Cycle</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Every day at 00:00 UTC, the daily block counter resets to Block #1 while the total 
                  blockchain height continues counting. This creates a 24-hour mining cycle of 144 blocks.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Daily blocks: #1 to #144 (resets at midnight UTC)</li>
                  <li>• Total height: Cumulative count (never resets)</li>
                  <li>• Block rewards: 6.25 GBTC per block until halving</li>
                  <li>• Halving schedule: Every 210,000 total blocks</li>
                </ul>
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-orange-500 mb-1">Automatic Mining Process</h3>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Purchase hash power with USDT</li>
                  <li>Wait for next block to start participating</li>
                  <li>New block generated every 10 minutes</li>
                  <li>Rewards distributed to active miners only</li>
                  <li>Must have claimed previous block to participate</li>
                  <li>Claim rewards within 24 hours to continue</li>
                </ol>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <h3 className="text-sm font-semibold text-warning mb-1">Active Participation Rules</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• New miners must wait for the next block to start earning</li>
                  <li>• Must claim previous block rewards to participate in new blocks</li>
                  <li>• Inactive miners are excluded from reward distribution</li>
                  <li>• Referral hash contributions removed when referrals become inactive</li>
                </ul>
              </div>
              <div className="p-3 bg-destructive/10 rounded-lg mt-3">
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
                  <li>• Instant processing after system verification</li>
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
                  <li>• System verification for deposits/withdrawals</li>
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
                    • Continuous network growth
                  </p>
                </div>
                <div>
                  <p className="text-xs text-primary font-semibold">Phase 3: Ecosystem Expansion</p>
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