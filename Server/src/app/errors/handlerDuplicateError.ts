/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  TErrorSources,
  TGenericErrorResponse,
} from '../interfaces/error.interface';

const handleDuplicateError = (err: any): TGenericErrorResponse => {
  let extractedMessage = 'Duplicate entry';

  // Handle Prisma unique constraint error
  if (err.code === 'P2002' && err.meta?.target) {
    const field = Array.isArray(err.meta.target)
      ? err.meta.target[0]
      : err.meta.target;
    extractedMessage = `${field} already exists`;
  } else {
    // Fallback for other duplicate errors
    const match = err.message.match(/"([^"]*)"/);
    if (match && match[1]) {
      extractedMessage = `${match[1]} already exists`;
    }
  }

  const errorSources: TErrorSources[] = [
    {
      path: err.meta?.target?.[0] || 'field',
      message: extractedMessage,
    },
  ];

  const statusCode = 409; // Conflict status code for duplicates

  return {
    statusCode,
    message: 'Duplicate entry error',
    errorSources,
  };
};

export default handleDuplicateError;
