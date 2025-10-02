"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = require("../modules/Auth/auth.route");
const user_route_1 = require("../modules/User/user.route");
const post_route_1 = require("../modules/Post/post.route");
const comment_route_1 = require("../modules/Comment/comment.route");
const follow_route_1 = require("../modules/Follow/follow.route");
const auth_1 = __importDefault(require("../middlewares/auth"));
const user_constant_1 = require("../modules/User/user.constant");
const user_controller_1 = require("../modules/User/user.controller");
const multer_config_1 = require("../config/multer.config");
const bodyParser_1 = require("../middlewares/bodyParser");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: '/auth',
        route: auth_route_1.AuthRoutes,
    },
    {
        path: '/users',
        route: user_route_1.UserRoutes,
    },
    {
        path: '/posts',
        route: post_route_1.PostRoutes,
    },
    {
        path: '/comments',
        route: comment_route_1.CommentRoutes,
    },
    {
        path: '/follows',
        route: follow_route_1.FollowRoutes,
    },
];
router.get('/profile', (0, auth_1.default)(user_constant_1.USER_ROLE.USER, user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.SUPER_ADMIN), user_controller_1.UserController.getMyProfile);
router.patch('/profile', (0, auth_1.default)(user_constant_1.USER_ROLE.USER, user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.SUPER_ADMIN), multer_config_1.multerUpload.single('profilePhoto'), bodyParser_1.parseBody, user_controller_1.UserController.updateMyProfile);
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
