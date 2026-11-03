import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error('DATABASE_URL is not set in environment.');
}

const sql = neon(dbUrl);

async function main() {
  await sql.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp BIGINT NOT NULL,
      date_formatted TEXT NOT NULL,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
  
  await sql.query(`
    CREATE TABLE IF NOT EXISTS portfolio_customizations (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  console.log('Postgres tables created or already exist.');
  const tables = await sql.query(`
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
  `);
  console.log('Tables in public schema:', tables.map((t) => t.table_name));
}

main().catch(console.error);
