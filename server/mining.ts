import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import cron from "node-cron";

let dailyBlockNumber = 1; // Daily block counter (resets to 1 at 00:00 UTC)
let totalBlockHeight = 0; // Total blocks mined (never resets)
let currentBlockReward = 50;
let lastResetDate: string | null = null;

export function setupMining() {
  // Initialize block reward from database (non-blocking)
  initializeSettings().catch(err => {
    console.log('Mining initialization will retry automatically');
  });
  
  // Generate a new block AND distribute rewards every hour
  cron.schedule("0 * * * *", async () => {
    await generateBlock();
    await distributeRewards();
  });
  
  // Daily reset at 00:00 UTC
  cron.schedule("0 0 * * *", async () => {
    await dailyReset();
  });
  
  // Check for reset on startup
  checkAndPerformDailyReset();
}

async function checkAndPerformDailyReset() {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  try {
    const lastResetSetting = await storage.getSystemSetting("lastResetDate");
    if (lastResetSetting && lastResetSetting.value !== today) {
      await dailyReset();
    } else if (!lastResetSetting) {
      await storage.setSystemSetting("lastResetDate", today);
      lastResetDate = today;
    }
  } catch (error) {
    console.error("Error checking daily reset:", error);
  }
}

async function dailyReset() {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    console.log(`Performing daily block reset at ${new Date().toISOString()}`);
    
    // Reset daily block number to 1
    dailyBlockNumber = 1;
    await storage.setSystemSetting("blockNumber", dailyBlockNumber.toString());
    
    // Update last reset date
    await storage.setSystemSetting("lastResetDate", today);
    lastResetDate = today;
    
    console.log(`Daily reset complete. Block counter reset to 1. Total blocks: ${totalBlockHeight}`);
  } catch (error) {
    console.error("Error during daily reset:", error);
  }
}

async function initializeSettings() {
  let retries = 3;
  
  while (retries > 0) {
    try {
      // Load block reward
      const blockRewardSetting = await storage.getSystemSetting("blockReward");
      if (blockRewardSetting) {
        currentBlockReward = parseFloat(blockRewardSetting.value);
      } else {
        await storage.setSystemSetting("blockReward", currentBlockReward.toString());
      }

      // Load daily block number
      const blockNumberSetting = await storage.getSystemSetting("blockNumber");
      if (blockNumberSetting) {
        dailyBlockNumber = parseInt(blockNumberSetting.value);
      } else {
        await storage.setSystemSetting("blockNumber", dailyBlockNumber.toString());
      }
      
      // Load total block height
      const totalBlockHeightSetting = await storage.getSystemSetting("totalBlockHeight");
      if (totalBlockHeightSetting) {
        totalBlockHeight = parseInt(totalBlockHeightSetting.value);
      } else {
        await storage.setSystemSetting("totalBlockHeight", totalBlockHeight.toString());
      }
      
      // Check and perform daily reset if needed
      await checkAndPerformDailyReset();
      
      console.log(`Mining initialized: Daily Block ${dailyBlockNumber}, Total Height ${totalBlockHeight}, Reward ${currentBlockReward} GBTC`);
      return; // Success, exit retry loop
      
    } catch (error: any) {
      retries--;
      if (error?.message?.includes('endpoint has been disabled') || error?.code === 'XX000') {
        console.log(`Database is reactivating... Retrying in 5 seconds (${3 - retries}/3)`);
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }
      }
      
      console.error("Error initializing mining settings:", error.message || error);
      if (retries === 0) {
        console.log("Mining will use default settings until database is available");
      }
    }
  }
}

async function generateBlock() {
  try {
    const totalHashPower = await storage.getTotalHashPower();
    
    if (parseFloat(totalHashPower) > 0) {
      await storage.createMiningBlock(
        dailyBlockNumber,
        currentBlockReward.toString(),
        totalHashPower
      );
      
      // Increment both counters
      dailyBlockNumber++;
      totalBlockHeight++;
      
      // Save to database
      await storage.setSystemSetting("blockNumber", dailyBlockNumber.toString());
      await storage.setSystemSetting("totalBlockHeight", totalBlockHeight.toString());
      
      console.log(`Block #${dailyBlockNumber - 1} (Total: ${totalBlockHeight}) mined with reward ${currentBlockReward} GBTC`);
      
      // Check for halving every 2 years (17,520 blocks at 1 hour per block)
      if (totalBlockHeight % 17520 === 0) {
        await halveBlockReward();
      }
    }
  } catch (error: any) {
    if (error?.message?.includes('endpoint has been disabled') || error?.code === 'XX000') {
      console.log('Database temporarily unavailable for block generation, will retry next cycle');
    } else {
      console.error("Error generating block:", error);
    }
  }
}

