import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { setupMining } from "./mining";
import { storage } from "./storage";
import { insertDepositSchema, insertWithdrawalSchema } from "@shared/schema";
import { z } from "zod";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);
  
  // Setup mining simulation
  setupMining();

  // Deposit routes
  app.post("/api/deposits", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const depositData = insertDepositSchema.parse(req.body);
      const deposit = await storage.createDeposit({
        ...depositData,
        userId: req.user!.id
      });

      res.status(201).json(deposit);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/deposits/pending", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const pendingDeposits = await storage.getPendingDeposits();
      res.json(pendingDeposits);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/deposits/:id/approve", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { actualAmount, adminNote } = req.body;
      // Use actualAmount if provided for verification, otherwise use original amount
      await storage.approveDeposit(req.params.id, adminNote, actualAmount);
      res.json({ message: "Deposit approved" });
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/deposits/:id/reject", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { adminNote } = req.body;
      await storage.rejectDeposit(req.params.id, adminNote);
      res.json({ message: "Deposit rejected" });
    } catch (error) {
      next(error);
    }
  });

  // Check deposit cooldown
  app.get("/api/deposits/cooldown", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const cooldown = await storage.getDepositCooldown(req.user!.id);
      res.json(cooldown);
    } catch (error) {
      next(error);
    }
  });

  // Hash power purchase
  app.post("/api/purchase-power", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { amount } = z.object({ amount: z.number().min(1) }).parse(req.body);
      const user = req.user!;

      if (parseFloat(user.usdtBalance || "0") < amount) {
        return res.status(400).json({ message: "Insufficient USDT balance" });
      }

      const newUsdtBalance = (parseFloat(user.usdtBalance || "0") - amount).toFixed(2);
      const newHashPower = (parseFloat(user.hashPower || "0") + amount).toFixed(2);

      await storage.updateUserBalance(
        user.id, 
        newUsdtBalance, 
        newHashPower, 
        user.gbtcBalance || "0", 
        user.unclaimedBalance || "0"
      );

      res.json({ message: "Hash power purchased successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Claim mining rewards
  app.post("/api/claim-rewards", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = req.user!;
      const unclaimedAmount = parseFloat(user.unclaimedBalance || "0");
      
      if (unclaimedAmount <= 0) {
        return res.status(400).json({ message: "No rewards to claim" });
      }

      const newGbtcBalance = (parseFloat(user.gbtcBalance || "0") + unclaimedAmount).toFixed(8);

      await storage.updateUserBalance(
        user.id,
        user.usdtBalance || "0",
        user.hashPower || "0",
        newGbtcBalance,
        "0.00000000"
      );

      res.json({ message: "Rewards claimed successfully", amount: unclaimedAmount });
    } catch (error) {
      next(error);
    }
  });

  // Withdrawal request - now requires admin approval
  app.post("/api/withdrawals", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const withdrawalData = insertWithdrawalSchema.parse(req.body);
      const user = req.user!;
      
      // Check which currency is being withdrawn based on network
      const isUSDT = withdrawalData.network === 'ERC20' || withdrawalData.network === 'BSC' || withdrawalData.network === 'TRC20';
      const amount = parseFloat(withdrawalData.amount);
      
      // Only check if user has sufficient balance, don't deduct yet
      if (isUSDT) {
        const usdtBalance = parseFloat(user.usdtBalance || "0");
        if (usdtBalance < amount) {
          return res.status(400).json({ message: "Insufficient USDT balance" });
        }
      } else {
        const gbtcBalance = parseFloat(user.gbtcBalance || "0");
        if (gbtcBalance < amount) {
          return res.status(400).json({ message: "Insufficient GBTC balance" });
        }
      }

      // Create withdrawal request with pending status
      const withdrawal = await storage.createWithdrawal({
        ...withdrawalData,
        userId: user.id
      });

      res.status(201).json({
        ...withdrawal,
        message: "Withdrawal request submitted. Awaiting admin approval."
      });
    } catch (error) {
      next(error);
    }
  });

  // Get pending withdrawals for admin
  app.get("/api/withdrawals/pending", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const pendingWithdrawals = await storage.getPendingWithdrawals();
      res.json(pendingWithdrawals);
    } catch (error) {
      next(error);
    }
  });

  // Approve withdrawal
  app.patch("/api/withdrawals/:id/approve", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { txHash } = req.body;
      await storage.approveWithdrawal(req.params.id, txHash);
      res.json({ message: "Withdrawal approved and processed" });
    } catch (error) {
      next(error);
    }
  });

  // Reject withdrawal  
  app.patch("/api/withdrawals/:id/reject", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.rejectWithdrawal(req.params.id);
      res.json({ message: "Withdrawal rejected" });
    } catch (error) {
      next(error);
    }
  });

  // Check withdrawal cooldown  
  app.get("/api/withdrawals/cooldown", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const cooldown = await storage.getWithdrawalCooldown(req.user!.id);
      res.json(cooldown);
    } catch (error) {
      next(error);
    }
  });

  // Get user's transactions (deposits, withdrawals, transfers)
  app.get("/api/transactions", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user!.id;
      
      // Get all deposits
      const deposits = await storage.getUserDeposits(userId);
      
      // Get all withdrawals  
      const withdrawals = await storage.getUserWithdrawals(userId);
      
      // Get all transfers (sent and received)
      const sentTransfers = await storage.getSentTransfers(userId);
      const receivedTransfers = await storage.getReceivedTransfers(userId);
      
      res.json({
        deposits,
        withdrawals,
        sentTransfers,
        receivedTransfers
      });
    } catch (error) {
      next(error);
    }
  });

  // Admin stats
  app.get("/api/admin/stats", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userCount = await storage.getUserCount();
      const totalDeposits = await storage.getTotalDeposits();
      const totalWithdrawals = await storage.getTotalWithdrawals();
      const totalHashPower = await storage.getTotalHashPower();

      res.json({
        userCount,
        totalDeposits,
        totalWithdrawals,
        totalHashPower
      });
    } catch (error) {
      next(error);
    }
  });

  // Get all users for admin
  app.get("/api/admin/users", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  // Update user balances
  app.patch("/api/admin/users/:userId/balances", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { usdtBalance, gbtcBalance, hashPower } = req.body;
      await storage.updateUserBalances(req.params.userId, {
        usdtBalance,
        gbtcBalance,
        hashPower
      });
      
      res.json({ message: "User balances updated successfully" });
    } catch (error) {
      next(error);
    }
  });

  // System settings
  app.get("/api/settings/:key", async (req, res, next) => {
    try {
      const setting = await storage.getSystemSetting(req.params.key);
      res.json(setting);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/settings", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { key, value } = z.object({
        key: z.string(),
        value: z.string()
      }).parse(req.body);

      await storage.setSystemSetting(key, value);
      res.json({ message: "Setting updated" });
    } catch (error) {
      next(error);
    }
  });

  // User management
  app.patch("/api/users/:id/freeze", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.freezeUser(req.params.id);
      res.json({ message: "User frozen" });
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/users/:id/unfreeze", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.unfreezeUser(req.params.id);
      res.json({ message: "User unfrozen" });
    } catch (error) {
      next(error);
    }
  });
  
  // Get global mining stats
  app.get("/api/global-stats", async (req, res, next) => {
    try {
      const totalHashPower = await storage.getTotalHashPower();
      const blockHeight = await storage.getSystemSetting("blockNumber");
      const activeMiners = await storage.getActiveMinerCount();
      const blockReward = await storage.getSystemSetting("blockReward");
      
      const currentBlock = blockHeight ? parseInt(blockHeight.value) : 1;
      const currentReward = blockReward ? parseFloat(blockReward.value) : 6.25;
      
      // Calculate total blocks mined (current block - 1 since block numbering starts at 1)
      const totalBlocksMined = Math.max(currentBlock - 1, 0);
      
      // Calculate circulation based on blocks mined and halving schedule
      // Bitcoin halving every 210,000 blocks: 50 -> 25 -> 12.5 -> 6.25 -> 3.125
      let totalCirculation = 0;
      let tempBlocks = totalBlocksMined;
      let tempReward = 50;
      
      while (tempBlocks > 0 && tempReward > 0) {
        const blocksInThisEra = Math.min(tempBlocks, 210000);
        totalCirculation += blocksInThisEra * tempReward;
        tempBlocks -= blocksInThisEra;
        tempReward = tempReward / 2;
      }
      
      res.json({
        totalHashrate: parseFloat(totalHashPower),
        blockHeight: currentBlock,
        totalBlocksMined: totalBlocksMined,
        circulation: totalCirculation,
        currentBlockReward: currentReward,
        activeMiners: activeMiners
      });
    } catch (error) {
      next(error);
    }
  });

  // Get unclaimed blocks for user
  app.get("/api/unclaimed-blocks", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const blocks = await storage.getUnclaimedBlocks(req.user!.id);
      res.json(blocks);
    } catch (error) {
      next(error);
    }
  });
  
  // Claim a block
  app.post("/api/claim-block", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { blockId } = req.body;
      const result = await storage.claimBlock(blockId, req.user!.id);
      
      if (!result.success) {
        return res.status(400).json({ message: "Unable to claim block" });
      }
      
      res.json({ 
        message: "Block claimed successfully",
        reward: result.reward 
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Claim all blocks at once
  app.post("/api/claim-all-blocks", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const result = await storage.claimAllBlocks(req.user!.id);
      
      if (result.count === 0) {
        return res.status(400).json({ message: "No blocks to claim" });
      }
      
      res.json({ 
        message: "All blocks claimed successfully",
        count: result.count,
        totalReward: result.totalReward 
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Change PIN endpoint
  app.post("/api/change-pin", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { currentPin, newPin } = req.body;
      const userId = req.user!.id;

      // Get current user to verify PIN
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current PIN
      const scryptAsync = promisify(scrypt);
      const [hashed, salt] = user.password.split(".");
      const hashedBuf = Buffer.from(hashed, "hex");
      const suppliedBuf = (await scryptAsync(currentPin, salt, 64)) as Buffer;
      
      if (!timingSafeEqual(hashedBuf, suppliedBuf)) {
        return res.status(400).json({ message: "Current PIN is incorrect" });
      }

      // Hash new PIN
      const newSalt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync(newPin, newSalt, 64)) as Buffer;
      const newHashedPassword = `${buf.toString("hex")}.${newSalt}`;

      // Update password in storage
      await storage.updateUser(userId, { password: newHashedPassword });

      res.json({ message: "PIN changed successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Get referral data
  app.get("/api/referrals", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user!.id;
      const username = req.user!.username;

      // Mock referral data for now
      const referralData = {
        referralCode: username.toUpperCase() + "REF",
        totalReferrals: 0,
        activeReferrals: 0,
        totalEarnings: "0.00",
        referrals: []
      };

      res.json(referralData);
    } catch (error) {
      next(error);
    }
  });
  
  // Transfer GBTC
  app.post("/api/transfer", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { toUsername, amount } = req.body;
      
      if (!toUsername || !amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Invalid transfer details" });
      }
      
      const transfer = await storage.createTransfer(req.user!.id, toUsername, amount);
      res.json({ 
        message: "Transfer successful",
        transfer 
      });
    } catch (error: any) {
      if (error.message.includes('not found') || error.message.includes('Insufficient')) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  });
  
  // Get miners status
  app.get("/api/my-miners", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const minersWithUsers = await storage.getMinersStatus();
      
      // Calculate total hash power and format response
      const miners = minersWithUsers.map(m => ({
        id: m.user.id,
        username: m.user.username,
        hashPower: parseFloat(m.user.hashPower || "0"),
        lastClaimTime: m.lastClaimTime,
        isActive: m.isActive,
        totalClaims: m.totalClaims,
        missedClaims: m.missedClaims
      }));
      
      const totalHashPower = miners.reduce((sum, m) => sum + m.hashPower, 0);
      
      res.json({ 
        miners,
        totalHashPower 
      });
    } catch (error) {
      next(error);
    }
  });

  // Global statistics endpoint
  app.get("/api/global-stats", async (req, res, next) => {
    try {
      const [
        userCount,
        totalDeposits,
        activeMinerCount,
        totalHashPower,
        latestBlock,
        blockReward,
        totalSupply
      ] = await Promise.all([
        storage.getUserCount(),
        storage.getTotalDeposits(),
        storage.getActiveMinerCount(),
        storage.getTotalHashPower(),
        storage.getLatestBlock(),
        storage.getSystemSetting('blockReward'),
        storage.getSystemSetting('totalSupply')
      ]);

      // Calculate circulating supply based on block number and reward
      const currentBlockNumber = latestBlock?.blockNumber || 1;
      const rewardPerBlock = parseFloat(blockReward?.value || '6.25');
      const circulatingSupply = currentBlockNumber * rewardPerBlock;
      const maxSupply = parseFloat(totalSupply?.value || '21000000');
      
      // Calculate network statistics
      const totalHashPowerNum = parseFloat(totalHashPower || '0');
      let hashRateDisplay = '0 MH/s';
      if (totalHashPowerNum >= 1000000) {
        hashRateDisplay = `${(totalHashPowerNum / 1000000).toFixed(2)} PH/s`;
      } else if (totalHashPowerNum >= 1000) {
        hashRateDisplay = `${(totalHashPowerNum / 1000).toFixed(2)} TH/s`;
      } else if (totalHashPowerNum > 0) {
        hashRateDisplay = `${totalHashPowerNum.toFixed(2)} GH/s`;
      }
      
      // Calculate blocks today (blocks in last 24 hours)
      const blocksPerDay = 144; // Bitcoin-style: 1 block per 10 minutes
      const currentHour = new Date().getHours();
      const blocksToday = Math.floor((currentHour / 24) * blocksPerDay);
      
      res.json({
        userCount,
        totalDeposits,
        activeMinerCount,
        totalHashPower: totalHashPowerNum,
        hashRateDisplay,
        blockHeight: currentBlockNumber,
        blockReward: rewardPerBlock,
        circulatingSupply,
        maxSupply,
        supplyProgress: (circulatingSupply / maxSupply) * 100,
        blocksToday,
        networkDifficulty: totalHashPowerNum > 0 ? `${(totalHashPowerNum / 1000).toFixed(2)}T` : '0T',
        blockTime: '10 min',
        nextHalving: currentBlockNumber > 210000 ? 420000 : 210000,
        halvingProgress: (currentBlockNumber % 210000) / 210000 * 100
      });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
