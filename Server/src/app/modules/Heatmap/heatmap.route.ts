import express from 'express';
import { HeatmapControllers } from './heatmap.controller';

const router = express.Router();

// Get heatmap points for map visualization
router.get('/points', HeatmapControllers.getHeatmapPoints);

// Get district-level statistics
router.get('/districts', HeatmapControllers.getDistrictStats);

// Get division-level statistics
router.get('/divisions', HeatmapControllers.getDivisionStats);

// Get all districts with coordinates
router.get('/all-districts', HeatmapControllers.getAllDistricts);

// Get all divisions
router.get('/all-divisions', HeatmapControllers.getAllDivisions);

export const HeatmapRoutes = router;
