import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import db from "../models/index";
import { UsersTable } from "../models/schema";

interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const secret = process.env.JWT_SECRET!;
    if (!secret) {
      throw new Error("JWT_SECRET is not set");
    }
    const decoded = jwt.verify(token||"", secret) as { userId: string; role: string };
    const [user] = await db.select().from(UsersTable).where(eq(UsersTable.id, decoded.userId));

    if (!user) {
      return res.status(401).json({ error: "Invalid token: user not found" });
    }

    req.user = { id: user.id, role: user.role||"CUSTOMER" };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};