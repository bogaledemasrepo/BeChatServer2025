import type { Request, Response } from "express";
import db from "../models/index";
import { FriendRequest, MessageTable, UsersTable } from "../models/schema";
import { aliasedTable, and, eq } from "drizzle-orm";

export const sendFriendRequest = async (req: Request & { user?: { id: string; role: string } }, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { reciverId } = req.body;
    if (!reciverId) {
      return res.status(400).json({ error: "Recipient ID is required" });
    }
    const requestedUser = await db.select().from(UsersTable).where(eq(UsersTable.id,reciverId));
    if(!requestedUser) return res.status(400).json({ error: "Requested user not found!" });
      await db.insert(FriendRequest).values({
      from: req.user.id,
      to: reciverId
    }).returning();
    res.status(201).json({ message: "Friend request sent" });
  } catch (error) {
    console.error("Send friend request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const rejectFriendRequest = async (req: Request & { user?: { id: string; role: string } }, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { requestId } = req.body;
    if (!requestId) {
      return res.status(400).json({ error: "Request ID is required" });
    }

    const requestedData = await db.select().from(FriendRequest).where(eq(FriendRequest.id,requestId||""));
    if(!requestedData) return res.status(400).json({ error: "Request not found!" });
    await db.update(FriendRequest).set({ status: "REJECTED" }).where(eq(FriendRequest.id, requestId) && eq(FriendRequest.to, req.user.id));
    res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    console.error("Reject friend request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const acceptFriendRequest = async (req: Request & { user?: { id: string; role: string } }, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { requestId } = req.body;
    if (!requestId) {
      return res.status(400).json({ error: "Request ID is required" });
    }

      const requestedData = await db.select().from(FriendRequest).where(eq(FriendRequest.id,requestId||""));
    if(!requestedData) return res.status(400).json({ error: "Request not found!" });
    
    const resp= await db.update(FriendRequest).set({ status: "ACCEPTED" }).where(eq(FriendRequest.id, requestId) && eq(FriendRequest.to, req.user.id)).returning();

    if(!resp || !resp[0]){
      return res.status(400).json({ error: "Invalid friend request" });
    }
    const {from,to} = resp[0];  
    if(!from || !to){
      return res.status(400).json({ error: "Invalid friend request data" });
    }
    await db.insert(MessageTable).values({
      senderId: from,
      receiverId: to,
      content: "Accepted friend request."       
    }).returning();
    console.log("Friend request accepted:", {from,to});
    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Accept friend request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const getFriendRequests = async (req: Request & { user?: { id: string } }, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    // 1. Create aliases for the users table
    const sender = aliasedTable(UsersTable, "sender");

    const requests = await db
      .select({
        id: FriendRequest.id,
        status: FriendRequest.status,
        createdAt: FriendRequest.createdAt,
        // Populate specific sender fields
        sender: {
          id: sender.id,
          name: sender.name,
          avator: sender.avator,
        },
      })
      .from(FriendRequest)
      .leftJoin(sender, eq(FriendRequest.from, sender.id)) // Join the sender
      .where(
        and(
          eq(FriendRequest.to, req.user.id),
          eq(FriendRequest.status, "PENDING")
        )
      );

    res.status(200).json({ requests });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}; 