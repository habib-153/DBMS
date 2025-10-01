/* eslint-disable no-console */
import { Pool, PoolClient, QueryResult } from 'pg';
import config from '../app/config';

class Database {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: config.db_url,
      ssl:
        process.env.NODE_ENV === 'production'
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
    this.pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  // Execute a single query
  async query<T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    const client = await this.pool.connect();
    try {
      const start = Date.now();
      const result = await client.query(text, params);
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
    } finally {
      client.release();
    }
  }

  // Execute multiple queries in a transaction
  async transaction<T>(
    callback: (dbClient: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get a client for manual transaction control
  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  // Close all connections
  async close(): Promise<void> {
    await this.pool.end();
  }
}

const database = new Database();

export default database;
