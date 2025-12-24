import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { deleteProfile, getProfile, updateProfile, uploadGalleryPhoto } from '../controllers/userService';
import { uploadPhoto } from '../lib/file_upload';

const profileRouter = express.Router();

profileRouter.get('/me',authMiddleware,getProfile)
.patch('/me',authMiddleware,express.json(),updateProfile)
.delete('/me',authMiddleware,deleteProfile)
.post("/photos",authMiddleware,uploadPhoto.single("photos"),uploadGalleryPhoto)


export default profileRouter;