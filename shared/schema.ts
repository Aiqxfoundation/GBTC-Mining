import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, boolean, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  referralCode: text("referral_code").unique(),
  referredBy: text("referred_by"), // Referral code of the user who referred them
  usdtBalance: decimal("usdt_balance", { precision: 10, scale: 2 }).default("0.00"),
  hashPower: decimal("hash_power", { precision: 10, scale: 2 }).default("0.00"),
  gbtcBalance: decimal("gbtc_balance", { precision: 18, scale: 8 }).default("0.00000000"),
  unclaimedBalance: decimal("unclaimed_balance", { precision: 18, scale: 8 }).default("0.00000000"),
  isAdmin: boolean("is_admin").default(false),
  isFrozen: boolean("is_frozen").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const deposits = pgTable("deposits", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  network: text("network").notNull(), // "BSC", "ETH", "TRC20", "APTOS"
  txHash: text("tx_hash").notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected"
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const withdrawals = pgTable("withdrawals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  address: text("address").notNull(),
  network: text("network").notNull(), // "ERC20", "BSC", "TRC20" for USDT, "GBTC" for GBTC
  status: text("status").notNull().default("pending"), // "pending", "completed", "rejected"
  txHash: text("tx_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const unclaimedBlocks = pgTable("unclaimed_blocks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  blockNumber: integer("block_number").notNull(),
  txHash: text("tx_hash").notNull(),
  reward: decimal("reward", { precision: 18, scale: 8 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  claimed: boolean("claimed").default(false),
  claimedAt: timestamp("claimed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const minerActivity = pgTable("miner_activity", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull().unique(),
  lastClaimTime: timestamp("last_claim_time"),
  totalClaims: integer("total_claims").default(0),
  missedClaims: integer("missed_claims").default(0),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transfers = pgTable("transfers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: uuid("from_user_id").references(() => users.id).notNull(),
  toUserId: uuid("to_user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  txHash: text("tx_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const miningBlocks = pgTable("mining_blocks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  blockNumber: integer("block_number").notNull(),
  reward: decimal("reward", { precision: 18, scale: 8 }).notNull(),
  totalHashPower: decimal("total_hash_power", { precision: 10, scale: 2 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const miningStats = pgTable("mining_stats", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  totalHashPower: decimal("total_hash_power", { precision: 15, scale: 2 }).default("0.00"),
  activeMiners: integer("active_miners").default(0),
  totalBlocksMined: integer("total_blocks_mined").default(0),
  currentDifficulty: decimal("current_difficulty", { precision: 10, scale: 2 }).default("1.00"),
  networkStatus: text("network_status").default("active"), // "active", "maintenance", "paused"
  lastBlockTime: timestamp("last_block_time").defaultNow(),
  avgBlockTime: integer("avg_block_time").default(600), // seconds
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userMiningStats = pgTable("user_mining_stats", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  totalHashPower: decimal("total_hash_power", { precision: 10, scale: 2 }).default("0.00"),
  totalMined: decimal("total_mined", { precision: 18, scale: 8 }).default("0.00000000"),
  totalClaimed: decimal("total_claimed", { precision: 18, scale: 8 }).default("0.00000000"),
  blocksParticipated: integer("blocks_participated").default(0),
  lastMiningActivity: timestamp("last_mining_activity").defaultNow(),
  miningEfficiency: decimal("mining_efficiency", { precision: 5, scale: 2 }).default("100.00"), // percentage
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const systemSettings = pgTable("system_settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  deposits: many(deposits),
  withdrawals: many(withdrawals),
  unclaimedBlocks: many(unclaimedBlocks),
  sentTransfers: many(transfers, {
    relationName: "sentTransfers",
  }),
  receivedTransfers: many(transfers, {
    relationName: "receivedTransfers",
  }),
  minerActivity: one(minerActivity),
  miningStats: one(userMiningStats),
}));

export const depositsRelations = relations(deposits, ({ one }) => ({
  user: one(users, {
    fields: [deposits.userId],
    references: [users.id],
  }),
}));

export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
  user: one(users, {
    fields: [withdrawals.userId],
    references: [users.id],
  }),
}));

export const unclaimedBlocksRelations = relations(unclaimedBlocks, ({ one }) => ({
  user: one(users, {
    fields: [unclaimedBlocks.userId],
    references: [users.id],
  }),
}));

export const minerActivityRelations = relations(minerActivity, ({ one }) => ({
  user: one(users, {
    fields: [minerActivity.userId],
    references: [users.id],
  }),
}));

export const transfersRelations = relations(transfers, ({ one }) => ({
  fromUser: one(users, {
    fields: [transfers.fromUserId],
    references: [users.id],
    relationName: "sentTransfers",
  }),
  toUser: one(users, {
    fields: [transfers.toUserId],
    references: [users.id],
    relationName: "receivedTransfers",
  }),
}));

export const userMiningStatsRelations = relations(userMiningStats, ({ one }) => ({
  user: one(users, {
    fields: [userMiningStats.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  usdtBalance: true,
  hashPower: true,
  gbtcBalance: true,
  unclaimedBalance: true,
  isAdmin: true,
  isFrozen: true,
});

export const insertDepositSchema = createInsertSchema(deposits).omit({
  id: true,
  userId: true,
  status: true,
  adminNote: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWithdrawalSchema = createInsertSchema(withdrawals).omit({
  id: true,
  userId: true,
  status: true,
  txHash: true,
  createdAt: true,
});

export const insertTransferSchema = createInsertSchema(transfers).omit({
  id: true,
  fromUserId: true,
  txHash: true,
  createdAt: true,
});

export const insertUnclaimedBlockSchema = createInsertSchema(unclaimedBlocks).omit({
  id: true,
  userId: true,
  claimed: true,
  claimedAt: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Deposit = typeof deposits.$inferSelect;
export type InsertDeposit = z.infer<typeof insertDepositSchema>;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type MiningBlock = typeof miningBlocks.$inferSelect;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type MiningStats = typeof miningStats.$inferSelect;
export type Transfer = typeof transfers.$inferSelect;
export type MinerActivity = typeof minerActivity.$inferSelect;
export type UserMiningStats = typeof userMiningStats.$inferSelect;
export type UnclaimedBlock = typeof unclaimedBlocks.$inferSelect;
export type InsertUnclaimedBlock = z.infer<typeof insertUnclaimedBlockSchema>;
export type InsertTransfer = z.infer<typeof insertTransferSchema>;
