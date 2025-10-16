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
exports.AIAnalysisService = void 0;
const crypto_1 = require("crypto");
const axios_1 = __importDefault(require("axios"));
const database_1 = __importDefault(require("../../../shared/database"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../config"));
// Simple UUID generator
const generateUuid = () => {
    return (0, crypto_1.randomBytes)(16)
        .toString('hex')
        .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
};
// Crime-related keywords for classification
const CRIME_KEYWORDS = [
    'weapon',
    'gun',
    'knife',
    'blood',
    'violence',
    'accident',
    'damage',
    'vandalism',
    'theft',
    'broken',
    'fire',
    'smoke',
    'injury',
    'assault',
    'fight',
];
const createAIAnalysisLog = (logData) => __awaiter(void 0, void 0, void 0, function* () {
    const logId = generateUuid();
    const now = new Date();
    const query = `
    INSERT INTO ai_analysis_logs (
      id, "postId", "analysisType", model, confidence, predictions,
      "isCrimeRelated", "detectedObjects", "processingTime", status, "errorMessage", "createdAt"
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `;
    const values = [
        logId,
        logData.postId,
        logData.analysisType,
        logData.model || null,
        logData.confidence || null,
        logData.predictions ? JSON.stringify(logData.predictions) : null,
        logData.isCrimeRelated === undefined ? null : logData.isCrimeRelated,
        logData.detectedObjects || null,
        logData.processingTime || null,
        logData.status || 'SUCCESS',
        logData.errorMessage || null,
        now,
    ];
    const result = yield database_1.default.query(query, values);
    const createdLog = result.rows[0];
    if (!createdLog) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to create AI analysis log');
    }
    return createdLog;
});
const analyzeImageWithRoboflow = (imageUrl, postId) => __awaiter(void 0, void 0, void 0, function* () {
    const startTime = Date.now();
    try {
        // Roboflow API configuration
        const ROBOFLOW_API_KEY = config_1.default.roboflowApiKey || process.env.ROBOFLOW_API_KEY;
        const ROBOFLOW_MODEL = config_1.default.roboflowModel || 'crime-detection/1'; // Your model
        const ROBOFLOW_API_URL = `https://detect.roboflow.com/${ROBOFLOW_MODEL}?api_key=${ROBOFLOW_API_KEY}`;
        if (!ROBOFLOW_API_KEY) {
            throw new Error('Roboflow API key not configured');
        }
        // Make request to Roboflow
        const response = yield axios_1.default.post(ROBOFLOW_API_URL, imageUrl, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            timeout: 30000, // 30 seconds timeout
        });
        const processingTime = Date.now() - startTime;
        const predictions = response.data.predictions;
        // Determine if image is crime-related
        const detectedObjects = predictions.map((p) => p.class.toLowerCase());
        const isCrimeRelated = detectedObjects.some((obj) => CRIME_KEYWORDS.some((keyword) => obj.includes(keyword)));
        // Calculate average confidence
        const avgConfidence = predictions.length > 0
            ? predictions.reduce((sum, p) => sum + p.confidence, 0) /
                predictions.length
            : 0;
        // Adjust verification score based on AI analysis
        const scoreAdjustment = isCrimeRelated ? 10 : -5;
        yield updatePostAIVerification(postId, avgConfidence * 100, scoreAdjustment);
        // Create log entry
        return yield createAIAnalysisLog({
            postId,
            analysisType: 'roboflow',
            model: ROBOFLOW_MODEL,
            confidence: avgConfidence * 100,
            predictions: response.data,
            isCrimeRelated,
            detectedObjects,
            processingTime,
            status: 'SUCCESS',
        });
    }
    catch (error) {
        const processingTime = Date.now() - startTime;
        // Normalize error message
        const errorMessage = error instanceof Error ? error.message : String(error) || 'Unknown error';
        // Log the error
        return yield createAIAnalysisLog({
            postId,
            analysisType: 'roboflow',
            confidence: 0,
            isCrimeRelated: undefined,
            processingTime,
            status: 'FAILED',
            errorMessage,
        });
    }
});
const updatePostAIVerification = (postId, aiScore, scoreAdjustment) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    UPDATE posts
    SET "aiVerificationScore" = $1,
        "verificationScore" = GREATEST(0, LEAST(100, "verificationScore" + $2))
    WHERE id = $3
  `;
    yield database_1.default.query(query, [aiScore, scoreAdjustment, postId]);
});
const getPostAnalysisLogs = (postId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT * FROM ai_analysis_logs
    WHERE "postId" = $1
    ORDER BY "createdAt" DESC
  `;
    const result = yield database_1.default.query(query, [postId]);
    return result.rows;
});
const getRecentAnalyses = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (limit = 50) {
    const query = `
    SELECT * FROM ai_analysis_logs
    ORDER BY "createdAt" DESC
    LIMIT $1
  `;
    const result = yield database_1.default.query(query, [limit]);
    return result.rows;
});
// Batch analyze multiple images
const batchAnalyzeImages = (posts) => __awaiter(void 0, void 0, void 0, function* () {
    const results = [];
    for (const post of posts) {
        try {
            const log = yield analyzeImageWithRoboflow(post.imageUrl, post.id);
            results.push(log);
            // Add delay to avoid rate limiting
            yield new Promise((resolve) => setTimeout(resolve, 1000));
        }
        catch (error) {
            console.error(`Failed to analyze post ${post.id}:`, error);
        }
    }
    return results;
});
exports.AIAnalysisService = {
    createAIAnalysisLog,
    analyzeImageWithRoboflow,
    getPostAnalysisLogs,
    getRecentAnalyses,
    batchAnalyzeImages,
};
