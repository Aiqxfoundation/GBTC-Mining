import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import cron from "node-cron";

let blockNumber = 1;
let currentBlockReward = 6.25;

export function setupMining() {
  // Initialize block reward from database
  initializeSettings();
  
  // Generate a new block every 10 minutes (for demo purposes)
  cron.schedule("*/10 * * * *", async () => {
    await generateBlock();
  });
  
  // Distribute rewards every minute
  cron.schedule("* * * * *", async () => {
    await distributeRewards();
  });
}

async function initializeSettings() {
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
  } catch (error) {
    console.error("Error initializing mining settings:", error);
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
  } catch (error) {
    console.error("Error generating block:", error);
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
    
    // Calculate rewards per minute (block time is 10 minutes)
    const rewardPerMinute = currentBlockReward / 10;
    
    console.log(`Distributing ${rewardPerMinute} GBTC rewards per minute across ${totalHashPowerNum} TH/s`);
    
    // Get all users with hash power
    const allUsers = await db.select().from(users);
    const usersWithPower = allUsers.filter(u => parseFloat(u.hashPower) > 0);
    
    // Create unclaimed blocks for each user based on their hash power share
    for (const user of usersWithPower) {
      const userHashPower = parseFloat(user.hashPower);
      const userShare = userHashPower / totalHashPowerNum;
      const userReward = (rewardPerMinute * userShare).toFixed(8);
      
      if (parseFloat(userReward) > 0) {
        // Generate transaction hash
        const txHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        
        // Create unclaimed block for this user
        await storage.createUnclaimedBlock(
          user.id,
          blockNumber,
          txHash,
          userReward
        );
      }
    }
    
    // Expire old blocks
    await storage.expireOldBlocks();
  } catch (error) {
    console.error("Error distributing rewards:", error);
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
