import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import cron from "node-cron";

let blockNumber = 1;
let currentBlockReward = 6.25;

export function setupMining() {
  // Initialize block reward from database (non-blocking)
  initializeSettings().catch(err => {
    console.log('Mining initialization will retry automatically');
  });
  
  // Generate a new block AND distribute rewards every 10 minutes
  cron.schedule("*/10 * * * *", async () => {
    await generateBlock();
    await distributeRewards();
  });
}

async function initializeSettings() {
  let retries = 3;
  
  while (retries > 0) {
    try {
      const blockRewardSetting = await storage.getSystemSetting("blockReward");
      if (blockRewardSetting) {
        currentBlockReward = parseFloat(blockRewardSetting.value);
      } else {
        await storage.setSystemSetting("blockReward", currentBlockReward.toString());
      }

      const blockNumberSetting = await storage.getSystemSetting("blockNumber");
      if (blockNumberSetting) {
        blockNumber = parseInt(blockNumberSetting.value);
      } else {
        await storage.setSystemSetting("blockNumber", blockNumber.toString());
      }
      
      console.log(`Mining settings initialized: Block ${blockNumber}, Reward ${currentBlockReward} GBTC`);
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
        blockNumber,
        currentBlockReward.toString(),
        totalHashPower
      );
      
      blockNumber++;
      await storage.setSystemSetting("blockNumber", blockNumber.toString());
      
      console.log(`Block ${blockNumber - 1} mined with reward ${currentBlockReward} GBTC`);
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
    
    console.log(`Block ${blockNumber - 1} distributing ${currentBlockReward} GBTC across ${totalHashPowerNum} TH/s`);
    
    // Get all users with hash power
    const allUsers = await db.select().from(users);
    const usersWithPower = allUsers.filter(u => parseFloat(u.hashPower || "0") > 0);
    
    // Create unclaimed blocks for each user based on their hash power share
    for (const user of usersWithPower) {
      const userHashPower = parseFloat(user.hashPower || "0");
      const userShare = userHashPower / totalHashPowerNum;
      const userReward = (currentBlockReward * userShare).toFixed(8);
      
      if (parseFloat(userReward) > 0.00000001) { // Only create block if reward is meaningful
        // Generate transaction hash
        const txHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        
        // Create unclaimed block for this user with the current block number
        await storage.createUnclaimedBlock(
          user.id,
          blockNumber - 1, // Use the block that was just mined
          txHash,
          userReward
        );
      }
    }
    
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

export async function halveBlockReward() {
  try {
    currentBlockReward = currentBlockReward / 2;
    await storage.setSystemSetting("blockReward", currentBlockReward.toString());
    console.log(`Block reward halved to ${currentBlockReward} GBTC`);
    return currentBlockReward;
  } catch (error) {
    console.error("Error halving block reward:", error);
    throw error;
  }
}
