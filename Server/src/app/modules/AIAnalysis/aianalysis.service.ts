import { randomBytes } from 'crypto';
import axios from 'axios';
import database from '../../../shared/database';
import {
  TCreateAIAnalysisLog,
  TAIAnalysisLog,
} from '../../interfaces/features.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import config from '../../config';

// Simple UUID generator
const generateUuid = (): string => {
  return randomBytes(16)
    .toString('hex')
    .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
};

interface RoboflowPrediction {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
  class_id: number;
}

interface RoboflowResponse {
  time: number;
  image: {
    width: number;
    height: number;
  };
  predictions: RoboflowPrediction[];
}

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

const createAIAnalysisLog = async (
  logData: TCreateAIAnalysisLog
): Promise<TAIAnalysisLog> => {
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

  const result = await database.query<TAIAnalysisLog>(query, values);
  const createdLog = result.rows[0];

  if (!createdLog) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create AI analysis log'
    );
  }

  return createdLog;
};

const analyzeImageWithRoboflow = async (
  imageUrl: string,
  postId: string
): Promise<TAIAnalysisLog> => {
  const startTime = Date.now();

  try {
    // Roboflow API configuration
    const ROBOFLOW_API_KEY =
      config.roboflowApiKey ||
      process.env.ROBOFLOW_API_KEY ||
      'DkTFGFZcj5BLj4yqgOef';
    const ROBOFLOW_MODEL = config.roboflowModel || 'crime-detection-dupwb/1'; // Updated to correct model
    const ROBOFLOW_API_URL = `https://serverless.roboflow.com/${ROBOFLOW_MODEL}`;

    if (!ROBOFLOW_API_KEY) {
      throw new Error('Roboflow API key not configured');
    }

    // Make request to Roboflow using correct Serverless API format
    const response = await axios.post<RoboflowResponse>(
      ROBOFLOW_API_URL,
      null, // No body needed
      {
        params: {
          api_key: ROBOFLOW_API_KEY,
          image: imageUrl, 
        },
        timeout: 30000, // 30 seconds timeout
      }
    );

    const processingTime = Date.now() - startTime;
    const predictions = response.data.predictions;

    // Determine if image is crime-related
    const detectedObjects = predictions.map((p) => p.class.toLowerCase());
    const isCrimeRelated = detectedObjects.some((obj) =>
      CRIME_KEYWORDS.some((keyword) => obj.includes(keyword))
    );

    // Calculate average confidence
    const avgConfidence =
      predictions.length > 0
        ? predictions.reduce((sum, p) => sum + p.confidence, 0) /
          predictions.length
        : 0;

    // Adjust verification score based on AI analysis
    const scoreAdjustment = isCrimeRelated ? 10 : -5;
    await updatePostAIVerification(
      postId,
      avgConfidence * 100,
      scoreAdjustment
    );

    // Create log entry
    return await createAIAnalysisLog({
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
  } catch (error: unknown) {
    const processingTime = Date.now() - startTime;

    // Normalize error message
    const errorMessage =
      error instanceof Error ? error.message : String(error) || 'Unknown error';

    // Log the error
    return await createAIAnalysisLog({
      postId,
      analysisType: 'roboflow',
      confidence: 0,
      isCrimeRelated: undefined,
      processingTime,
      status: 'FAILED',
      errorMessage,
    });
  }
};

const updatePostAIVerification = async (
  postId: string,
  aiScore: number,
  scoreAdjustment: number
): Promise<void> => {
  const query = `
    UPDATE posts
    SET "aiVerificationScore" = $1,
        "verificationScore" = GREATEST(0, LEAST(100, "verificationScore" + $2))
    WHERE id = $3
  `;

  await database.query(query, [aiScore, scoreAdjustment, postId]);
};

const getPostAnalysisLogs = async (
  postId: string
): Promise<TAIAnalysisLog[]> => {
  const query = `
    SELECT * FROM ai_analysis_logs
    WHERE "postId" = $1
    ORDER BY "createdAt" DESC
  `;

  const result = await database.query<TAIAnalysisLog>(query, [postId]);
  return result.rows;
};

const getRecentAnalyses = async (limit = 50): Promise<TAIAnalysisLog[]> => {
  const query = `
    SELECT * FROM ai_analysis_logs
    ORDER BY "createdAt" DESC
    LIMIT $1
  `;

  const result = await database.query<TAIAnalysisLog>(query, [limit]);
  return result.rows;
};

// Batch analyze multiple images
const batchAnalyzeImages = async (
  posts: Array<{ id: string; imageUrl: string }>
): Promise<TAIAnalysisLog[]> => {
  const results: TAIAnalysisLog[] = [];

  for (const post of posts) {
    try {
      const log = await analyzeImageWithRoboflow(post.imageUrl, post.id);
      results.push(log);
      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to analyze post ${post.id}:`, error);
    }
  }

  return results;
};

export const AIAnalysisService = {
  createAIAnalysisLog,
  analyzeImageWithRoboflow,
  getPostAnalysisLogs,
  getRecentAnalyses,
  batchAnalyzeImages,
};
