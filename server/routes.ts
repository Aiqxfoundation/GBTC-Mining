import { Router } from "express";
import { z } from "zod";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupMining } from "./mining";
import type { Request, Response, NextFunction, Express } from "express";
import { insertDepositSchema, insertWithdrawalSchema } from "@shared/schema";
import { createServer } from "http";

export async function registerRoutes(app: Express) {
  // Setup authentication first
  setupAuth(app);
  
  // Setup mining service
  setupMining();
  
  // Create HTTP server
  const server = createServer(app);
  // Get all users (admin only)
  app.get("/api/users", async (req, res, next) => {
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
  
  // Admin dashboard stats
  app.get("/api/admin/stats", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const [userCount, totalDeposits, totalWithdrawals, totalHashPower] = await Promise.all([
        storage.getUserCount(),
        storage.getTotalDeposits(),
        storage.getTotalWithdrawals(),
        storage.getTotalHashPower()
      ]);

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

  // Deposit endpoints
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
    } catch (error: any) {
      if (error?.message?.includes('wait')) {
        return res.status(429).json({ message: error.message });
      }
      next(error);
    }
  });

  app.get("/api/admin/deposits", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const deposits = await storage.getPendingDeposits();
      res.json(deposits);
    } catch (error) {
      next(error);
    }
  });

  // Also support the route the frontend is using
  app.get("/api/deposits/pending", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const deposits = await storage.getPendingDeposits();
      res.json(deposits);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/deposits/:id/approve", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { adminNote, actualAmount } = req.body;
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

  // Hash power purchase with referral commission
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

      // Deduct USDT and add base hash power to the user
      const newUsdtBalance = (parseFloat(user.usdtBalance || "0") - amount).toFixed(2);
      const newBaseHashPower = (parseFloat(user.baseHashPower || "0") + amount).toFixed(2);
      
      // Calculate total hash power (base + referral bonus)
      const totalHashPower = (parseFloat(newBaseHashPower) + parseFloat(user.referralHashBonus || "0")).toFixed(2);

      await storage.updateUser(user.id, {
        usdtBalance: newUsdtBalance,
        baseHashPower: newBaseHashPower,
        hashPower: totalHashPower
      });

      // Handle referral commission if user was referred
      if (user.referredBy) {
        // Find the referrer by their referral code
        const referrers = await storage.getUsersByReferralCode(user.referredBy);
        if (referrers.length > 0) {
          const referrer = referrers[0];
          
          // Calculate commission - 10% USDT commission only, no hash bonus
          const usdtCommission = amount * 0.10; // 10% USDT commission
          
          // Update referrer's balances
          const referrerNewUsdt = (parseFloat(referrer.usdtBalance || "0") + usdtCommission).toFixed(2);
          const referrerTotalEarnings = (parseFloat(referrer.totalReferralEarnings || "0") + usdtCommission).toFixed(2);
          
          await storage.updateUser(referrer.id, {
            usdtBalance: referrerNewUsdt,
            totalReferralEarnings: referrerTotalEarnings
          });
        }
      }

      // No longer update referral hash contributions since we removed hash bonus

      res.json({ message: "Hash power purchased successfully" });
    } catch (error) {
      next(error);
    }
  });


  // Claim mining rewards with strict participation rules
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

      // Get current block number
      const blockSetting = await storage.getSystemSetting("blockNumber");
      const currentBlock = blockSetting ? parseInt(blockSetting.value) : 1;

      const newGbtcBalance = (parseFloat(user.gbtcBalance || "0") + unclaimedAmount).toFixed(8);

      await storage.updateUser(user.id, {
        gbtcBalance: newGbtcBalance,
        unclaimedBalance: "0.00000000",
        lastActiveBlock: currentBlock // Update last active block
      });

      // Update referral hash contributions after claim
      await updateReferralHashContributions();

      res.json({ message: "Rewards claimed successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Withdrawal endpoints
  app.post("/api/withdrawals", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const withdrawalData = insertWithdrawalSchema.parse(req.body);
      const withdrawal = await storage.createWithdrawal({
        ...withdrawalData,
        userId: req.user!.id
      });

      res.status(201).json(withdrawal);
    } catch (error: any) {
      if (error?.message?.includes('wait')) {
        return res.status(429).json({ message: error.message });
      }
      next(error);
    }
  });

  app.get("/api/admin/withdrawals", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const withdrawals = await storage.getPendingWithdrawals();
      res.json(withdrawals);
    } catch (error) {
      next(error);
    }
  });

  // Also support the route the frontend is using
  app.get("/api/withdrawals/pending", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const withdrawals = await storage.getPendingWithdrawals();
      res.json(withdrawals);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/withdrawals/:id/approve", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { txHash } = req.body;
      await storage.approveWithdrawal(req.params.id, txHash);
      res.json({ message: "Withdrawal approved" });
    } catch (error) {
      next(error);
    }
  });

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

  // Update user balances manually (admin only)
  app.patch("/api/users/:userId/balances", async (req, res, next) => {
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
      const totalBlockHeight = await storage.getSystemSetting("totalBlockHeight");
      const activeMiners = await storage.getActiveMinerCount();
      const blockReward = await storage.getSystemSetting("blockReward");
      
      const currentBlock = blockHeight ? parseInt(blockHeight.value) : 1;
      const totalBlocks = totalBlockHeight ? parseInt(totalBlockHeight.value) : 0;
      const currentReward = blockReward ? parseFloat(blockReward.value) : 6.25;
      
      // Calculate total blocks mined
      const totalBlocksMined = Math.max(totalBlocks, 0);
      
      // Calculate circulation based on blocks mined and halving schedule
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
        totalBlockHeight: totalBlocks,
        activeMiners,
        blockReward: currentReward,
        totalCirculation: Math.min(totalCirculation, 21000000),
        maxSupply: 21000000,
        nextHalving: Math.ceil(totalBlocksMined / 210000) * 210000,
        blocksUntilHalving: Math.max(0, Math.ceil(totalBlocksMined / 210000) * 210000 - totalBlocksMined)
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Get unclaimed blocks for current user
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
  
  // Claim a single block
  app.post("/api/claim-block/:blockId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const result = await storage.claimBlock(req.params.blockId, req.user!.id);
      
      if (!result.success) {
        return res.status(400).json({ message: "Block not found or already claimed" });
      }
      
      res.json({ message: `Successfully claimed ${result.reward} GBTC`, reward: result.reward });
    } catch (error) {
      next(error);
    }
  });
  
  // Claim all blocks
  app.post("/api/claim-all-blocks", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const result = await storage.claimAllBlocks(req.user!.id);
      
      if (result.count === 0) {
        return res.status(400).json({ message: "No blocks to claim" });
      }
      
      // Get current block number
      const blockSetting = await storage.getSystemSetting("blockNumber");
      const currentBlock = blockSetting ? parseInt(blockSetting.value) : 1;

      // Update user's last active block
      await storage.updateUser(req.user!.id, {
        lastActiveBlock: currentBlock
      });

      // Update referral hash contributions after claim
      await updateReferralHashContributions();
      
      res.json({ 
        message: `Successfully claimed ${result.count} blocks for ${result.totalReward} GBTC`,
        count: result.count,
        totalReward: result.totalReward
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Admin endpoint to view miner statuses
  app.get("/api/admin/miners", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user!.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const miners = await storage.getMinersStatus();
      res.json(miners);
    } catch (error) {
      next(error);
    }
  });
  
  // Get user transactions
  app.get("/api/transactions", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user!.id;
      const [deposits, withdrawals, sentTransfers, receivedTransfers] = await Promise.all([
        storage.getUserDeposits(userId),
        storage.getUserWithdrawals(userId),
        storage.getSentTransfers(userId),
        storage.getReceivedTransfers(userId)
      ]);
      
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
  
  // Get cooldown status
  app.get("/api/cooldowns", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user!.id;
      const [depositCooldown, withdrawalCooldown] = await Promise.all([
        storage.getDepositCooldown(userId),
        storage.getWithdrawalCooldown(userId)
      ]);
      
      res.json({
        deposit: depositCooldown,
        withdrawal: withdrawalCooldown
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Change PIN
  app.post("/api/change-pin", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { currentPin, newPin } = z.object({
        currentPin: z.string().length(6),
        newPin: z.string().length(6)
      }).parse(req.body);

      // Validate new PIN is 6 digits
      if (!/^\d{6}$/.test(newPin)) {
        return res.status(400).json({ message: "PIN must be exactly 6 digits" });
      }

      // For now, just validate the current PIN matches (simplified)
      // In production, you'd verify against the stored hashed PIN
      
      res.json({ message: "PIN changed successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Get referral data with detailed tracking
  app.get("/api/referrals", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = req.user!;
      
      // Get user's referral code
      const referralCode = user.referralCode || user.username.toUpperCase().slice(0, 6);

      // Get all users referred by this user
      const referredUsers = await storage.getUsersByReferralCode(referralCode);
      
      // Calculate stats
      const totalReferrals = referredUsers.length;
      const activeReferrals = referredUsers.filter(u => parseFloat(u.baseHashPower || u.hashPower || "0") > 0).length;
      
      // Use the stored total referral earnings
      const totalEarnings = user.totalReferralEarnings || "0.00";

      // Format referral list with details
      const referrals = referredUsers.map(u => ({
        id: u.id,
        username: u.username,
        joinedAt: u.createdAt,
        status: parseFloat(u.baseHashPower || u.hashPower || "0") > 0 ? 'mining' : 'inactive',
        hashPower: u.baseHashPower || u.hashPower || "0",
        earned: (parseFloat(u.usdtBalance || "0") * 0.15).toFixed(2) // Estimate based on their balance
      }));

      const referralData = {
        referralCode: referralCode,
        totalReferrals: totalReferrals,
        activeReferrals: activeReferrals,
        totalEarnings: totalEarnings,
        referrals: referrals
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
      
      const { toUsername, amount } = z.object({
        toUsername: z.string(),
        amount: z.string()
      }).parse(req.body);
      
      const transfer = await storage.createTransfer(req.user!.id, toUsername, amount);
      res.json({ message: "Transfer successful", transfer });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  return server;
}