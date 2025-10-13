import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  const client = new Client({ connectionString: process.env.DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query('ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_parentid_fkey');
    console.log('Dropped FK if existed');
  } catch(e) { console.log('Drop FK error', e.message); }

  try {
    await client.query('ALTER TABLE comments DROP COLUMN IF EXISTS parentid CASCADE');
    console.log('Dropped lowercase parentid column if existed');
  } catch(e) { console.log('Drop column error', e.message); }

  try {
    await client.query('ALTER TABLE comments ADD COLUMN IF NOT EXISTS "parentId" TEXT');
    console.log('Added quoted "parentId" column');
  } catch(e) { console.log('Add column error', e.message); }

  try {
    await client.query('ALTER TABLE comments ADD CONSTRAINT comments_parentId_fkey FOREIGN KEY ("parentId") REFERENCES comments("id") ON DELETE CASCADE');
    console.log('Added FK constraint for "parentId"');
  } catch(e) { console.log('Add FK error', e.message); }

  const res = await client.query("SELECT a.attname, a.attnum FROM pg_attribute a JOIN pg_class c ON a.attrelid = c.oid WHERE c.relname='comments' AND a.attnum>0 ORDER BY a.attnum");
  console.log('Columns now:', res.rows);
  await client.end();
})();
