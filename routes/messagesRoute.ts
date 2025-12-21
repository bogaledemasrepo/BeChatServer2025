import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { deleteMessage, getMessages, markMessageAsRead, sendMessage, updateMessage } from '../controllers/messageService';

const messagesRouter = express.Router();

messagesRouter.post('/',authMiddleware,express.json(),sendMessage)
.get("/:friendId",authMiddleware,express.json(),getMessages)
.get('/markRead',authMiddleware,markMessageAsRead)
.put('/:messageId',authMiddleware,express.json(),updateMessage)
.delete('/:messageId',authMiddleware,deleteMessage);

export default messagesRouter;