import express from 'express';
import { GeofenceController } from './geofence.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';

const router = express.Router();

// Check user location and send warning if in danger zone
router.post(
  '/check',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  GeofenceController.checkUserLocation
);

// Admin-only test endpoint to trigger geofence check for arbitrary user/coords
router.post(
  '/test-check',
  auth('ADMIN', 'SUPER_ADMIN'),
  GeofenceController.triggerCheck
);

// Get all active geofence zones
router.get('/zones', GeofenceController.getGeofenceZones);

// Create new geofence zone (admin only)
router.post(
  '/zones',
  auth('ADMIN', 'SUPER_ADMIN'),
  GeofenceController.createGeofenceZone
);

// Update geofence zone (admin only)
router.patch(
  '/zones/:id',
  auth('ADMIN', 'SUPER_ADMIN'),
  GeofenceController.updateGeofenceZone
);

// Delete geofence zone (admin only)
router.delete(
  '/zones/:id',
  auth('ADMIN', 'SUPER_ADMIN'),
  GeofenceController.deleteGeofenceZone
);

// Get user location history
router.get(
  '/history',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  GeofenceController.getUserLocationHistory
);

// Record user location (for tracking and geofence detection)
router.post(
  '/location',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  GeofenceController.recordLocation
);

// Get user location history with limit
router.get(
  '/location-history',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  GeofenceController.getUserLocationHistory
);

// Auto-generate geofence zones from crime data (admin only)
router.post(
  '/auto-generate',
  auth('ADMIN'),
  GeofenceController.autoGenerateZones
);

export const GeofenceRoutes = router;
