import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { acceptFriendRequest, getFriendRequests, rejectFriendRequest, sendFriendRequest } from '../controllers/requestService';

const requestRouter = express.Router();

requestRouter.post('/',express.json(), authMiddleware,sendFriendRequest);
requestRouter.get('/',express.json(),authMiddleware,getFriendRequests);
requestRouter.patch('/accept',express.json(),authMiddleware,acceptFriendRequest);
requestRouter.patch('/reject',express.json(),authMiddleware,rejectFriendRequest);


export default requestRouter;

