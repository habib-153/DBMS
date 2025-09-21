import {
  TErrorSources,
  TGenericErrorResponse,
} from '../interfaces/error.interface';

// For Prisma type/cast errors
const handleCastError = (err: Error & { path?: string }): TGenericErrorResponse => {
  const errorSources: TErrorSources[] = [
    {
      path: err.path || 'field',
      message: err.message || 'Invalid data type',
    },
  ];

  const statusCode = 400;

  return {
    statusCode,
    message: 'Invalid data format',
    errorSources,
  };
};

export default handleCastError;
