import { sql } from "drizzle-orm";
import { pgTable, varchar,uuid,text,timestamp, date, pgEnum,boolean} from "drizzle-orm/pg-core";
export const UserRole=pgEnum("userRole",["ADMIN","CUSTOMER"]);
export const RequestStatus=pgEnum("requestStatus",["PENDING","ACCEPTED","REJECTED"]);

export const UsersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avator:varchar("avator",{ length: 255 }),
  password:varchar({length:255}).notNull(),
  role:UserRole("userRole").default("CUSTOMER"),
  isOnline: boolean("is_online").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const ProfileTable = pgTable("profile", {
  bio: text("bio"),
  birthDate: date("birth_date"), // Suggestion: use snake_case for DB columns
  photos: text("photos").array().default(sql`ARRAY[]::text[]`), 
  userId: uuid("userId").primaryKey().references(() => UsersTable.id).notNull()
});

export const MessageTable = pgTable("messages", {
  id: uuid().primaryKey().defaultRandom().notNull(),
  content: text("content"),
  fileUrl: varchar("file_url",{ length: 255 }).array(),
  senderId: uuid("sender_id").references(() => UsersTable.id).notNull(),
  receiverId: uuid("receiver_id").references(() => UsersTable.id).notNull(),
  unread: boolean("unread").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const FriendRequest = pgTable("friendRequest",{
  id:uuid().primaryKey().defaultRandom().notNull(),
  from:uuid("from").references(() => UsersTable.id).notNull(),
  to:uuid("to").references(() => UsersTable.id).notNull(),
  status:RequestStatus().default("PENDING").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
})