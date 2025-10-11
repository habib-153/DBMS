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
exports.HeatmapControllers = void 0;
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const heatmap_service_1 = require("./heatmap.service");
const catchAsync_1 = require("../../utils/catchAsync");
// Get heatmap point data for map overlay
const getHeatmapPoints = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        districts: req.query.districts
            ? req.query.districts.split(',')
            : undefined,
        divisions: req.query.divisions
            ? req.query.divisions.split(',')
            : undefined,
        status: req.query.status,
        minVerificationScore: req.query.minVerificationScore
            ? parseInt(req.query.minVerificationScore)
            : undefined,
    };
    const result = yield heatmap_service_1.HeatmapService.getHeatmapPoints(filters);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Heatmap points retrieved successfully',
        data: result,
    });
}));
// Get district-level crime statistics
const getDistrictStats = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        divisions: req.query.divisions
            ? req.query.divisions.split(',')
            : undefined,
    };
    const result = yield heatmap_service_1.HeatmapService.getDistrictStats(filters);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'District statistics retrieved successfully',
        data: result,
    });
}));
// Get division-level crime statistics
const getDivisionStats = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
    };
    const result = yield heatmap_service_1.HeatmapService.getDivisionStats(filters);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Division statistics retrieved successfully',
        data: result,
    });
}));
// Get all districts with coordinates
const getAllDistricts = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield heatmap_service_1.HeatmapService.getAllDistricts();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Districts retrieved successfully',
        data: result,
    });
}));
// Get all divisions
const getAllDivisions = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield heatmap_service_1.HeatmapService.getAllDivisions();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Divisions retrieved successfully',
        data: result,
    });
}));
exports.HeatmapControllers = {
    getHeatmapPoints,
    getDistrictStats,
    getDivisionStats,
    getAllDistricts,
    getAllDivisions,
};
