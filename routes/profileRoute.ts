import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { deleteProfile, getProfile, updateProfile } from '../controllers/userService';

const profileRouter = express.Router();

profileRouter.get('/me',authMiddleware,getProfile)
.put('/me',authMiddleware,express.json(),updateProfile)
.delete('/me',authMiddleware,deleteProfile);

export default profileRouter;