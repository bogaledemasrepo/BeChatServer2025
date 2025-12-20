import type { Request, Response } from "express";
import db from "../models/index";
import { FriendRequest } from "../models/schema";
import { eq } from "drizzle-orm";

export const sendFriendRequest = async (req: Request & { user?: { id: string; role: string } }, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { reciverId } = req.body;
    if (!reciverId) {
      return res.status(400).json({ error: "Recipient ID is required" });
    }
    db.insert(FriendRequest).values({
      from: req.user.id,
      to: reciverId
    });
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
    const { requestId } = req.params;
    if (!requestId) {
      return res.status(400).json({ error: "Request ID is required" });
    }
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
    const { requestId } = req.params;
    if (!requestId) {
      return res.status(400).json({ error: "Request ID is required" });
    }
    await db.update(FriendRequest).set({ status: "ACCEPTED" }).where(eq(FriendRequest.id, requestId) && eq(FriendRequest.to, req.user.id));
    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Accept friend request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const getFriendRequests = async (req: Request & { user?: { id: string; role: string } }, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const requests = await db.select().from(FriendRequest).where(eq(FriendRequest.to, req.user.id) && eq(FriendRequest.status, "PENDING"));
    res.status(200).json({ requests });
  } catch (error) {
    console.error("Get friend requests error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}   