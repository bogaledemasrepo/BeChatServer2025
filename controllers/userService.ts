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

    if(req.file){
      const avatorUrl = `${req.protocol}://${req.get("host")}/photos/${req.file.filename}`;
      await db.update(UsersTable).set({ avator: avatorUrl }).where(eq(UsersTable.id, req.user.id));
    }
    const { name, email } = req.body;
    if (name) {
      await db.update(UsersTable).set({ name }).where(eq(UsersTable.id, req.user.id));
    }
    if (email) {
      await db.update(UsersTable).set({ email }).where(eq(UsersTable.id, req.user.id));
    } 
    if (!name && !email && !req.file) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const [user] = await db.select().from(UsersTable).where(eq(UsersTable.id, req.user.id));
    if(!user) throw new Error("Internl server error.")
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role,avator:user.avator });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// export const uploadFree = async (req: Request, res: Response) => {
//   try {
//     if(req.file) return res.json({url:`${req.protocol}://${req.get("host")}/photos/${req.file.filename}`});
//     throw Error("Something went wrong!")
//   } catch (error) {
//     console.error("Profile error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// }

export const getFriendsList = async (req: Request & { user?: { id: string; role: string } }, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const currentUserId = req.user.id;

  // Use aliasedTable for Postgres
  const friend = aliasedTable(UsersTable, "friend");

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
    );

    return res.json(results);
    } catch (error) {
    console.error("Get friends error:", error);
    res.status(500).json({ error: "Internal server error" });
       
  }
};