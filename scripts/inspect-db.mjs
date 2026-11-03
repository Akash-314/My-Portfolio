import { neon } from '@neondatabase/serverless';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}
const sql = neon(dbUrl);

async function inspect() {
  const tables = await sql.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  console.log('Existing tables:', tables.map((t) => t.table_name));

  for (const t of tables) {
    const cols = await sql.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = $1 
      ORDER BY ordinal_position;
    `, [t.table_name]);
    console.log(`\nTable ${t.table_name}:`, cols.map((c) => `${c.column_name} (${c.data_type})`));
  }
}

inspect().catch(console.error);
