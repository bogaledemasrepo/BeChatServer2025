import express, { type Request, type Response } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getProfile, handleLogin, handleRegister } from '../controllers/authController';

const authRouter = express.Router();


const handleForgetPassword= (req: Request, res: Response) => {
  res.status(200).json({token:"ndrfknvknvskjfbvkjdbvdvhdjs jh j"})
}
authRouter.get('/me',authMiddleware,getProfile)
.post('/login',express.json(),handleLogin)
.post('/register',express.json(),handleRegister)
.post('/forget-password',express.json(),handleForgetPassword)

export default authRouter;