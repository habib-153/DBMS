"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const post_controller_1 = require("./post.controller");
const bodyParser_1 = require("../../middlewares/bodyParser");
const multer_config_1 = require("../../config/multer.config");
const post_validation_1 = require("./post.validation");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const comment_controller_1 = require("../Comment/comment.controller");
const user_constant_1 = require("../User/user.constant");
const router = express_1.default.Router();
router.post('/create', (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.SUPER_ADMIN), multer_config_1.multerUpload.single('image'), 
//validateImageFileRequest(ImageFilesArrayZodSchema),
bodyParser_1.parseBody, 
//validateRequest(PostValidation.createPostValidationSchema),
post_controller_1.PostControllers.createPost);
router.get('/', (req, res, next) => {
    const authMiddleware = (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.SUPER_ADMIN);
    authMiddleware(req, res, () => {
        next();
    });
}, post_controller_1.PostControllers.getAllPost);
router.get('/:id', post_controller_1.PostControllers.getSinglePost);
router.get('/:id/comments', comment_controller_1.CommentControllers.getCommentsByPost);
router.patch('/:id', (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.SUPER_ADMIN), multer_config_1.multerUpload.single('image'), bodyParser_1.parseBody, (0, validateRequest_1.default)(post_validation_1.PostValidation.updatePostValidationSchema), post_controller_1.PostControllers.updatePost);
router.delete('/:id', (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.SUPER_ADMIN), post_controller_1.PostControllers.deletePost);
router.post('/:postId/upvote', (0, auth_1.default)('USER', 'SUPER_ADMIN', 'ADMIN'), post_controller_1.PostControllers.addPostUpvote);
router.post('/:postId/downvote', (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.SUPER_ADMIN), post_controller_1.PostControllers.addPostDownvote);
router.delete('/:postId/upvote', (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.SUPER_ADMIN), post_controller_1.PostControllers.removePostUpvote);
router.delete('/:postId/downvote', (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.SUPER_ADMIN), post_controller_1.PostControllers.removePostDownvote);
// Report routes
router.post('/:postId/report', (0, auth_1.default)('USER', 'ADMIN', 'SUPER_ADMIN'), (0, validateRequest_1.default)(post_validation_1.PostValidation.reportPostValidationSchema), post_controller_1.PostControllers.reportPost);
router.get('/:postId/reports', (0, auth_1.default)('ADMIN', 'SUPER_ADMIN'), post_controller_1.PostControllers.getPostReports);
// Get all pending reports (Admin only)
router.get('/reports/pending', (0, auth_1.default)('ADMIN', 'SUPER_ADMIN'), post_controller_1.PostControllers.getAllPendingReports);
// Review report (Approve or Reject) - Admin only
router.patch('/reports/:reportId/review', (0, auth_1.default)('ADMIN', 'SUPER_ADMIN'), (0, validateRequest_1.default)(post_validation_1.PostValidation.reviewReportValidationSchema), post_controller_1.PostControllers.reviewReport);
exports.PostRoutes = router;
