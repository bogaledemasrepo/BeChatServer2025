import express, { type Request, type Response } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getFriendsList } from '../controllers/userService';

const userRouter = express.Router();

userRouter.get('/me',authMiddleware,(req: Request, res: Response) => {
  res.status(200).json({message:"User me route is working!"})
})
.get('/friends',authMiddleware,getFriendsList)

.get('/paged',authMiddleware,(req: Request, res: Response) => {
  res.status(200).json({message:"User paged route is working!"})
})
.get('/:id',authMiddleware,(req: Request, res: Response) => {
  res.status(200).json({message:"User id route is working!"})
})
.put('/:id',authMiddleware,(req: Request, res: Response) => {
  res.status(200).json({message:"User id route is working!"})
})
.delete('/:id',authMiddleware,(req: Request, res: Response) => {
  res.status(200).json({message:"User id route is working!"})
});
export default userRouter;