import {
  timestamp,
  pgTable,
  text,
  varchar,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "@auth/core/adapters";
import { sql } from "drizzle-orm";

export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    primaryKey: [account.provider, account.providerAccountId],
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    primaryKey: [vt.identifier, vt.token],
  })
);

export const messageType = pgEnum('message_type', [
	'TEXT',
	'IMAGE',
	'FILE',
	'AUDIO',
]);

export const messages = pgTable('message', {
	id: text('id').notNull().primaryKey(),
	text: text('text').notNull(),
	chatRoomId: text('chatRoomId').notNull().references(() => chatRooms.id, { onDelete: 'cascade' }),
	type: messageType('type').notNull().default('TEXT'),
	sender: text('sender')
		.notNull()
		.references(() => users.id),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Message = typeof messages.$inferSelect; 

export const chatRooms = pgTable('chatRoom', {
	id: text('id').notNull().primaryKey(),
	name: text('name').notNull(),
	url: text('url').notNull().unique(),
	creatorId: text('creatorId')
		.notNull()
		.references(() => users.id, { onDelete: 'set null' }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type ChatRoom = typeof chatRooms.$inferSelect;

export const chatRoomMembers = pgTable(
	'chatRoomMember',
	{
		chatRoomId: text('chatRoomId')
			.notNull()
			.references(() => chatRooms.id, { onDelete: 'cascade' }),
		userId: text('userId')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		joinedAt: timestamp('joined_at').notNull().defaultNow(),
	},
	(vt) => ({
		primaryKey: [vt.chatRoomId, vt.userId],
	})
);

export type ChatRoomMember = typeof chatRoomMembers.$inferSelect;

export const friendRequestStatus = pgEnum('friend_request_status', [
  'PENDING',
  'ACCEPTED',
  'DECLINED',
]);

export const friendRequests = pgTable('friendRequest', {
  id: text('id').notNull().primaryKey(),
  fromUserId: text('fromUserId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  toUserId: text('toUserId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status').notNull().default('PENDING'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type FriendRequest = typeof friendRequests.$inferSelect;

