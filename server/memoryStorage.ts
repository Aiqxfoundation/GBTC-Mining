import { 
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
import { IStorage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
const MemoryStoreSession = MemoryStore(session);

export class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private usersByUsername: Map<string, string> = new Map(); // username -> userId
  private deposits: Map<string, Deposit> = new Map();
  private withdrawals: Map<string, Withdrawal> = new Map();
  private miningBlocks: Map<string, MiningBlock> = new Map();
  private systemSettings: Map<string, SystemSetting> = new Map();
  private unclaimedBlocks: Map<string, UnclaimedBlock> = new Map();
  private transfers: Map<string, Transfer> = new Map();
  private minerActivity: Map<string, MinerActivity> = new Map();
  private lastDepositTime: Map<string, Date> = new Map(); // userId -> last deposit timestamp
  private lastWithdrawalTime: Map<string, Date> = new Map(); // userId -> last withdrawal timestamp
  
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize default admin user
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Create default admin user
    const adminId = 'admin-' + randomBytes(8).toString('hex');
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync('123456', salt, 64)) as Buffer;
    const hashedPassword = `${buf.toString("hex")}.${salt}`;
    
    const adminUser: User = {
      id: adminId,
      username: 'admin',
      password: hashedPassword,
      usdtBalance: '10000.00',
      hashPower: '100.00',
      gbtcBalance: '0.00000000',
      unclaimedBalance: '0.00000000',
      isAdmin: true,
      isFrozen: false,
      createdAt: new Date()
    };
    
    this.users.set(adminId, adminUser);
    this.usersByUsername.set('admin', adminId);
    
    // Initialize system settings
    this.systemSettings.set('blockReward-1', {
      id: 'blockReward-1',
      key: 'blockReward',
      value: '6.25',
      updatedAt: new Date()
    });
    
    this.systemSettings.set('blockNumber-1', {
      id: 'blockNumber-1',
      key: 'blockNumber',
      value: '1',
      updatedAt: new Date()
    });
    
    console.log('Memory storage initialized with default admin user (username: admin, PIN: 123456)');
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const userId = this.usersByUsername.get(username);
    if (!userId) return undefined;
    return this.users.get(userId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const userId = 'user-' + randomBytes(8).toString('hex');
    const user: User = {
      id: userId,
      username: insertUser.username,
      password: insertUser.password,
      usdtBalance: '0.00',
      hashPower: '0.00',
      gbtcBalance: '0.00000000',
      unclaimedBalance: '0.00000000',
      isAdmin: false,
      isFrozen: false,
      createdAt: new Date()
    };
    
    this.users.set(userId, user);
    this.usersByUsername.set(insertUser.username, userId);
    return user;
  }

  async updateUserBalance(userId: string, usdtBalance: string, hashPower: string, gbtcBalance: string, unclaimedBalance: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.usdtBalance = usdtBalance;
      user.hashPower = hashPower;
      user.gbtcBalance = gbtcBalance;
      user.unclaimedBalance = unclaimedBalance;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      Object.assign(user, updates);
    }
  }

  async freezeUser(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.isFrozen = true;
    }
  }

  async unfreezeUser(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.isFrozen = false;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async updateUserBalances(userId: string, balances: { usdtBalance?: string; gbtcBalance?: string; hashPower?: string }): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      if (balances.usdtBalance !== undefined) user.usdtBalance = balances.usdtBalance;
      if (balances.gbtcBalance !== undefined) user.gbtcBalance = balances.gbtcBalance;
      if (balances.hashPower !== undefined) user.hashPower = balances.hashPower;
    }
  }

  async createDeposit(deposit: InsertDeposit & { userId: string }): Promise<Deposit> {
    // Check cooldown (72 hours = 259200000 ms)
    const lastRequest = this.lastDepositTime.get(deposit.userId);
    if (lastRequest) {
      const timePassed = Date.now() - lastRequest.getTime();
      const cooldownRemaining = 259200000 - timePassed; // 72 hours in ms
      if (cooldownRemaining > 0) {
        const hoursRemaining = Math.ceil(cooldownRemaining / (1000 * 60 * 60));
        throw new Error(`Please wait ${hoursRemaining} hours before making another deposit request`);
      }
    }
    
    const depositId = 'dep-' + randomBytes(8).toString('hex');
    const newDeposit: Deposit = {
      id: depositId,
      userId: deposit.userId,
      network: deposit.network,
      txHash: deposit.txHash,
      amount: deposit.amount,
      status: 'pending',
      adminNote: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.deposits.set(depositId, newDeposit);
    // Track the time of this deposit request
    this.lastDepositTime.set(deposit.userId, new Date());
    return newDeposit;
  }

  async getPendingDeposits(): Promise<(Deposit & { user: User })[]> {
    const pendingDeposits: (Deposit & { user: User })[] = [];
    
    for (const deposit of Array.from(this.deposits.values())) {
      if (deposit.status === 'pending') {
        const user = this.users.get(deposit.userId);
        if (user) {
          pendingDeposits.push({ ...deposit, user });
        }
      }
    }
    
    return pendingDeposits.sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async approveDeposit(depositId: string, adminNote?: string, actualAmount?: string): Promise<void> {
    const deposit = this.deposits.get(depositId);
    if (!deposit) throw new Error("Deposit not found");
    
    // Use actualAmount if provided (admin verified amount), otherwise use original amount
    const amountToCredit = actualAmount || deposit.amount;
    
    deposit.status = 'approved';
    deposit.adminNote = adminNote || null;
    deposit.amount = amountToCredit; // Update with verified amount
    deposit.updatedAt = new Date();
    
    const user = this.users.get(deposit.userId);
    if (user) {
      const newBalance = (parseFloat(user.usdtBalance || "0") + parseFloat(amountToCredit)).toFixed(2);
      user.usdtBalance = newBalance;
    }
  }

  async rejectDeposit(depositId: string, adminNote?: string): Promise<void> {
    const deposit = this.deposits.get(depositId);
    if (deposit) {
      deposit.status = 'rejected';
      deposit.adminNote = adminNote || null;
      deposit.updatedAt = new Date();
    }
  }

  async createWithdrawal(withdrawal: InsertWithdrawal & { userId: string }): Promise<Withdrawal> {
    // Check cooldown (72 hours = 259200000 ms)
    const lastRequest = this.lastWithdrawalTime.get(withdrawal.userId);
    if (lastRequest) {
      const timePassed = Date.now() - lastRequest.getTime();
      const cooldownRemaining = 259200000 - timePassed; // 72 hours in ms
      if (cooldownRemaining > 0) {
        const hoursRemaining = Math.ceil(cooldownRemaining / (1000 * 60 * 60));
        throw new Error(`Please wait ${hoursRemaining} hours before making another withdrawal request`);
      }
    }
    
    const withdrawalId = 'with-' + randomBytes(8).toString('hex');
    const newWithdrawal: Withdrawal = {
      id: withdrawalId,
      userId: withdrawal.userId,
      amount: withdrawal.amount,
      address: withdrawal.address,
      network: withdrawal.network,
      status: 'pending',
      txHash: null,
      createdAt: new Date()
    };
    
    this.withdrawals.set(withdrawalId, newWithdrawal);
    // Track the time of this withdrawal request
    this.lastWithdrawalTime.set(withdrawal.userId, new Date());
    return newWithdrawal;
  }

  async getPendingWithdrawals(): Promise<any[]> {
    const pendingWithdrawals = Array.from(this.withdrawals.values())
      .filter(w => w.status === 'pending')
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    
    // Add user information
    return pendingWithdrawals.map(withdrawal => {
      const user = this.users.get(withdrawal.userId);
      return {
        ...withdrawal,
        user: user ? {
          id: user.id,
          username: user.username,
          usdtBalance: user.usdtBalance,
          gbtcBalance: user.gbtcBalance
        } : null
      };
    });
  }

  async approveWithdrawal(withdrawalId: string, txHash?: string): Promise<void> {
    const withdrawal = this.withdrawals.get(withdrawalId);
    if (!withdrawal) {
      throw new Error('Withdrawal not found');
    }

    const user = this.users.get(withdrawal.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const amount = parseFloat(withdrawal.amount);
    const isUSDT = withdrawal.network === 'ERC20' || withdrawal.network === 'BSC' || withdrawal.network === 'TRC20';

    // Check balance and deduct
    if (isUSDT) {
      const usdtBalance = parseFloat(user.usdtBalance || "0");
      if (usdtBalance < amount) {
        throw new Error('Insufficient USDT balance');
      }
      user.usdtBalance = (usdtBalance - amount).toFixed(2);
    } else {
      const gbtcBalance = parseFloat(user.gbtcBalance || "0");
      if (gbtcBalance < amount) {
        throw new Error('Insufficient GBTC balance');
      }
      user.gbtcBalance = (gbtcBalance - amount).toFixed(8);
    }

    // Update withdrawal status
    withdrawal.status = 'completed';
    if (txHash) {
      withdrawal.txHash = txHash;
    }
  }

  async rejectWithdrawal(withdrawalId: string): Promise<void> {
    const withdrawal = this.withdrawals.get(withdrawalId);
    if (!withdrawal) {
      throw new Error('Withdrawal not found');
    }
    withdrawal.status = 'rejected';
  }

  async createMiningBlock(blockNumber: number, reward: string, totalHashPower: string): Promise<MiningBlock> {
    const blockId = 'block-' + randomBytes(8).toString('hex');
    const block: MiningBlock = {
      id: blockId,
      blockNumber,
      reward,
      totalHashPower,
      timestamp: new Date()
    };
    
    this.miningBlocks.set(blockId, block);
    return block;
  }

  async getLatestBlock(): Promise<MiningBlock | undefined> {
    let latestBlock: MiningBlock | undefined;
    let maxBlockNumber = -1;
    
    for (const block of Array.from(this.miningBlocks.values())) {
      if (block.blockNumber > maxBlockNumber) {
        maxBlockNumber = block.blockNumber;
        latestBlock = block;
      }
    }
    
    return latestBlock;
  }

  async getTotalHashPower(): Promise<string> {
    let total = 0;
    for (const user of Array.from(this.users.values())) {
      total += parseFloat(user.hashPower || "0");
    }
    return total.toFixed(2);
  }

  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    for (const setting of Array.from(this.systemSettings.values())) {
      if (setting.key === key) {
        return setting;
      }
    }
    return undefined;
  }

  async setSystemSetting(key: string, value: string): Promise<void> {
    const existingSetting = await this.getSystemSetting(key);
    if (existingSetting) {
      existingSetting.value = value;
      existingSetting.updatedAt = new Date();
    } else {
      const settingId = key + '-' + randomBytes(4).toString('hex');
      this.systemSettings.set(settingId, {
        id: settingId,
        key,
        value,
        updatedAt: new Date()
      });
    }
  }

  async getUserCount(): Promise<number> {
    return this.users.size;
  }

  async getTotalDeposits(): Promise<string> {
    let total = 0;
    for (const deposit of Array.from(this.deposits.values())) {
      if (deposit.status === 'approved') {
        total += parseFloat(deposit.amount);
      }
    }
    return total.toFixed(2);
  }

  async getTotalWithdrawals(): Promise<string> {
    let total = 0;
    for (const withdrawal of Array.from(this.withdrawals.values())) {
      if (withdrawal.status === 'completed') {
        total += parseFloat(withdrawal.amount);
      }
    }
    return total.toFixed(2);
  }

  async getActiveMinerCount(): Promise<number> {
    let count = 0;
    for (const activity of Array.from(this.minerActivity.values())) {
      if (activity.isActive) {
        count++;
      }
    }
    return count;
  }

  async createUnclaimedBlock(userId: string, blockNumber: number, txHash: string, reward: string): Promise<UnclaimedBlock> {
    const blockId = 'unclaimed-' + randomBytes(8).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    const block: UnclaimedBlock = {
      id: blockId,
      userId,
      blockNumber,
      txHash,
      reward,
      expiresAt,
      claimed: false,
      claimedAt: null,
      createdAt: new Date()
    };
    
    this.unclaimedBlocks.set(blockId, block);
    return block;
  }

  async getUnclaimedBlocks(userId: string): Promise<UnclaimedBlock[]> {
    const blocks: UnclaimedBlock[] = [];
    const now = new Date();
    
    for (const block of Array.from(this.unclaimedBlocks.values())) {
      if (block.userId === userId && !block.claimed && block.expiresAt > now) {
        blocks.push(block);
      }
    }
    
    return blocks.sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async claimBlock(blockId: string, userId: string): Promise<{ success: boolean; reward?: string }> {
    const block = this.unclaimedBlocks.get(blockId);
    const now = new Date();
    
    if (!block || block.userId !== userId || block.claimed || block.expiresAt <= now) {
      return { success: false };
    }
    
    block.claimed = true;
    block.claimedAt = now;
    
    const user = this.users.get(userId);
    if (user) {
      const newBalance = (parseFloat(user.gbtcBalance || "0") + parseFloat(block.reward)).toFixed(8);
      user.gbtcBalance = newBalance;
    }
    
    await this.updateMinerActivity(userId, true);
    
    return { success: true, reward: block.reward };
  }

  async claimAllBlocks(userId: string): Promise<{ count: number; totalReward: string }> {
    const blocks = await this.getUnclaimedBlocks(userId);
    
    if (blocks.length === 0) {
      return { count: 0, totalReward: '0' };
    }
    
    let totalReward = 0;
    const now = new Date();
    
    for (const block of blocks) {
      block.claimed = true;
      block.claimedAt = now;
      totalReward += parseFloat(block.reward);
    }
    
    const user = this.users.get(userId);
    if (user) {
      const newBalance = (parseFloat(user.gbtcBalance || "0") + totalReward).toFixed(8);
      user.gbtcBalance = newBalance;
    }
    
    await this.updateMinerActivity(userId, true);
    
    return { 
      count: blocks.length, 
      totalReward: totalReward.toFixed(8) 
    };
  }

  async expireOldBlocks(): Promise<void> {
    const now = new Date();
    
    for (const block of Array.from(this.unclaimedBlocks.values())) {
      if (!block.claimed && block.expiresAt <= now) {
        await this.updateMinerActivity(block.userId, false);
      }
    }
  }

  async createTransfer(fromUserId: string, toUsername: string, amount: string): Promise<Transfer> {
    const toUserId = this.usersByUsername.get(toUsername);
    if (!toUserId) {
      throw new Error('Recipient not found');
    }
    
    const fromUser = this.users.get(fromUserId);
    const toUser = this.users.get(toUserId);
    
    if (!fromUser) {
      throw new Error('Sender not found');
    }
    
    if (!toUser) {
      throw new Error('Recipient not found');
    }
    
    const senderBalance = parseFloat(fromUser.gbtcBalance || "0");
    if (senderBalance < parseFloat(amount)) {
      throw new Error('Insufficient balance');
    }
    
    fromUser.gbtcBalance = (senderBalance - parseFloat(amount)).toFixed(8);
    toUser.gbtcBalance = (parseFloat(toUser.gbtcBalance || "0") + parseFloat(amount)).toFixed(8);
    
    const transferId = 'transfer-' + randomBytes(8).toString('hex');
    const txHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    
    const transfer: Transfer = {
      id: transferId,
      fromUserId,
      toUserId,
      amount,
      txHash,
      createdAt: new Date()
    };
    
    this.transfers.set(transferId, transfer);
    return transfer;
  }

  async getMinersStatus(): Promise<(MinerActivity & { user: User })[]> {
    const result: (MinerActivity & { user: User })[] = [];
    
    for (const activity of Array.from(this.minerActivity.values())) {
      const user = this.users.get(activity.userId);
      if (user) {
        result.push({ ...activity, user });
      }
    }
    
    return result;
  }

  async updateMinerActivity(userId: string, claimed: boolean): Promise<void> {
    const activity = this.minerActivity.get(userId);
    const now = new Date();
    
    if (!activity) {
      const newActivity: MinerActivity = {
        id: 'activity-' + randomBytes(8).toString('hex'),
        userId,
        lastClaimTime: claimed ? now : null,
        totalClaims: claimed ? 1 : 0,
        missedClaims: claimed ? 0 : 1,
        isActive: claimed,
        updatedAt: now
      };
      this.minerActivity.set(userId, newActivity);
    } else {
      const lastClaim = activity.lastClaimTime;
      const hoursSinceLastClaim = lastClaim ? (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60) : 999;
      
      activity.lastClaimTime = claimed ? now : activity.lastClaimTime;
      activity.totalClaims = claimed ? (activity.totalClaims || 0) + 1 : (activity.totalClaims || 0);
      activity.missedClaims = claimed ? (activity.missedClaims || 0) : (activity.missedClaims || 0) + 1;
      activity.isActive = hoursSinceLastClaim < 48;
      activity.updatedAt = now;
    }
  }

  async getUserDeposits(userId: string): Promise<Deposit[]> {
    const userDeposits: Deposit[] = [];
    
    for (const deposit of Array.from(this.deposits.values())) {
      if (deposit.userId === userId) {
        userDeposits.push(deposit);
      }
    }
    
    return userDeposits.sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getUserWithdrawals(userId: string): Promise<Withdrawal[]> {
    const userWithdrawals: Withdrawal[] = [];
    
    for (const withdrawal of Array.from(this.withdrawals.values())) {
      if (withdrawal.userId === userId) {
        userWithdrawals.push(withdrawal);
      }
    }
    
    return userWithdrawals.sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getSentTransfers(userId: string): Promise<Transfer[]> {
    const sentTransfers: Transfer[] = [];
    
    for (const transfer of Array.from(this.transfers.values())) {
      if (transfer.fromUserId === userId) {
        const toUser = this.users.get(transfer.toUserId);
        sentTransfers.push({
          ...transfer,
          toUsername: toUser?.username || 'Unknown'
        } as any);
      }
    }
    
    return sentTransfers.sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getReceivedTransfers(userId: string): Promise<Transfer[]> {
    const receivedTransfers: Transfer[] = [];
    
    for (const transfer of Array.from(this.transfers.values())) {
      if (transfer.toUserId === userId) {
        const fromUser = this.users.get(transfer.fromUserId);
        receivedTransfers.push({
          ...transfer,
          fromUsername: fromUser?.username || 'Unknown'
        } as any);
      }
    }
    
    return receivedTransfers.sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getDepositCooldown(userId: string): Promise<{ canDeposit: boolean; hoursRemaining: number }> {
    const lastRequest = this.lastDepositTime.get(userId);
    if (!lastRequest) {
      return { canDeposit: true, hoursRemaining: 0 };
    }
    
    const timePassed = Date.now() - lastRequest.getTime();
    const cooldownRemaining = 259200000 - timePassed; // 72 hours in ms
    
    if (cooldownRemaining > 0) {
      // Return precise hours remaining (with decimal) for accurate countdown
      const hoursRemaining = cooldownRemaining / (1000 * 60 * 60);
      return { canDeposit: false, hoursRemaining };
    }
    
    return { canDeposit: true, hoursRemaining: 0 };
  }

  async getWithdrawalCooldown(userId: string): Promise<{ canWithdraw: boolean; hoursRemaining: number }> {
    const lastRequest = this.lastWithdrawalTime.get(userId);
    if (!lastRequest) {
      return { canWithdraw: true, hoursRemaining: 0 };
    }
    
    const timePassed = Date.now() - lastRequest.getTime();
    const cooldownRemaining = 259200000 - timePassed; // 72 hours in ms
    
    if (cooldownRemaining > 0) {
      // Return precise hours remaining (with decimal) for accurate countdown
      const hoursRemaining = cooldownRemaining / (1000 * 60 * 60);
      return { canWithdraw: false, hoursRemaining };
    }
    
    return { canWithdraw: true, hoursRemaining: 0 };
  }
}