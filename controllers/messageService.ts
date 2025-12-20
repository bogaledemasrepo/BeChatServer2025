import type { Request, Response } from "express";
import db from "../models/index";
import { MessageTable } from "../models/schema";
import { eq } from "drizzle-orm";

export const sendMessage = async (req: Request & { user?: { id: string; role: string } }, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { receiverId, content } = req.body;
    if (!receiverId || !content) {
      return res.status(400).json({ error: "Recipient ID and content are required" });
    }

    const newMessage = await db.insert(MessageTable).values({
      senderId: req.user.id,
      receiverId,
      content,
      createdAt: new Date(),
    }).returning();

    res.status(201).json(newMessage[0]);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const getMessages = async (req: Request & { user?: { id: string; role: string } }, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { friendId } = req.params;
    if (!friendId) {
      return res.status(400).json({ error: "Friend ID is required" });
    }
    const messages = await db.select().from(MessageTable).where(eq(MessageTable.receiverId, req.user.id) && eq(MessageTable.senderId, friendId)).orderBy(MessageTable.createdAt);

        res.status(201).json(messages);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const markMessageAsRead = async (req: Request & { user?: { id: string; role: string } }, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { messageId } = req.params;
    if (!messageId) {
      return res.status(400).json({ error: "Message ID is required" });
    }

    const updatedMessage = await db.update(MessageTable).set({ unread: false }).where(eq(MessageTable.id, messageId) && eq(MessageTable.receiverId, req.user.id)).returning();

    res.status(200).json(updatedMessage[0]);
  } catch (error) {
    console.error("Mark message as read error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
export const updateMessage = async (req: Request & { user?: { id: string; role: string } }, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { messageId } = req.params;
    const { content, fileUrl } = req.body;
    if (!messageId) {
      return res.status(400).json({ error: "Message ID is required" });
    }

    const updatedMessage = await db.update(MessageTable).set({ content, fileUrl }).where(eq(MessageTable.id, messageId) && eq(MessageTable.senderId, req.user.id)).returning();

    res.status(200).json(updatedMessage[0]);
  } catch (error) {
    console.error("Update message error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const deleteMessage = async (req: Request & { user?: { id: string; role: string } }, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { messageId } = req.params;
    if (!messageId) {
      return res.status(400).json({ error: "Message ID is required" });
    }

    await db.delete(MessageTable).where(eq(MessageTable.id, messageId) && (eq(MessageTable.senderId, req.user.id) || eq(MessageTable.receiverId, req.user.id)));

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}