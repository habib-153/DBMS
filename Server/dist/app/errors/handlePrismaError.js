"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handlePrismaError = (err) => {
    var _a, _b, _c;
    let statusCode = 400;
    let message = 'Database Error';
    const errorSources = [];
    if (err.code) {
        switch (err.code) {
            case 'P2002': {
                // Unique constraint failed
                statusCode = 409;
                message = 'Duplicate entry';
                const field = Array.isArray((_a = err.meta) === null || _a === void 0 ? void 0 : _a.target) ? ((_b = err.meta) === null || _b === void 0 ? void 0 : _b.target)[0] : 'field';
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
                    path: ((_c = err.meta) === null || _c === void 0 ? void 0 : _c.field_name) || 'field',
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
    }
    else {
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
exports.default = handlePrismaError;
