"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleDuplicateError = (err) => {
    var _a, _b, _c;
    let extractedMessage = 'Duplicate entry';
    // Handle Prisma unique constraint error
    if (err.code === 'P2002' && ((_a = err.meta) === null || _a === void 0 ? void 0 : _a.target)) {
        const field = Array.isArray(err.meta.target)
            ? err.meta.target[0]
            : err.meta.target;
        extractedMessage = `${field} already exists`;
    }
    else {
        // Fallback for other duplicate errors
        const match = err.message.match(/"([^"]*)"/);
        if (match && match[1]) {
            extractedMessage = `${match[1]} already exists`;
        }
    }
    const errorSources = [
        {
            path: ((_c = (_b = err.meta) === null || _b === void 0 ? void 0 : _b.target) === null || _c === void 0 ? void 0 : _c[0]) || 'field',
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
exports.default = handleDuplicateError;
