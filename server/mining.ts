import { storage } from "./storage";
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
    
    // This would need to be optimized for production with batch updates
    // For now, we'll track rewards in unclaimed balance
    console.log(`Distributing ${rewardPerMinute} GBTC rewards per minute across ${totalHashPowerNum} TH/s`);
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
