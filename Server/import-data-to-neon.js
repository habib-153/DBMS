// Import Data to Neon PostgreSQL Database
import { Client } from 'pg';
import fs from 'fs';

async function importData() {
  const neonUrl = process.env.DB_URL;

  const client = new Client({
    connectionString: neonUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('🔌 Connecting to Neon database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Read the exported data
    if (!fs.existsSync('data-export.json')) {
      console.error('❌ data-export.json not found!');
      console.log(
        '💡 Run "node export-data.js" first to export your local data.'
      );
      process.exit(1);
    }

    const allData = JSON.parse(fs.readFileSync('data-export.json', 'utf8'));

    // Tables in order (respecting foreign key dependencies)
    const tables = [
      'users',
      'posts',
      'comments',
      'follows',
      'post_votes',
      'comment_votes',
    ];

    let totalImported = 0;

    for (const table of tables) {
      const rows = allData[table] || [];

      if (rows.length === 0) {
        console.log(`⏭️  Skipping ${table} (no data)`);
        continue;
      }

      console.log(`📥 Importing ${rows.length} rows into ${table}...`);

      for (const row of rows) {
        // Get column names and values
        const columns = Object.keys(row);
        const values = Object.values(row);

        // Build INSERT query
        const columnNames = columns.map((col) => `"${col}"`).join(', ');
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        const insertQuery = `
          INSERT INTO ${table} (${columnNames})
          VALUES (${placeholders})
          ON CONFLICT DO NOTHING
        `;

        try {
          await client.query(insertQuery, values);
        } catch (error) {
          console.error(`   ⚠️  Error inserting row: ${error.message}`);
          // Continue with next row
        }
      }

      console.log(`   ✓ Completed ${table}`);
      totalImported += rows.length;
    }

    console.log('\n✅ Data import completed!');
    console.log(`📊 Total records processed: ${totalImported}`);

    // Verify imported data
    console.log('\n📋 Verifying data in Neon:');
    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`   ${table}: ${result.rows[0].count} records`);
    }

    console.log('\n🎉 All done!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test your API with the imported data');
    console.log('   2. Your Vercel deployment is ready to use!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

importData();
