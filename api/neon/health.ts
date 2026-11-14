import { neon } from '@neondatabase/serverless';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return res.status(200).json({
      status: 'disconnected',
      postgres: 'missing_env_var',
      error: 'DATABASE_URL is not set in Vercel environment variables. Please add DATABASE_URL in Vercel Project Settings.',
      branch: process.env.NEON_BRANCH || 'unknown',
    });
  }

  try {
    const sql = neon(dbUrl);
    const start = Date.now();
    const result = await sql.query('SELECT NOW() as now, current_database() as db, current_user as user_name, version() as version;');
    const latencyMs = Date.now() - start;

    const tables = await sql.query(`
      SELECT count(*)::int as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);

    return res.status(200).json({
      status: 'ok',
      branch: process.env.NEON_BRANCH || 'production',
      postgres: 'connected',
      database: result[0]?.db,
      user: result[0]?.user_name,
      postgresVersion: result[0]?.version?.split(' ')?.[1] || '18',
      tablesCount: tables[0]?.count || 0,
      latencyMs,
      objectStorage: process.env.AWS_ENDPOINT_URL_S3 ? 'configured' : 'disabled',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({
      status: 'error',
      postgres: 'error',
      error: err?.message || String(err),
    });
  }
}

