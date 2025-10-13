import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  const client = new Client({ connectionString: process.env.DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const id = 'test-comment-1';
  const now = new Date();
  try {
    await client.query(
      'INSERT INTO comments (id, content, image, "postId", "parentId", "authorId", "isDeleted", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, false, $7, $8)',
      [id, 'test content', null, 'test-post', null, 'test-user', now, now]
    );
    console.log('Insert OK');
  } catch (e) {
    console.error('Insert error:', e.message);
  }
  const res = await client.query('SELECT id, content, "postId", "parentId", "authorId" FROM comments WHERE id=$1', [id]);
  console.log('Select result:', JSON.stringify(res.rows, null, 2));
  await client.end();
})();