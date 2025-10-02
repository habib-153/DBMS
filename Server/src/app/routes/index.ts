import express from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { UserRoutes } from '../modules/User/user.route';
import { PostRoutes } from '../modules/Post/post.route';
import { CommentRoutes } from '../modules/Comment/comment.route';
import { FollowRoutes } from '../modules/Follow/follow.route';
import auth from '../middlewares/auth';
import { USER_ROLE } from '../modules/User/user.constant';
import { UserController } from '../modules/User/user.controller';
import { multerUpload } from '../config/multer.config';
import { parseBody } from '../middlewares/bodyParser';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/posts',
    route: PostRoutes,
  },
  {
    path: '/comments',
    route: CommentRoutes,
  },
  {
    path: '/follows',
    route: FollowRoutes,
  },
];

router.get(
  '/profile',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  UserController.getMyProfile
);

router.patch(
  '/profile',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  multerUpload.single('profilePhoto'),
  parseBody,
  UserController.updateMyProfile
);

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
