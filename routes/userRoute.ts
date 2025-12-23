import express, { type Request, type Response } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getAllUsers, getFriendsList, getUserDetail } from '../controllers/userService';

const userRouter = express.Router();

userRouter.get('/friends',express.json(),authMiddleware,getFriendsList)

.get('/explore',express.json(),authMiddleware,getAllUsers)
.get('/friends/:id',express.json(),authMiddleware,getUserDetail)

export default userRouter;