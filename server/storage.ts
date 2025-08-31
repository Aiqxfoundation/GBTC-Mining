import { 
  users, 
  deposits, 
  withdrawals, 
  miningBlocks, 
  systemSettings,
  unclaimedBlocks,
  minerActivity,
  transfers,
  type User, 
  type InsertUser, 
  type Deposit, 
  type InsertDeposit,
  type Withdrawal,
  type InsertWithdrawal,
  type MiningBlock,
  type SystemSetting,
  type UnclaimedBlock,
  type Transfer,
  type MinerActivity
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: string, usdtBalance: string, hashPower: string, gbtcBalance: string, unclaimedBalance: string): Promise<void>;
  freezeUser(userId: string): Promise<void>;
  unfreezeUser(userId: string): Promise<void>;
  
  // Deposit methods
  createDeposit(deposit: InsertDeposit & { userId: string }): Promise<Deposit>;
  getPendingDeposits(): Promise<(Deposit & { user: User })[]>;
  approveDeposit(depositId: string, adminNote?: string): Promise<void>;
  rejectDeposit(depositId: string, adminNote?: string): Promise<void>;
  
  // Withdrawal methods
  createWithdrawal(withdrawal: InsertWithdrawal & { userId: string }): Promise<Withdrawal>;
  
  // Mining methods
  createMiningBlock(blockNumber: number, reward: string, totalHashPower: string): Promise<MiningBlock>;
  getLatestBlock(): Promise<MiningBlock | undefined>;
  getTotalHashPower(): Promise<string>;
  
  // System settings
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  setSystemSetting(key: string, value: string): Promise<void>;
  
  // Stats
  getUserCount(): Promise<number>;
  getTotalDeposits(): Promise<string>;
  getTotalWithdrawals(): Promise<string>;
  getActiveMinerCount(): Promise<number>;
  
  // Unclaimed blocks
  createUnclaimedBlock(userId: string, blockNumber: number, txHash: string, reward: string): Promise<void>;
  getUnclaimedBlocks(userId: string): Promise<any[]>;
  claimBlock(blockId: string, userId: string): Promise<{ success: boolean; reward?: string }>;
  claimAllBlocks(userId: string): Promise<{ count: number; totalReward: string }>;
  expireOldBlocks(): Promise<void>;
  
  // Transfers
  createTransfer(fromUserId: string, toUsername: string, amount: string): Promise<any>;
  
  // Miner activity
  getMinersStatus(): Promise<any[]>;
  updateMinerActivity(userId: string, claimed: boolean): Promise<void>;
  
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserBalance(userId: string, usdtBalance: string, hashPower: string, gbtcBalance: string, unclaimedBalance: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        usdtBalance, 
        hashPower, 
        gbtcBalance, 
        unclaimedBalance 
      })
      .where(eq(users.id, userId));
  }

  async freezeUser(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ isFrozen: true })
      .where(eq(users.id, userId));
  }

  async unfreezeUser(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ isFrozen: false })
      .where(eq(users.id, userId));
  }

  async createDeposit(deposit: InsertDeposit & { userId: string }): Promise<Deposit> {
    const [newDeposit] = await db
      .insert(deposits)
      .values(deposit)
      .returning();
    return newDeposit;
  }

  async getPendingDeposits(): Promise<(Deposit & { user: User })[]> {
    const result = await db
      .select()
      .from(deposits)
      .innerJoin(users, eq(deposits.userId, users.id))
      .where(eq(deposits.status, "pending"))
      .orderBy(desc(deposits.createdAt));
    
    return result.map(row => ({
      ...row.deposits,
      user: row.users
    }));
  }

  async approveDeposit(depositId: string, adminNote?: string): Promise<void> {
    // Get the deposit first
    const [deposit] = await db
      .select()
      .from(deposits)
      .where(eq(deposits.id, depositId));
    
    if (!deposit) throw new Error("Deposit not found");
    
    // Update deposit status
    await db
      .update(deposits)
      .set({ status: "approved", adminNote, updatedAt: new Date() })
      .where(eq(deposits.id, depositId));
    
    // Update user balance
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, deposit.userId));
    
    if (user) {
      const newBalance = (parseFloat(user.usdtBalance) + parseFloat(deposit.amount)).toFixed(2);
      await db
        .update(users)
        .set({ usdtBalance: newBalance })
        .where(eq(users.id, deposit.userId));
    }
  }

  async rejectDeposit(depositId: string, adminNote?: string): Promise<void> {
    await db
      .update(deposits)
      .set({ status: "rejected", adminNote, updatedAt: new Date() })
      .where(eq(deposits.id, depositId));
  }

  async createWithdrawal(withdrawal: InsertWithdrawal & { userId: string }): Promise<Withdrawal> {
    const [newWithdrawal] = await db
      .insert(withdrawals)
      .values(withdrawal)
      .returning();
    return newWithdrawal;
  }

  async createMiningBlock(blockNumber: number, reward: string, totalHashPower: string): Promise<MiningBlock> {
    const [block] = await db
      .insert(miningBlocks)
      .values({ blockNumber, reward, totalHashPower })
      .returning();
    return block;
  }

  async getLatestBlock(): Promise<MiningBlock | undefined> {
    const [block] = await db
      .select()
      .from(miningBlocks)
      .orderBy(desc(miningBlocks.blockNumber))
      .limit(1);
    return block || undefined;
  }

  async getTotalHashPower(): Promise<string> {
    const [result] = await db
      .select({ total: sql<string>`COALESCE(SUM(${users.hashPower}), 0)` })
      .from(users);
    return result?.total || "0";
  }

  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key));
    return setting || undefined;
  }

  async setSystemSetting(key: string, value: string): Promise<void> {
    await db
      .insert(systemSettings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: { value, updatedAt: new Date() }
      });
  }

  async getUserCount(): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users);
    return result?.count || 0;
  }

  async getTotalDeposits(): Promise<string> {
    const [result] = await db
      .select({ total: sql<string>`COALESCE(SUM(${deposits.amount}), 0)` })
      .from(deposits)
      .where(eq(deposits.status, "approved"));
    return result?.total || "0";
  }

  async getTotalWithdrawals(): Promise<string> {
    const [result] = await db
      .select({ total: sql<string>`COALESCE(SUM(${withdrawals.amount}), 0)` })
      .from(withdrawals)
      .where(eq(withdrawals.status, "completed"));
    return result?.total || "0";
  }
  
  async createUnclaimedBlock(userId: string, blockNumber: number, txHash: string, reward: string): Promise<UnclaimedBlock> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    const [block] = await db.insert(unclaimedBlocks).values({
      userId,
      blockNumber,
      txHash,
      reward,
      expiresAt
    }).returning();
    return block;
  }
  
  async getUnclaimedBlocks(userId: string): Promise<UnclaimedBlock[]> {
    return await db.select()
      .from(unclaimedBlocks)
      .where(sql`${unclaimedBlocks.userId} = ${userId} AND ${unclaimedBlocks.claimed} = false AND ${unclaimedBlocks.expiresAt} > NOW()`)
      .orderBy(desc(unclaimedBlocks.createdAt));
  }
  
  async claimBlock(blockId: string, userId: string): Promise<{ success: boolean; reward?: string }> {
    const [block] = await db.select()
      .from(unclaimedBlocks)
      .where(sql`${unclaimedBlocks.id} = ${blockId} AND ${unclaimedBlocks.userId} = ${userId} AND ${unclaimedBlocks.claimed} = false AND ${unclaimedBlocks.expiresAt} > NOW()`);
    
    if (!block) {
      return { success: false };
    }
    
    await db.update(unclaimedBlocks)
      .set({ claimed: true, claimedAt: new Date() })
      .where(eq(unclaimedBlocks.id, blockId));
    
    const user = await this.getUser(userId);
    if (user) {
      const newBalance = (parseFloat(user.gbtcBalance) + parseFloat(block.reward)).toFixed(8);
      await db.update(users)
        .set({ gbtcBalance: newBalance })
        .where(eq(users.id, userId));
    }
    
    await this.updateMinerActivity(userId, true);
    
    return { success: true, reward: block.reward };
  }
  
  async claimAllBlocks(userId: string): Promise<{ count: number; totalReward: string }> {
    const blocks = await db.select()
      .from(unclaimedBlocks)
      .where(sql`${unclaimedBlocks.userId} = ${userId} AND ${unclaimedBlocks.claimed} = false AND ${unclaimedBlocks.expiresAt} > NOW()`);
    
    if (blocks.length === 0) {
      return { count: 0, totalReward: '0' };
    }
    
    // Calculate total reward
    let totalReward = 0;
    for (const block of blocks) {
      totalReward += parseFloat(block.reward);
    }
    
    // Mark all blocks as claimed
    await db.update(unclaimedBlocks)
      .set({ claimed: true, claimedAt: new Date() })
      .where(sql`${unclaimedBlocks.userId} = ${userId} AND ${unclaimedBlocks.claimed} = false AND ${unclaimedBlocks.expiresAt} > NOW()`);
    
    // Update user balance
    const user = await this.getUser(userId);
    if (user) {
      const newBalance = (parseFloat(user.gbtcBalance) + totalReward).toFixed(8);
      await db.update(users)
        .set({ gbtcBalance: newBalance })
        .where(eq(users.id, userId));
    }
    
    await this.updateMinerActivity(userId, true);
    
    return { 
      count: blocks.length, 
      totalReward: totalReward.toFixed(8) 
    };
  }
  
  async expireOldBlocks(): Promise<void> {
    const expiredBlocks = await db.select()
      .from(unclaimedBlocks)
      .where(sql`${unclaimedBlocks.claimed} = false AND ${unclaimedBlocks.expiresAt} <= NOW()`);
    
    for (const block of expiredBlocks) {
      await this.updateMinerActivity(block.userId, false);
    }
  }
  
  async createTransfer(fromUserId: string, toUsername: string, amount: string): Promise<Transfer> {
    const toUser = await this.getUserByUsername(toUsername);
    if (!toUser) {
      throw new Error('Recipient not found');
    }
    
    const fromUser = await this.getUser(fromUserId);
    if (!fromUser) {
      throw new Error('Sender not found');
    }
    
    const senderBalance = parseFloat(fromUser.gbtcBalance);
    if (senderBalance < parseFloat(amount)) {
      throw new Error('Insufficient balance');
    }
    
    await db.update(users)
      .set({ gbtcBalance: (senderBalance - parseFloat(amount)).toFixed(8) })
      .where(eq(users.id, fromUserId));
    
    await db.update(users)
      .set({ gbtcBalance: (parseFloat(toUser.gbtcBalance) + parseFloat(amount)).toFixed(8) })
      .where(eq(users.id, toUser.id));
    
    const txHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const [transfer] = await db.insert(transfers).values({
      fromUserId,
      toUserId: toUser.id,
      amount,
      txHash
    }).returning();
    
    return transfer;
  }
  
  async updateMinerActivity(userId: string, claimed: boolean): Promise<void> {
    const [activity] = await db.select()
      .from(minerActivity)
      .where(eq(minerActivity.userId, userId));
    
    if (!activity) {
      await db.insert(minerActivity).values({
        userId,
        lastClaimTime: claimed ? new Date() : null,
        totalClaims: claimed ? 1 : 0,
        missedClaims: claimed ? 0 : 1,
        isActive: claimed
      });
    } else {
      const now = new Date();
      const lastClaim = activity.lastClaimTime ? new Date(activity.lastClaimTime) : null;
      const hoursSinceLastClaim = lastClaim ? (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60) : 999;
      
      await db.update(minerActivity)
        .set({
          lastClaimTime: claimed ? now : activity.lastClaimTime,
          totalClaims: claimed ? (activity.totalClaims || 0) + 1 : (activity.totalClaims || 0),
          missedClaims: claimed ? (activity.missedClaims || 0) : (activity.missedClaims || 0) + 1,
          isActive: hoursSinceLastClaim < 48,
          updatedAt: now
        })
        .where(eq(minerActivity.userId, userId));
    }
  }
  
  async getMinersStatus(): Promise<(MinerActivity & { user: User })[]> {
    const result = await db.select({
      minerActivity,
      user: users
    })
    .from(minerActivity)
    .leftJoin(users, eq(minerActivity.userId, users.id));
    
    return result.map(r => ({
      ...r.minerActivity,
      user: r.user!
    }));
  }
  
  async getActiveMinerCount(): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(minerActivity)
      .where(eq(minerActivity.isActive, true));
    return result?.count || 0;
  }
}

export const storage = new DatabaseStorage();
