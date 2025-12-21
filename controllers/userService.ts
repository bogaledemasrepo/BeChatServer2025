import type { Request, Response } from "express";
import db from "../models/index";
import { UsersTable,MessageTable } from "../models/schema";
import { eq, or, sql, desc } from "drizzle-orm";
import { aliasedTable } from "drizzle-orm/alias";


export const getProfile = async (req: Request & { user?: { id: string; role: string } }, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const [user] = await db.select().from(UsersTable).where(eq(UsersTable.id, req.user.id));
    if(!user) throw new Error("Internl server error.")
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role,avator:user.avator });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const updateProfile = async (req: Request & { user?: { id: string; role: string } }, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.log("Request ",req.body,req.file)
    const { name, email } = req.body||{};
    if (!name && !email && !req.file) {
      return res.status(400).json({ error: "No fields to update" });
    }

    if(req.file){
      const avatorUrl = `${req.protocol}://${req.get("host")}/photos/${req.file.filename}`;
      await db.update(UsersTable).set({ avator: avatorUrl }).where(eq(UsersTable.id, req.user.id));
    }
    
    if (name) {
      await db.update(UsersTable).set({ name }).where(eq(UsersTable.id, req.user.id));
    }
    if (email) {
      await db.update(UsersTable).set({ email }).where(eq(UsersTable.id, req.user.id));
    } 
    

    const [user] = await db.select().from(UsersTable).where(eq(UsersTable.id, req.user.id));
    if(!user) throw new Error("Internl server error.")
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role,avator:user.avator });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const deleteProfile = async (req: Request & { user?: { id: string; role: string } }, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    await db.delete(UsersTable).where(eq(UsersTable.id, req.user.id));
    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
export const getFriendsList = async (req: Request & { user?: { id: string; role: string } }, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const currentUserId = req.user.id;
    const friend = aliasedTable(UsersTable, "friend");

    // 1. Parse pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // 2. Fetch Paginated Conversations
    const results = await db
      .selectDistinctOn([
        sql`LEAST(${MessageTable.senderId}, ${MessageTable.receiverId})`,
        sql`GREATEST(${MessageTable.senderId}, ${MessageTable.receiverId})`
      ], {
        id: MessageTable.id,
        toMe: sql<boolean>`${MessageTable.receiverId} = ${currentUserId}`,
        latestMessage: MessageTable.content,
        timestamp: MessageTable.createdAt,
        isUnread: MessageTable.unread,
        friendDetail: {
          id: friend.id,
          name: friend.name,
          email: friend.email,
          avator: friend.avator,
          isOnline: friend.isOnline
        }
      })
      .from(MessageTable)
      .innerJoin(
        friend,
        sql`${friend.id} = CASE 
          WHEN ${MessageTable.senderId} = ${currentUserId} THEN ${MessageTable.receiverId} 
          ELSE ${MessageTable.senderId} 
        END`
      )
      .where(
        or(
          eq(MessageTable.senderId, currentUserId),
          eq(MessageTable.receiverId, currentUserId)
        )
      )
      .orderBy(
        sql`LEAST(${MessageTable.senderId}, ${MessageTable.receiverId})`,
        sql`GREATEST(${MessageTable.senderId}, ${MessageTable.receiverId})`,
        desc(MessageTable.createdAt)
      )
      .limit(limit)
      .offset(offset);

    // 3. Fetch Total Count for Pagination Meta
    const countResult = await db
      .select({
        count: sql<number>`count(DISTINCT (CASE 
          WHEN ${MessageTable.senderId} < ${MessageTable.receiverId} 
          THEN ${MessageTable.senderId} || '-' || ${MessageTable.receiverId} 
          ELSE ${MessageTable.receiverId} || '-' || ${MessageTable.senderId} 
        END))`
      })
      .from(MessageTable)
      .where(
        or(
          eq(MessageTable.senderId, currentUserId),
          eq(MessageTable.receiverId, currentUserId)
        )
      );

    const totalItems = Number(countResult[0]?.count || 0);

    // 4. Send SINGLE response
    return res.json({
      data: results,
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error("Get friends error:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};


export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // 1. Extract and parse query parameters with defaults
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
// console.log("Get all users req query ",req.query)
    // 2. Fetch paginated data
    const users = await db
      .select()
      .from(UsersTable)
      .limit(limit)
      .offset(offset);

    // 3. Optional: Fetch total count for the frontend to calculate pages
    const [totalCount] = await db.select({ count: sql<number>`count(*)` }).from(UsersTable);

    res.json({
      data: users,
      meta: {
        totalItems: Number(totalCount?.count||0),
        totalPages: Math.ceil(Number(totalCount?.count||0) / limit),
        currentPage: page,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};