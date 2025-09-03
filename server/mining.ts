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
    // Silent retry
  });
  
  // Generate a new block AND distribute rewards every 5 minutes for testing
  // Change back to "0 * * * *" for production (hourly)
  cron.schedule("*/5 * * * *", async () => {
    // Block generation running
    await generateBlock();
    await distributeRewards();
  });
  
  // Daily reset at 00:00 UTC
  cron.schedule("0 0 * * *", async () => {
    await dailyReset();
  });
  
  // Check for reset on startup
  checkAndPerformDailyReset();
  
  // Generate an initial block after 2 seconds to kickstart the system
  setTimeout(async () => {
    // Initial block generation
    await generateBlock();
    await distributeRewards();
  }, 2000); // Faster startup
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
    
    // Daily reset
    
    // Reset daily block number to 1
    dailyBlockNumber = 1;
    await storage.setSystemSetting("blockNumber", dailyBlockNumber.toString());
    
    // Update last reset date
    await storage.setSystemSetting("lastResetDate", today);
    lastResetDate = today;
    
    // Reset complete
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
    const MAX_SUPPLY = 2100000; // 2.1M GBTC max supply
    const HALVING_INTERVAL = 4200; // Blocks between halvings
    
    // Check if max supply has been reached
    const totalMined = await storage.getTotalMinedSupply();
    const totalMinedNum = parseFloat(totalMined);
    
    if (totalMinedNum >= MAX_SUPPLY) {
      // Max supply reached
      return;
    }
    
    // Check if adding current block reward would exceed max supply
    if (totalMinedNum + currentBlockReward > MAX_SUPPLY) {
      // Adjust the final block reward to exactly reach max supply
      currentBlockReward = MAX_SUPPLY - totalMinedNum;
      await storage.setSystemSetting("blockReward", currentBlockReward.toString());
      // Final block adjustment
    }
    
    const totalHashPower = await storage.getTotalHashPower();
    
    if (parseFloat(totalHashPower) > 0 && currentBlockReward > 0) {
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
      
      // Block mined successfully
      
      // Check for halving every 6 months (4,200 blocks at 1 hour per block)
      if (totalBlockHeight % HALVING_INTERVAL === 0 && currentBlockReward > 0) {
        await halveBlockReward();
      }
    }
  } catch (error: any) {
    if (error?.message?.includes('endpoint has been disabled') || error?.code === 'XX000') {
      // Database temporarily unavailable
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
    // Distributing block rewards
    
    // Get all users from storage interface (works with both memory and database)
    const allUsers = await storage.getAllUsers();
    
    // Filter users who are eligible for rewards (have hash power)
    const eligibleUsers = allUsers.filter(u => {
      const hashPower = parseFloat(u.hashPower || "0");
      
      // User must have hash power to be eligible
      return hashPower > 0;
    });
    
    // Recalculate total eligible hash power
    const eligibleHashPower = eligibleUsers.reduce((sum, u) => sum + parseFloat(u.hashPower || "0"), 0);
    
    if (eligibleHashPower === 0) {
      // No eligible miners
      return;
    }
    
    // Processing eligible miners
    
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
        
        // Reward created
      }
    }
    
    // No longer update referral hash contributions since we removed hash bonus
    
    // Expire old blocks
    await storage.expireOldBlocks();
  } catch (error: any) {
    if (error?.message?.includes('endpoint has been disabled') || error?.code === 'XX000') {
      // Database temporarily unavailable
    } else {
      console.error("Error distributing rewards:", error);
    }
  }
}


export async function halveBlockReward() {
  try {
    const MAX_SUPPLY = 2100000; // 2.1M GBTC max supply
    const totalMined = await storage.getTotalMinedSupply();
    const totalMinedNum = parseFloat(totalMined);
    
    // Don't halve if we've reached max supply
    if (totalMinedNum >= MAX_SUPPLY) {
      currentBlockReward = 0;
      await storage.setSystemSetting("blockReward", "0");
      // Max supply reached
      return 0;
    }
    
    // Halve the block reward
    currentBlockReward = currentBlockReward / 2;
    
    // Ensure we have at least minimal precision
    if (currentBlockReward < 0.00000001) {
      currentBlockReward = 0;
    }
    
    await storage.setSystemSetting("blockReward", currentBlockReward.toString());
    console.log(`Block reward halved to ${currentBlockReward} GBTC at total block ${totalBlockHeight}`);
    console.log(`Halving #${Math.floor(totalBlockHeight / 4200)} completed`);
    return currentBlockReward;
  } catch (error) {
    console.error("Error halving block reward:", error);
    throw error;
  }
}