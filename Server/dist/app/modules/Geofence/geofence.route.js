"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeofenceRoutes = void 0;
const express_1 = __importDefault(require("express"));
const geofence_controller_1 = require("./geofence.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
// Check user location and send warning if in danger zone
router.post('/check', (0, auth_1.default)('USER', 'ADMIN'), geofence_controller_1.GeofenceController.checkUserLocation);
// Get all active geofence zones
router.get('/zones', geofence_controller_1.GeofenceController.getGeofenceZones);
// Create new geofence zone (admin only)
router.post('/zones', (0, auth_1.default)('ADMIN'), geofence_controller_1.GeofenceController.createGeofenceZone);
// Get user location history
router.get('/history', (0, auth_1.default)('USER', 'ADMIN'), geofence_controller_1.GeofenceController.getUserLocationHistory);
// Auto-generate geofence zones from crime data (admin only)
router.post('/auto-generate', (0, auth_1.default)('ADMIN'), geofence_controller_1.GeofenceController.autoGenerateZones);
exports.GeofenceRoutes = router;
