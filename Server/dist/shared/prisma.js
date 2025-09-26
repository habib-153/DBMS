"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'event',
            level: 'error',
        },
        {
            emit: 'event',
            level: 'info',
        },
        {
            emit: 'event',
            level: 'warn',
        },
    ],
});
if (process.env.NODE_ENV === 'development') {
    prisma.$on('query', (e) => {
        console.log('-------------------------------------------');
        console.log('Query: ' + e.query);
        console.log('-------------------------------------------');
        console.log('Params: ' + e.params);
        console.log('-------------------------------------------');
        console.log('Duration: ' + e.duration + 'ms');
        console.log('-------------------------------------------');
    });
}
exports.default = prisma;
