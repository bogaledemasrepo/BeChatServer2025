import express, { type Request, type Response } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getAllUsers, getFriendsList } from '../controllers/userService';

const userRouter = express.Router();

userRouter.get('/friends',express.json(),authMiddleware,getFriendsList)

.get('/explore',express.json(),authMiddleware,getAllUsers)
.get('/:id',express.json(),authMiddleware,(req: Request, res: Response) => {
  res.status(200).json({message:"User id route is working!"})
})

export default userRouter;