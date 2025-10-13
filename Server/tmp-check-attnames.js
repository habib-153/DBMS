import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  const client = new Client({ connectionString: process.env.DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query(`SELECT a.attname, a.attnum FROM pg_attribute a JOIN pg_class c ON a.attrelid = c.oid WHERE c.relname='comments' AND a.attnum>0 ORDER BY a.attnum`);
  console.log(res.rows);
  await client.end();
})();