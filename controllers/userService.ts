import type { Request, Response } from "express";
import db from "../models/index";
import { UsersTable, MessageTable, ProfileTable } from "../models/schema";
import { eq,not, or, sql, desc, ne } from "drizzle-orm";
import { aliasedTable } from "drizzle-orm/alias";
import type { UUID } from "crypto";
import { notEqual } from "assert";
interface ProfileResponse {
  bio: string;
  birthDate: string;
  photos: any;
  name: string;
  email: string;
  avator: string;
  isOnline: boolean;
}

export const getProfile = async (
  req: Request & { user?: { id: string; role: string } },
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const [user] = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.id, req.user.id));
    const [profileData] = await db
      .select()
      .from(ProfileTable)
      .where(eq(ProfileTable.userId, req.user.id));
    if (!user) throw new Error("Internl server error.");
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avator: user.avator,
      ...profileData,
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProfile = async (
  req: Request & { user?: { id: UUID; role: string } },
  res: Response
) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { name, email, bio, birthDate, avator, isOnline } = req.body || {};

    // 1. Prepare Profile Data
    let profileData: any = {};
    if (bio) profileData.bio = bio;
    if (birthDate) profileData.birthDate = birthDate; // Use code key 'birthDate'
    if (req.file) {
      const photoUrl = `${req.protocol}://${req.get("host")}/photos/${
        req.file.filename
      }`;
      profileData.photos = sql`array_append(${ProfileTable.photos}, ${photoUrl})`;
    }

    let responseData: any = {};

    // 2. Update/Insert Profile ONLY if there is data
    if (Object.keys(profileData).length > 0) {
      const [existing] = await db
        .select()
        .from(ProfileTable)
        .where(eq(ProfileTable.userId, req.user.id));

      if (existing) {
        const updatedProfile = await db
          .update(ProfileTable)
          .set(profileData)
          .where(eq(ProfileTable.userId, req.user.id))
          .returning();
        responseData = { ...updatedProfile[0] };
      } else {
        const insertedProfile = await db
          .insert(ProfileTable)
          .values({ userId: req.user.id, ...profileData })
          .returning();
        responseData = { ...insertedProfile[0] };
      }
    }

    // 3. Prepare User Data
    let userData: any = {};
    if (name) userData.name = name;
    if (email) userData.email = email;
    if (avator) userData.avator = avator;
    if (isOnline !== undefined) userData.isOnline = isOnline; // Fix: use = not ==

    // 4. Update User ONLY if there is data
    if (Object.keys(userData).length > 0) {
      const updatedUser = await db
        .update(UsersTable)
        .set(userData)
        .where(eq(UsersTable.id, req.user.id))
        .returning();

      responseData = { ...responseData, ...updatedUser[0] };
    } else {
      const [u] = await db
        .select()
        .from(UsersTable)
        .where(eq(UsersTable.id, req.user.id));
      responseData = {
        ...responseData,
        ...{
          email: u?.email,
          id: u?.id,
          avator: u?.avator,
          isOnline: u?.isOnline,
        },
      };
    }

    // If nothing was updated at all
    if (Object.keys(responseData).length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    res.json(responseData);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteProfile = async (
  req: Request & { user?: { id: string; role: string } },
  res: Response
) => {
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
};
export const getFriendsList = async (
  req: Request & { user?: { id: string; role: string } },
  res: Response
) => {
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
      .selectDistinctOn(
        [
          sql`LEAST(${MessageTable.senderId}, ${MessageTable.receiverId})`,
          sql`GREATEST(${MessageTable.senderId}, ${MessageTable.receiverId})`,
        ],
        {
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
            isOnline: friend.isOnline,
          },
        }
      )
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
        END))`,
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
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Get friends error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllUsers = async (req: Request & { user?: { id: UUID; role: string } }, res: Response) => {
  try {
    // 1. Extract and parse query parameters with defaults
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    // console.log("Get all users req query ",req.query)
    // 2. Fetch paginated data
    const users = await db
      .select()
      .from(UsersTable).where(ne(UsersTable.id,req.user?.id||""))
      .limit(limit)
      .offset(offset);

    // 3. Optional: Fetch total count for the frontend to calculate pages
    const [totalCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(UsersTable);

    res.json({
      data: users,
      meta: {
        totalItems: Number(totalCount?.count || 0),
        totalPages: Math.ceil(Number(totalCount?.count || 0) / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getUserDetail = async (
  req: Request & { user?: { id: string; role: string } },
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.params.id as string;
    const [user] = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.id, userId));
    if (!user) return res.status(404).json({ error: "user not found!" });
    const [data] = await db
      .select()
      .from(ProfileTable)
      .where(eq(ProfileTable.userId, userId));
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avator: user.avator,
      ...data,
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const uploadGalleryPhoto = async (
  req: Request & { user?: { id: string; role: string } },
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!req.file)
      return res
        .status(400)
        .json({ error: "Please provide a photo to upload!" });
    const result = await db
      .update(ProfileTable)
      .set({
        photos: sql`array_append(${ProfileTable.photos}, ${`${
          req.protocol
        }://${req.get("host")}/photos/${req.file.filename}`})`,
      })
      .where(eq(ProfileTable.userId, req.user.id))
      .returning();

    return res.json(result);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// await db.update(ProfileTable)
//   .set({
//     photos: sql`array_remove(${ProfileTable.photos}, ${photoUrlToRemove})`
//   })
//   .where(eq(ProfileTable.userId, currentUserId));
