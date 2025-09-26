"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// For Prisma type/cast errors
const handleCastError = (err) => {
    const errorSources = [
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
exports.default = handleCastError;
