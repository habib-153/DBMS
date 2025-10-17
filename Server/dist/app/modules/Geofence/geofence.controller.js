"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeofenceController = void 0;
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const geofence_service_1 = require("./geofence.service");
const catchAsync_1 = require("../../utils/catchAsync");
const checkUserLocation = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { latitude, longitude } = req.body;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: 'User not authenticated',
            data: null,
        });
    }
    if (!latitude || !longitude) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: 'Latitude and longitude are required',
            data: null,
        });
    }
    const result = yield geofence_service_1.GeofenceService.recordUserLocation({
        userId,
        latitude,
        longitude,
    }, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Location checked successfully',
        data: result,
    });
}));
const getGeofenceZones = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const zones = yield geofence_service_1.GeofenceService.getActiveGeofenceZones();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Geofence zones retrieved successfully',
        data: zones,
    });
}));
const createGeofenceZone = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const zoneData = req.body;
    const result = yield geofence_service_1.GeofenceService.createGeofenceZone(zoneData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Geofence zone created successfully',
        data: result,
    });
}));
const getUserLocationHistory = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const limit = parseInt(req.query.limit) || 100;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: 'User not authenticated',
            data: null,
        });
    }
    const history = yield geofence_service_1.GeofenceService.getUserLocationHistory(userId, limit);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Location history retrieved successfully',
        data: history,
    });
}));
const recordLocation = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { latitude, longitude, accuracy, address, activity } = req.body;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: 'User not authenticated',
            data: null,
        });
    }
    if (!latitude || !longitude) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: 'Latitude and longitude are required',
            data: null,
        });
    }
    const result = yield geofence_service_1.GeofenceService.recordUserLocation({
        userId,
        latitude,
        longitude,
        accuracy,
        address,
        activity,
    }, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Location recorded successfully',
        data: result,
    });
}));
const triggerCheck = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Admin testing endpoint to force a geofence check for any user
    const { userId, latitude, longitude } = req.body;
    if (!userId || !latitude || !longitude) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: 'userId, latitude and longitude are required',
            data: null,
        });
    }
    const result = yield geofence_service_1.GeofenceService.recordUserLocation({
        userId,
        latitude,
        longitude,
    }, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Test geofence check executed',
        data: result,
    });
}));
const autoGenerateZones = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield geofence_service_1.GeofenceService.autoGenerateGeofenceZones();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `Auto-generated ${result.created} geofence zones from ${result.totalHotspots} hotspots (${result.skipped} skipped - already exist)`,
        data: result,
    });
}));
const updateGeofenceZone = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updateData = req.body;
    const result = yield geofence_service_1.GeofenceService.updateGeofenceZone(id, updateData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Geofence zone updated successfully',
        data: result,
    });
}));
const deleteGeofenceZone = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield geofence_service_1.GeofenceService.deleteGeofenceZone(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Geofence zone deleted successfully',
        data: null,
    });
}));
exports.GeofenceController = {
    checkUserLocation,
    getGeofenceZones,
    createGeofenceZone,
    updateGeofenceZone,
    deleteGeofenceZone,
    getUserLocationHistory,
    recordLocation,
    autoGenerateZones,
    triggerCheck,
};
