"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeofenceRoutes = void 0;
const express_1 = __importDefault(require("express"));
const geofence_controller_1 = require("./geofence.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_constant_1 = require("../User/user.constant");
const router = express_1.default.Router();
// Check user location and send warning if in danger zone
router.post('/check', (0, auth_1.default)(user_constant_1.USER_ROLE.USER, user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.SUPER_ADMIN), geofence_controller_1.GeofenceController.checkUserLocation);
// Admin-only test endpoint to trigger geofence check for arbitrary user/coords
router.post('/test-check', (0, auth_1.default)(user_constant_1.USER_ROLE.SUPER_ADMIN, user_constant_1.USER_ROLE.ADMIN), geofence_controller_1.GeofenceController.triggerCheck);
// Get all active geofence zones
router.get('/zones', geofence_controller_1.GeofenceController.getGeofenceZones);
// Create new geofence zone (admin only)
router.post('/zones', (0, auth_1.default)(user_constant_1.USER_ROLE.SUPER_ADMIN, user_constant_1.USER_ROLE.ADMIN), geofence_controller_1.GeofenceController.createGeofenceZone);
// Update geofence zone (admin only)
router.patch('/zones/:id', (0, auth_1.default)(user_constant_1.USER_ROLE.SUPER_ADMIN, user_constant_1.USER_ROLE.ADMIN), geofence_controller_1.GeofenceController.updateGeofenceZone);
// Delete geofence zone (admin only)
router.delete('/zones/:id', (0, auth_1.default)(user_constant_1.USER_ROLE.SUPER_ADMIN, user_constant_1.USER_ROLE.ADMIN), geofence_controller_1.GeofenceController.deleteGeofenceZone);
// Get user location history
router.get('/history', (0, auth_1.default)(user_constant_1.USER_ROLE.USER, user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.SUPER_ADMIN), geofence_controller_1.GeofenceController.getUserLocationHistory);
// Record user location (for tracking and geofence detection)
router.post('/location', (0, auth_1.default)(user_constant_1.USER_ROLE.USER, user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.SUPER_ADMIN), geofence_controller_1.GeofenceController.recordLocation);
// Get user location history with limit
router.get('/location-history', (0, auth_1.default)(user_constant_1.USER_ROLE.USER, user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.SUPER_ADMIN), geofence_controller_1.GeofenceController.getUserLocationHistory);
// Auto-generate geofence zones from crime data (admin only)
router.post('/auto-generate', (0, auth_1.default)('ADMIN', user_constant_1.USER_ROLE.SUPER_ADMIN), geofence_controller_1.GeofenceController.autoGenerateZones);
exports.GeofenceRoutes = router;
