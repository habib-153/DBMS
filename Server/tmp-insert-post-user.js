import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  const client = new Client({ connectionString: process.env.DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query('INSERT INTO users (id, name, email, password, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6)', ['test-user','Test','test@example.com','pwd', new Date(), new Date()]);
    console.log('Inserted test user');
  } catch(e) { console.log('Insert user error', e.message); }
  try {
    await client.query('INSERT INTO posts (id, title, description, image, location, district, division, "postDate", "crimeDate", "authorId", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)', ['test-post','t','d','img','loc','dist','div', new Date(), new Date(), 'test-user', new Date(), new Date()]);
    console.log('Inserted test post');
  } catch(e) { console.log('Insert post error', e.message); }
  await client.end();
})();