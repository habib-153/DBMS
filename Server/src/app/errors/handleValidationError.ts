import {
  TErrorSources,
  TGenericErrorResponse,
} from '../interfaces/error.interface';

// For Prisma validation errors
const handleValidationError = (err: Error): TGenericErrorResponse => {
  const errorSources: TErrorSources[] = [
    {
      path: 'validation',
      message: err.message || 'Validation failed',
    },
  ];

  const statusCode = 400;

  return {
    statusCode,
    message: 'Validation Error',
    errorSources,
  };
};

export default handleValidationError;
