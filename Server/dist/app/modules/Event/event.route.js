"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_constant_1 = require("../User/user.constant");
const event_controller_1 = require("./event.controller");
const bodyParser_1 = require("../../middlewares/bodyParser");
const multer_config_1 = require("../../config/multer.config");
const router = express_1.default.Router();
// Event CRUD routes
router.post('/', multer_config_1.multerUpload.array('images', 5), bodyParser_1.parseBody, event_controller_1.EventControllers.createEvent);
router.get('/', event_controller_1.EventControllers.getAllEvents);
router.get('/:id', event_controller_1.EventControllers.getSingleEvent);
router.put('/:id', (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), multer_config_1.multerUpload.array('images', 5), bodyParser_1.parseBody, event_controller_1.EventControllers.updateEvent);
router.delete('/:id', (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), event_controller_1.EventControllers.deleteEvent);
// Event registration routes
router.post('/register', multer_config_1.multerUpload.fields([
    { name: 'image_0', maxCount: 1 },
    { name: 'image_1', maxCount: 1 },
]), bodyParser_1.parseBody, event_controller_1.EventControllers.registerForEvent);
router.get('/:eventId/registrations', (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), event_controller_1.EventControllers.getEventRegistrations);
router.patch('/registrations/:registrationId/status', (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), event_controller_1.EventControllers.updateRegistrationStatus);
router.get('/tracking/:trackingNumber', event_controller_1.EventControllers.getRegistrationByTrackingNumber);
exports.EventRoutes = router;