async function distributeRewards() {
  try {
    const totalHashPower = await storage.getTotalHashPower();
    const totalHashPowerNum = parseFloat(totalHashPower);
    
    if (totalHashPowerNum === 0) return;
    
    // Get the current block reward from settings
    const blockRewardSetting = await storage.getSystemSetting("blockReward");
    if (blockRewardSetting) {
      currentBlockReward = parseFloat(blockRewardSetting.value);
    }
    
    const currentBlock = dailyBlockNumber - 1;
    console.log(`Block ${currentBlock} distributing ${currentBlockReward} GBTC across ${totalHashPowerNum} TH/s`);
    
    // Get all users with hash power
    const allUsers = await db.select().from(users);
    
    // Filter users who are eligible for rewards (active in mining)
    const eligibleUsers = allUsers.filter(u => {
      const hashPower = parseFloat(u.hashPower || "0");
      const lastActiveBlock = u.lastActiveBlock;
      
      // User must have hash power
      if (hashPower <= 0) return false;
      
      // For strict participation: user must have been active in the previous block
      // If lastActiveBlock is null/undefined, they haven't participated yet
      // If lastActiveBlock is less than currentBlock - 1, they missed the previous block
      if (lastActiveBlock === undefined || lastActiveBlock === null) {
        // New miners must wait for next block
        return false;
      }
      
      // User must have been active in recent blocks (within last 2 blocks for some leniency)
      if (lastActiveBlock < currentBlock - 2) {
        return false;
      }
      
      return true;
    });
    
    // Recalculate total eligible hash power
    const eligibleHashPower = eligibleUsers.reduce((sum, u) => sum + parseFloat(u.hashPower || "0"), 0);
    
    if (eligibleHashPower === 0) {
      console.log(`No eligible miners for block ${currentBlock}`);
      return;
    }
    
    // Create unclaimed blocks for each eligible user based on their hash power share
    for (const user of eligibleUsers) {
      const userHashPower = parseFloat(user.hashPower || "0");
      const userShare = userHashPower / eligibleHashPower;
      const userReward = (currentBlockReward * userShare).toFixed(8);
      
      if (parseFloat(userReward) > 0.00000001) { // Only create block if reward is meaningful
        // Generate transaction hash
        const txHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        
        // Create unclaimed block for this user with the current block number
        await storage.createUnclaimedBlock(
          user.id,
          currentBlock,
          txHash,
          userReward
        );
      }
    }
    
    // Update referral hash contributions after distribution
    await updateReferralHashContributions();
    
    // Expire old blocks
    await storage.expireOldBlocks();
  } catch (error: any) {
    if (error?.message?.includes('endpoint has been disabled') || error?.code === 'XX000') {
      console.log('Database temporarily unavailable for reward distribution, will retry next cycle');
    } else {
      console.error("Error distributing rewards:", error);
    }
  }
}

// Function to update referral hash contributions
async function updateReferralHashContributions() {
  try {
    const allUsers = await storage.getAllUsers();
    
    // For each user, calculate their referral hash bonus from active referrals
    for (const user of allUsers) {
      if (!user.referralCode) continue;
      
      const referredUsers = await storage.getUsersByReferralCode(user.referralCode);
      let totalReferralBonus = 0;
      
      for (const referred of referredUsers) {
        // Check if referred user is active (has hash power and has claimed recently)
        const isActive = parseFloat(referred.baseHashPower || "0") > 0 && 
                        referred.lastActiveBlock !== undefined && 
                        referred.lastActiveBlock !== null &&
                        referred.lastActiveBlock >= dailyBlockNumber - 3; // Active within last 3 blocks
        
        if (isActive) {
          // Add 5% of their base hash power as bonus
          totalReferralBonus += parseFloat(referred.baseHashPower || "0") * 0.05;
        }
      }
      
      // Update user's referral hash bonus and total hash power
      const newReferralBonus = totalReferralBonus.toFixed(2);
      const totalHashPower = (parseFloat(user.baseHashPower || "0") + totalReferralBonus).toFixed(2);
      
      await storage.updateUser(user.id, {
        referralHashBonus: newReferralBonus,
        hashPower: totalHashPower
      });
    }
  } catch (error) {
    console.error("Error updating referral hash contributions:", error);
  }
}

export async function halveBlockReward() {
  try {
    currentBlockReward = currentBlockReward / 2;
    await storage.setSystemSetting("blockReward", currentBlockReward.toString());
    console.log(`Block reward halved to ${currentBlockReward} GBTC at total block ${totalBlockHeight}`);
    return currentBlockReward;
  } catch (error) {
    console.error("Error halving block reward:", error);
    throw error;
  }
}