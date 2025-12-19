import express, { type Request, type Response } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getProfile, handleLogin, handleRegister } from '../controllers/authController';

const messagesRoute = express.Router();

messagesRoute.get('/me',authMiddleware,getProfile)
.post('/login',authMiddleware,handleLogin)
.post('/register',authMiddleware,handleRegister)

export default messagesRoute;