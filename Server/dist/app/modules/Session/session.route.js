"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionRoutes = void 0;
const express_1 = __importDefault(require("express"));
const session_controller_1 = require("./session.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
// Get all user sessions
router.get('/all', (0, auth_1.default)('USER', 'ADMIN'), session_controller_1.SessionController.getUserSessions);
// Get active sessions only
router.get('/active', (0, auth_1.default)('USER', 'ADMIN'), session_controller_1.SessionController.getActiveSessions);
// End a specific session
router.post('/end', (0, auth_1.default)('USER', 'ADMIN'), session_controller_1.SessionController.endSession);
// End all user sessions (logout from all devices)
router.post('/end-all', (0, auth_1.default)('USER', 'ADMIN'), session_controller_1.SessionController.endAllSessions);
exports.SessionRoutes = router;
