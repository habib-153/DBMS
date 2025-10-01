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
exports.parseBody = void 0;
const AppError_1 = __importDefault(require("../errors/AppError"));
const catchAsync_1 = require("../utils/catchAsync");
exports.parseBody = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Support two request shapes:
    // 1) FormData uploads where the JSON payload is sent as a string under `data` (e.g., multipart/form-data)
    // 2) Regular JSON requests (application/json) where the body already contains the parsed object
    // If body contains a `data` field (stringified JSON), parse it and replace req.body
    if (req.body && req.body.data) {
        try {
            req.body = JSON.parse(req.body.data);
            return next();
        }
        catch (_a) {
            throw new AppError_1.default(400, 'Invalid JSON in body.data');
        }
    }
    // If req.body is already an object with keys, assume it's a normal JSON request and continue
    if (req.body &&
        typeof req.body === 'object' &&
        Object.keys(req.body).length > 0) {
        return next();
    }
    throw new AppError_1.default(400, 'Please provide data in the body under data key');
}));
