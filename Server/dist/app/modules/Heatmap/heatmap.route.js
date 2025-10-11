"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeatmapRoutes = void 0;
const express_1 = __importDefault(require("express"));
const heatmap_controller_1 = require("./heatmap.controller");
const router = express_1.default.Router();
// Get heatmap points for map visualization
router.get('/points', heatmap_controller_1.HeatmapControllers.getHeatmapPoints);
// Get district-level statistics
router.get('/districts', heatmap_controller_1.HeatmapControllers.getDistrictStats);
// Get division-level statistics
router.get('/divisions', heatmap_controller_1.HeatmapControllers.getDivisionStats);
// Get all districts with coordinates
router.get('/all-districts', heatmap_controller_1.HeatmapControllers.getAllDistricts);
// Get all divisions
router.get('/all-divisions', heatmap_controller_1.HeatmapControllers.getAllDivisions);
exports.HeatmapRoutes = router;
