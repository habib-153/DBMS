// Import Schema to Neon Database
import { Client } from 'pg';
import fs from 'fs';

async function importSchema() {
  const neonUrl =
    'postgresql://neondb_owner:npg_8ogDZIa5TijF@ep-cold-wildflower-adoir18w-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

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

    // Read the fixed schema file
    const schemaSQL = fs.readFileSync('schema-fixed.sql', 'utf8');

    console.log('📝 Executing schema...');

    // Execute the schema
    await client.query(schemaSQL);

    console.log('✅ Schema imported successfully!');
    console.log('\n📋 Verifying tables...');

    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log(`\n✅ Found ${result.rows.length} tables:`);
    result.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });

    console.log('\n🎉 Database setup complete!');
    console.log('\n📝 Next steps:');
    console.log('  1. Add environment variables in Vercel Dashboard');
    console.log('  2. Test your API endpoints');
    console.log('  3. Your seeding script will create admin user on first run');
  } catch (error) {
    console.error('\n❌ Error importing schema:');
    console.error(error.message);

    if (error.message.includes('already exists')) {
      console.log('\n💡 Tables already exist. This is fine!');
      console.log('   Your database is ready to use.');
    } else {
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

importSchema();
