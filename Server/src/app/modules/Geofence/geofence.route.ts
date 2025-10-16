import express from 'express';
import { GeofenceController } from './geofence.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

// Check user location and send warning if in danger zone
router.post(
  '/check',
  auth('USER', 'ADMIN'),
  GeofenceController.checkUserLocation
);

// Get all active geofence zones
router.get('/zones', GeofenceController.getGeofenceZones);

// Create new geofence zone (admin only)
router.post('/zones', auth('ADMIN'), GeofenceController.createGeofenceZone);

// Get user location history
router.get(
  '/history',
  auth('USER', 'ADMIN'),
  GeofenceController.getUserLocationHistory
);

// Auto-generate geofence zones from crime data (admin only)
router.post(
  '/auto-generate',
  auth('ADMIN'),
  GeofenceController.autoGenerateZones
);

export const GeofenceRoutes = router;
