"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// For Prisma validation errors
const handleValidationError = (err) => {
    const errorSources = [
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
exports.default = handleValidationError;
