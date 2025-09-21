import express from 'express';
import auth from '../../middlewares/auth';
import { PostControllers } from './post.controller';
import { parseBody } from '../../middlewares/bodyParser';
import { multerUpload } from '../../config/multer.config';
import { PostValidation } from './post.validation';
import validateRequest from '../../middlewares/validateRequest';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post(
  '/create',
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  multerUpload.single('image'),
  //validateImageFileRequest(ImageFilesArrayZodSchema),
  parseBody,
  //validateRequest(PostValidation.createPostValidationSchema),
  PostControllers.createPost
);

router.get('/', PostControllers.getAllPost);

router.get('/:id', PostControllers.getSinglePost);

router.patch(
  '/:id',
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  multerUpload.single('image'),
  parseBody,
  validateRequest(PostValidation.updatePostValidationSchema),
  PostControllers.updatePost
);

router.delete('/:id', auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN), PostControllers.deletePost);
router.post(
  '/:postId/upvote',
  auth(UserRole.USER, UserRole.SUPER_ADMIN, UserRole.ADMIN),
  PostControllers.addPostUpvote
);
router.post('/:postId/downvote', auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN), PostControllers.addPostDownvote);
router.delete('/:postId/upvote', auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN), PostControllers.removePostUpvote);
router.delete('/:postId/downvote', auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN), PostControllers.removePostDownvote);

export const PostRoutes = router;