import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { acceptFriendRequest, getFriendRequests, rejectFriendRequest, sendFriendRequest } from '../controllers/requestService';

const requestRouter = express.Router();

requestRouter.post('/',express.json(), authMiddleware,sendFriendRequest);
requestRouter.get('/',express.json(),authMiddleware,getFriendRequests);
requestRouter.post('/:requestId/accept',express.json(),authMiddleware,acceptFriendRequest);
requestRouter.post('/:requestId/reject',express.json(),authMiddleware,rejectFriendRequest);


export default requestRouter;

