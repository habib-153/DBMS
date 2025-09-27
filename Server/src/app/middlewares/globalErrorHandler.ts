/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import config from '../config';
import AppError from '../errors/AppError';
import handleCastError from '../errors/handleCastError';
import handleValidationError from '../errors/handleValidationError';
import handleZodError from '../errors/handleZodError';
import handleDuplicateError from '../errors/handlerDuplicateError';
import handlePostgresError from '../errors/handlePostgresError';
import { TErrorSources } from '../interfaces/error.interface';
import { TImageFiles } from '../interfaces/image.interface';
import { deleteImageFromCloudinary } from '../utils/deleteImage';

const globalErrorHandler: ErrorRequestHandler = async (err, req, res, next) => {
  //setting default values
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorSources: TErrorSources[] = [
    {
      path: '',
      message: 'Something went wrong',
    },
  ];

  if (req.files && Object.keys(req.files).length > 0) {
    await deleteImageFromCloudinary(req.files as TImageFiles);
  }

  // Handle different types of errors
  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (
    err?.code &&
    (err.code.startsWith('23') || // PostgreSQL integrity constraints
      err.code.startsWith('42') || // PostgreSQL syntax/structure errors
      err.code.startsWith('28') || // PostgreSQL auth errors
      err.code.startsWith('3D') || // PostgreSQL database errors
      err.code === 'ECONNREFUSED' || // Connection errors
      err.code === 'ETIMEDOUT')
  ) {
    // Handle PostgreSQL errors
    const simplifiedError = handlePostgresError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.code === '23505') {
    // PostgreSQL unique constraint error
    const simplifiedError = handleDuplicateError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === 'ValidationError') {
    const simplifiedError = handleValidationError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === 'CastError') {
    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.code === 11000) {
    // MongoDB duplicate key error (legacy)
    const simplifiedError = handleDuplicateError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err instanceof AppError) {
    statusCode = err?.statusCode;
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  }

  //ultimate return
  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    // Only include error details in development
    ...(config.NODE_ENV === 'development' && {
      error: err,
      stack: err?.stack,
    }),
  });
};

export default globalErrorHandler;
