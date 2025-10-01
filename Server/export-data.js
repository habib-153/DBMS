// Export Data from Local PostgreSQL Database
import { Client } from 'pg';
import fs from 'fs';

async function exportData() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'crime_reporting_db',
    user: 'postgres',
    password: 'Admin@123',
  });

  try {
    await client.connect();
    console.log('✅ Connected to local database\n');

    // Tables in order (respecting foreign key dependencies)
    const tables = [
      'users',
      'posts',
      'comments',
      'follows',
      'post_votes',
      'comment_votes',
    ];

    const allData = {};

    for (const table of tables) {
      console.log(`📦 Exporting data from ${table}...`);

      const result = await client.query(`SELECT * FROM ${table}`);
      allData[table] = result.rows;

      console.log(`   ✓ Exported ${result.rows.length} rows`);
    }

    // Save to JSON file
    fs.writeFileSync('data-export.json', JSON.stringify(allData, null, 2));

    console.log('\n✅ Data exported successfully!');
    console.log('📄 File: data-export.json');
    console.log(
      `📊 Total records: ${Object.values(allData).reduce(
        (sum, rows) => sum + rows.length,
        0
      )}`
    );

    // Show summary
    console.log('\n📋 Summary:');
    for (const [table, rows] of Object.entries(allData)) {
      console.log(`   ${table}: ${rows.length} records`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

exportData();
