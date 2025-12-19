import type { Request, Response } from "express";
import db from "../models/index";
import { UsersTable } from "../models/schema";
import { eq } from "drizzle-orm";

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

export const uploadFree = async (req: Request, res: Response) => {
  try {
    if(req.file) return res.json({url:`${req.protocol}://${req.get("host")}/photos/${req.file.filename}`});
    throw Error("Something went wrong!")
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
