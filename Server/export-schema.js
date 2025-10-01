// Export Database Schema Script
// This script connects to your local PostgreSQL and exports the schema

import { Client } from 'pg';
import fs from 'fs';

async function exportSchema() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'crime_reporting_db',
    user: 'postgres',
    password: 'Admin@123', // From your .env file
  });

  try {
    await client.connect();
    console.log('✅ Connected to local database');

    // Get all tables
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    const tables = await client.query(tablesQuery);
    console.log(`\n📋 Found ${tables.rows.length} tables\n`);

    let schemaSQL = '-- Database Schema Export\n';
    schemaSQL += '-- Generated: ' + new Date().toISOString() + '\n\n';

    // For each table, get CREATE TABLE statement
    for (const table of tables.rows) {
      const tableName = table.table_name;
      console.log(`  Exporting table: ${tableName}`);

      // Get table structure
      const columnsQuery = `
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          column_default,
          is_nullable,
          udt_name
        FROM information_schema.columns
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;

      const columns = await client.query(columnsQuery, [tableName]);

      // Get primary key
      const pkQuery = `
        SELECT a.attname
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = $1::regclass AND i.indisprimary;
      `;

      const pk = await client.query(pkQuery, [tableName]);

      // Get foreign keys
      const fkQuery = `
        SELECT
          tc.constraint_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = $1;
      `;

      const fks = await client.query(fkQuery, [tableName]);

      // Build CREATE TABLE statement
      schemaSQL += `\n-- Table: ${tableName}\n`;
      schemaSQL += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;

      const columnDefs = columns.rows.map((col) => {
        let def = `  "${col.column_name}" ${col.data_type.toUpperCase()}`;

        if (col.character_maximum_length) {
          def += `(${col.character_maximum_length})`;
        }

        if (col.column_default) {
          def += ` DEFAULT ${col.column_default}`;
        }

        if (col.is_nullable === 'NO') {
          def += ' NOT NULL';
        }

        return def;
      });

      schemaSQL += columnDefs.join(',\n');

      // Add primary key
      if (pk.rows.length > 0) {
        const pkColumns = pk.rows.map((r) => `"${r.attname}"`).join(', ');
        schemaSQL += `,\n  PRIMARY KEY (${pkColumns})`;
      }

      schemaSQL += '\n);\n';

      // Add foreign keys
      for (const fk of fks.rows) {
        schemaSQL += `\nALTER TABLE ${tableName} ADD CONSTRAINT ${fk.constraint_name} `;
        schemaSQL += `FOREIGN KEY ("${fk.column_name}") `;
        schemaSQL += `REFERENCES ${fk.foreign_table_name}("${fk.foreign_column_name}");\n`;
      }

      // Get indexes
      const indexQuery = `
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = $1 AND schemaname = 'public'
        AND indexname NOT LIKE '%_pkey';
      `;

      const indexes = await client.query(indexQuery, [tableName]);

      for (const idx of indexes.rows) {
        schemaSQL += `${idx.indexdef};\n`;
      }

      schemaSQL += '\n';
    }

    // Save to file
    fs.writeFileSync('schema.sql', schemaSQL);
    console.log('\n✅ Schema exported to schema.sql');
    console.log(`📄 File size: ${(schemaSQL.length / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

exportSchema();
