import fs from 'fs';
import path from 'path';
import pg from 'pg';

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  await client.connect();
  const migrationPath = path.resolve('migrations', '001_initial_portfolio_schema.sql');
  const sqlContent = fs.readFileSync(migrationPath, 'utf8');

  console.log('Running migration: 001_initial_portfolio_schema.sql via pg transaction...');
  await client.query('BEGIN');
  try {
    await client.query(sqlContent);
    await client.query('COMMIT');
    console.log('Migration committed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.end();
  }
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
