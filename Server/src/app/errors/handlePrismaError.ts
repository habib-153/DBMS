import {
  TErrorSources,
  TGenericErrorResponse,
} from '../interfaces/error.interface';
import { Prisma } from '@prisma/client';

const handlePrismaError = (err: Prisma.PrismaClientKnownRequestError): TGenericErrorResponse => {
  let statusCode = 400;
  let message = 'Database Error';
  const errorSources: TErrorSources[] = [];

  if (err.code) {
    switch (err.code) {
      case 'P2002': {
        // Unique constraint failed
        statusCode = 409;
        message = 'Duplicate entry';
        const field = Array.isArray(err.meta?.target) ? (err.meta?.target as string[])[0] : 'field';
        errorSources.push({
          path: field,
          message: `${field} already exists`,
        });
        break;
      }

      case 'P2025':
        // Record not found
        statusCode = 404;
        message = 'Record not found';
        errorSources.push({
          path: 'id',
          message: 'Record with this ID does not exist',
        });
        break;

      case 'P2003':
        // Foreign key constraint failed
        statusCode = 400;
        message = 'Foreign key constraint error';
        errorSources.push({
          path: (err.meta?.field_name as string) || 'field',
          message: 'Invalid reference to related record',
        });
        break;

      case 'P2014':
        // Required relation missing
        statusCode = 400;
        message = 'Required relation missing';
        errorSources.push({
          path: 'relation',
          message: 'A required relation is missing',
        });
        break;

      case 'P2016':
        // Query interpretation error
        statusCode = 400;
        message = 'Query interpretation error';
        errorSources.push({
          path: 'query',
          message: 'Invalid query parameters',
        });
        break;

      default:
        statusCode = 500;
        message = 'Database operation failed';
        errorSources.push({
          path: 'database',
          message: err.message || 'Unknown database error',
        });
    }
  } else {
    // Generic Prisma error without code
    errorSources.push({
      path: 'database',
      message: err.message || 'Database operation failed',
    });
  }

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handlePrismaError;
