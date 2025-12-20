import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { sendFriendRequest } from '../controllers/requestService';

const requestRouter = express.Router();

requestRouter.post('/',authMiddleware,sendFriendRequest);
requestRouter.get('/',authMiddleware,sendFriendRequest);
requestRouter.post('/:requestId/accept',authMiddleware,sendFriendRequest);
requestRouter.post('/:requestId/reject',authMiddleware,sendFriendRequest);


export default requestRouter;

