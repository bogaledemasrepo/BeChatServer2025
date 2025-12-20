import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../models/index";
import { UsersTable } from "../models/schema";
import nodemailer from "nodemailer";
export const handleRegister = async (req: Request, res: Response) => {
  console.log("Register req body ",req.body)
  try {
    const { name, email, password, avator, role } = req.body;
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    // Check if email exists
    const existingUser = await db.select().from(UsersTable).where(eq(UsersTable.email, email));
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const [newUser] = await db
      .insert(UsersTable)
      .values({
        name,
        email,
        password: hashedPassword,
        avator: avator || null,
        role: role || "CUSTOMER",
      })
      .returning();
      if(!newUser) return new Error("Internal serer error.");
      // Generate JWT
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error("JWT_SECRET is not set");
      }
    const token = jwt.sign({ userId: newUser.id, role: newUser.role }, secret, { expiresIn: "12h" });

    res.status(201).json({ token, user: { id: newUser.id, name, email, role: newUser.role,avator:newUser.avator } });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
export const handleLogin =  async (req: Request, res: Response) => {
  console.log("Login req body ",req.body)
  try {
    const { email, password } = req.body;
      

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const [user] = await db.select().from(UsersTable).where(eq(UsersTable.email, email));
    
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not set");
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, secret, { expiresIn: "12h" });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role,avator:user.avator } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const getProfile = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.user.id;

    const [user] = await db.select().from(UsersTable).where(eq(UsersTable.id, userId));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role,avator:user.avator } });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
const handleSendEmail=async (email:string,content:string)=>{
  const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: "maddison53@ethereal.email",
    pass: "jn7jnAPss4f63QBp6D",
  },
});

// Send an email using async/await
  const info = await transporter.sendMail({
    from: '"Maddison Foo Koch" <maddison53@ethereal.email>',
    to: "bar@example.com, baz@example.com",
    subject: "Hello ✔",
    text: "Hello world?", // Plain-text version of the message
    html: "<b>Hello world?</b>", // HTML version of the message
  });

  console.log("Message sent:", info.messageId);
  
  console.log(`Sending email to ${email} with content: ${content}`);
  return true;


}
export const handleForgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const [user] = await db.select().from(UsersTable).where(eq(UsersTable.email, email));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    handleSendEmail(email,"This is a test email for password reset.");
    // Here you would normally send a password reset email
    // For simplicity, we'll just return a success message

    res.json({ message: "Password reset link has been sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}