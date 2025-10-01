import express from 'express';
import auth from '../../middlewares/auth';
import { FollowControllers } from './follow.controller';

const router = express.Router();

// Follow a user
router.post(
  '/:userId',
  auth('USER', 'ADMIN', 'SUPER_ADMIN'),
  FollowControllers.followUser
);

// Unfollow a user
router.delete(
  '/:userId',
  auth('USER', 'ADMIN', 'SUPER_ADMIN'),
  FollowControllers.unfollowUser
);

// Get followers of a user
router.get('/:userId/followers', FollowControllers.getFollowers);

// Get following list of a user
router.get('/:userId/following', FollowControllers.getFollowing);

// Check if current user is following another user
router.get(
  '/:userId/status',
  auth('USER', 'ADMIN', 'SUPER_ADMIN'),
  FollowControllers.checkFollowStatus
);

// Get follow statistics
router.get('/:userId/stats', FollowControllers.getFollowStats);

export const FollowRoutes = router;
