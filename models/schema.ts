import { pgTable, varchar,uuid,text,timestamp, date, pgEnum} from "drizzle-orm/pg-core";

export const UserRole=pgEnum("userRole",["ADMIN","CUSTOMER"]);
export const OrderStatus=pgEnum("orderStatus",["PENDING","ORDERED","SHIPPED","DELIVERED"]);

export const UsersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avator:varchar("avator",{ length: 255 }),
  password:varchar({length:255}).notNull(),
  role:UserRole("userRole").default("CUSTOMER"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const ProfileTable = pgTable("profile", {
  id: uuid().primaryKey().defaultRandom().notNull(),
  birthDate:date().notNull(),
  photos:text().array(),
  userId:uuid("userId").references(()=>UsersTable.id).notNull()
});

