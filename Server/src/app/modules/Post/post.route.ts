import express from 'express';
import auth from '../../middlewares/auth';
import { PostControllers } from './post.controller';
import { parseBody } from '../../middlewares/bodyParser';
import { multerUpload } from '../../config/multer.config';
import { PostValidation } from './post.validation';
import validateRequest from '../../middlewares/validateRequest';
import { CommentControllers } from '../Comment/comment.controller';
import { USER_ROLE } from '../User/user.constant';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  multerUpload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ]),
  //validateImageFileRequest(ImageFilesArrayZodSchema),
  parseBody,
  //validateRequest(PostValidation.createPostValidationSchema),
  PostControllers.createPost
);

router.get(
  '/',
  (req, res, next) => {
    const authMiddleware = auth(
      USER_ROLE.ADMIN,
      USER_ROLE.ADMIN,
      USER_ROLE.SUPER_ADMIN
    );
    authMiddleware(req, res, () => {
      next();
    });
  },
  PostControllers.getAllPost
);

router.get('/:id', PostControllers.getSinglePost);

router.get('/:id/comments', CommentControllers.getCommentsByPost);

router.patch(
  '/:id',
  auth(USER_ROLE.ADMIN, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  multerUpload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ]),
  parseBody,
  validateRequest(PostValidation.updatePostValidationSchema),
  PostControllers.updatePost
);

router.delete(
  '/:id',
  auth(USER_ROLE.ADMIN, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  PostControllers.deletePost
);
router.post(
  '/:postId/upvote',
  auth(USER_ROLE.ADMIN, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  PostControllers.addPostUpvote
);
router.post(
  '/:postId/downvote',
  auth(USER_ROLE.ADMIN, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  PostControllers.addPostDownvote
);
router.delete(
  '/:postId/upvote',
  auth(USER_ROLE.ADMIN, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  PostControllers.removePostUpvote
);
router.delete(
  '/:postId/downvote',
  auth(USER_ROLE.ADMIN, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  PostControllers.removePostDownvote
);

// Report routes
router.post(
  '/:postId/report',
  auth(USER_ROLE.ADMIN, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  validateRequest(PostValidation.reportPostValidationSchema),
  PostControllers.reportPost
);

router.get(
  '/:postId/reports',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  PostControllers.getPostReports
);

// Get all pending reports (Admin only)
router.get(
  '/reports/pending',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  PostControllers.getAllPendingReports
);

// Review report (Approve or Reject) - Admin only
router.patch(
  '/reports/:reportId/review',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  validateRequest(PostValidation.reviewReportValidationSchema),
  PostControllers.reviewReport
);

export const PostRoutes = router;
