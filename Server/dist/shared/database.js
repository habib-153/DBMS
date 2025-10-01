"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
const pg_1 = require("pg");
const config_1 = __importDefault(require("../app/config"));
class Database {
    constructor() {
        this.pool = new pg_1.Pool({
            connectionString: config_1.default.db_url,
            ssl: process.env.NODE_ENV === 'production'
                ? { rejectUnauthorized: false }
                : false,
            // Optimized for serverless (Vercel)
            max: process.env.NODE_ENV === 'production' ? 1 : 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
            // Allow graceful shutdown
            allowExitOnIdle: true,
        });
        // Handle pool errors
        this.pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
        });
    }
    // Execute a single query
    query(text, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.connect();
            try {
                const start = Date.now();
                const result = yield client.query(text, params);
                const duration = Date.now() - start;
                if (process.env.NODE_ENV === 'development') {
                    console.log('-------------------------------------------');
                    console.log('Query: ' + text);
                    console.log('-------------------------------------------');
                    console.log('Params: ' + JSON.stringify(params));
                    console.log('-------------------------------------------');
                    console.log('Duration: ' + duration + 'ms');
                    console.log('-------------------------------------------');
                }
                return result;
            }
            finally {
                client.release();
            }
        });
    }
    // Execute multiple queries in a transaction
    transaction(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.connect();
            try {
                yield client.query('BEGIN');
                const result = yield callback(client);
                yield client.query('COMMIT');
                return result;
            }
            catch (error) {
                yield client.query('ROLLBACK');
                throw error;
            }
            finally {
                client.release();
            }
        });
    }
    // Get a client for manual transaction control
    getClient() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool.connect();
        });
    }
    // Close all connections
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool.end();
        });
    }
}
const database = new Database();
exports.default = database;
