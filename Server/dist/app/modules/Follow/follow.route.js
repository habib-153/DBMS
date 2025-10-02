"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const follow_controller_1 = require("./follow.controller");
const router = express_1.default.Router();
// Follow a user
router.post('/:userId', (0, auth_1.default)('USER', 'ADMIN', 'SUPER_ADMIN'), follow_controller_1.FollowControllers.followUser);
// Unfollow a user
router.delete('/:userId', (0, auth_1.default)('USER', 'ADMIN', 'SUPER_ADMIN'), follow_controller_1.FollowControllers.unfollowUser);
// Get followers of a user
router.get('/:userId/followers', follow_controller_1.FollowControllers.getFollowers);
// Get following list of a user
router.get('/:userId/following', follow_controller_1.FollowControllers.getFollowing);
// Check if current user is following another user
router.get('/:userId/status', (0, auth_1.default)('USER', 'ADMIN', 'SUPER_ADMIN'), follow_controller_1.FollowControllers.checkFollowStatus);
// Get follow statistics
router.get('/:userId/stats', follow_controller_1.FollowControllers.getFollowStats);
exports.FollowRoutes = router;
