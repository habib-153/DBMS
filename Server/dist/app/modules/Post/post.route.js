"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_constant_1 = require("../User/user.constant");
const post_controller_1 = require("./post.controller");
const bodyParser_1 = require("../../middlewares/bodyParser");
const multer_config_1 = require("../../config/multer.config");
const post_validation_1 = require("./post.validation");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const router = express_1.default.Router();
router.post('/', 
//auth(USER_ROLE.USER, USER_ROLE.ADMIN),
multer_config_1.multerUpload.single('image'), 
//validateImageFileRequest(ImageFilesArrayZodSchema),
bodyParser_1.parseBody, 
//validateRequest(PostValidation.createPostValidationSchema),
post_controller_1.PostControllers.createPost);
router.get('/', post_controller_1.PostControllers.getAllPost);
router.get('/:id', post_controller_1.PostControllers.getSinglePost);
router.put('/:id', multer_config_1.multerUpload.single('image'), (0, auth_1.default)(user_constant_1.USER_ROLE.USER), bodyParser_1.parseBody, (0, validateRequest_1.default)(post_validation_1.PostValidation.updatePostValidationSchema), post_controller_1.PostControllers.updatePost);
router.delete('/:id', (0, auth_1.default)(user_constant_1.USER_ROLE.USER, user_constant_1.USER_ROLE.ADMIN), post_controller_1.PostControllers.deletePost);
router.post('/:postId/upvote', (0, auth_1.default)(user_constant_1.USER_ROLE.USER), post_controller_1.PostControllers.addPostUpvote);
router.post('/:postId/downvote', (0, auth_1.default)(user_constant_1.USER_ROLE.USER), post_controller_1.PostControllers.addPostDownvote);
router.delete('/:postId/upvote', (0, auth_1.default)(user_constant_1.USER_ROLE.USER), post_controller_1.PostControllers.removePostUpvote);
router.delete('/:postId/downvote', (0, auth_1.default)(user_constant_1.USER_ROLE.USER), post_controller_1.PostControllers.removePostDownvote);
exports.PostRoutes = router;
