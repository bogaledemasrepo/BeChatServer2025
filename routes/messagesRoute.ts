import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { deleteMessage, markMessageAsRead, sendMessage, updateMessage } from '../controllers/messageService';

const messagesRouter = express.Router();

messagesRouter.post('/',authMiddleware,sendMessage)
.get('/markRead',authMiddleware,markMessageAsRead)
.put('/:id',authMiddleware,updateMessage)
.delete('/:id',authMiddleware,deleteMessage);

export default messagesRouter;