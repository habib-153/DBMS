"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handlePostgresError = (err) => {
    let statusCode = 400;
    let message = 'Database Error';
    const errorSources = [];
    if (err.code) {
        switch (err.code) {
            case '23505': {
                // Unique constraint violation
                statusCode = 409;
                message = 'Duplicate entry';
                const field = err.constraint || 'field';
                const detail = err.detail || '';
                // Extract field name from detail if available
                let fieldName = field;
                if (detail.includes('Key (')) {
                    const match = detail.match(/Key \((.+?)\)/);
                    if (match) {
                        fieldName = match[1];
                    }
                }
                errorSources.push({
                    path: fieldName,
                    message: `${fieldName} already exists`,
                });
                break;
            }
            case '23503':
                // Foreign key constraint violation
                statusCode = 400;
                message = 'Foreign key constraint error';
                errorSources.push({
                    path: err.constraint || 'field',
                    message: 'Invalid reference to related record',
                });
                break;
            case '23502':
                // Not null constraint violation
                statusCode = 400;
                message = 'Required field missing';
                errorSources.push({
                    path: err.column || 'field',
                    message: `${err.column || 'Field'} is required`,
                });
                break;
            case '23514':
                // Check constraint violation
                statusCode = 400;
                message = 'Invalid value';
                errorSources.push({
                    path: err.constraint || 'field',
                    message: 'Value does not meet constraints',
                });
                break;
            case '42703':
                // Undefined column
                statusCode = 400;
                message = 'Invalid column';
                errorSources.push({
                    path: 'column',
                    message: 'Column does not exist',
                });
                break;
            case '42P01':
                // Undefined table
                statusCode = 400;
                message = 'Table does not exist';
                errorSources.push({
                    path: 'table',
                    message: 'Referenced table does not exist',
                });
                break;
            case '42601':
                // Syntax error
                statusCode = 400;
                message = 'SQL syntax error';
                errorSources.push({
                    path: 'query',
                    message: 'Invalid SQL query syntax',
                });
                break;
            case '28P01':
                // Invalid password/authentication
                statusCode = 401;
                message = 'Authentication failed';
                errorSources.push({
                    path: 'auth',
                    message: 'Database authentication failed',
                });
                break;
            case '3D000':
                // Invalid database name
                statusCode = 400;
                message = 'Database does not exist';
                errorSources.push({
                    path: 'database',
                    message: 'Specified database does not exist',
                });
                break;
            case 'ECONNREFUSED':
                // Connection refused
                statusCode = 503;
                message = 'Database connection failed';
                errorSources.push({
                    path: 'connection',
                    message: 'Unable to connect to database',
                });
                break;
            case 'ETIMEDOUT':
                // Connection timeout
                statusCode = 503;
                message = 'Database timeout';
                errorSources.push({
                    path: 'connection',
                    message: 'Database connection timed out',
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
        // Generic database error without code
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
exports.default = handlePostgresError;
