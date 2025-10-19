import express from 'express';
import auth from '../../middlewares/auth';
import { CommentControllers } from './comment.controller';
import { parseBody } from '../../middlewares/bodyParser';
import { multerUpload } from '../../config/multer.config';

const router = express.Router();

router.post(
  '/',
  auth('USER', 'ADMIN', 'SUPER_ADMIN'),
  multerUpload.single('image'),
  parseBody,
  CommentControllers.createComment
);
router.patch(
  '/:id',
  auth('USER', 'ADMIN', 'SUPER_ADMIN'),
  multerUpload.single('image'),
  parseBody,
  CommentControllers.updateComment
);
router.delete(
  '/:id',
  auth('USER', 'ADMIN', 'SUPER_ADMIN'),
  CommentControllers.deleteComment
);

router.post(
  '/:commentId/upvote',
  auth('USER', 'ADMIN', 'SUPER_ADMIN'),
  CommentControllers.addCommentUpvote
);

router.post(
  '/:commentId/downvote',
  auth('USER', 'ADMIN', 'SUPER_ADMIN'),
  CommentControllers.addCommentDownvote
);

router.delete(
  '/:commentId/upvote',
  auth('USER', 'ADMIN', 'SUPER_ADMIN'),
  CommentControllers.removeCommentUpvote
);

router.delete(
  '/:commentId/downvote',
  auth('USER', 'ADMIN', 'SUPER_ADMIN'),
  CommentControllers.removeCommentDownvote
);

export const CommentRoutes = router;
