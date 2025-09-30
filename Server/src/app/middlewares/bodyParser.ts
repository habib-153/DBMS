import AppError from '../errors/AppError';
import { catchAsync } from '../utils/catchAsync';

export const parseBody = catchAsync(async (req, res, next) => {
  // Support two request shapes:
  // 1) FormData uploads where the JSON payload is sent as a string under `data` (e.g., multipart/form-data)
  // 2) Regular JSON requests (application/json) where the body already contains the parsed object

  // If body contains a `data` field (stringified JSON), parse it and replace req.body
  if (req.body && req.body.data) {
    try {
      req.body = JSON.parse(req.body.data);
      return next();
    } catch {
      throw new AppError(400, 'Invalid JSON in body.data');
    }
  }

  // If req.body is already an object with keys, assume it's a normal JSON request and continue
  if (
    req.body &&
    typeof req.body === 'object' &&
    Object.keys(req.body).length > 0
  ) {
    return next();
  }

  throw new AppError(400, 'Please provide data in the body under data key');
});
