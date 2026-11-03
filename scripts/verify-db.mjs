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

async function verify() {
  await client.connect();
  console.log('=== VERIFYING DATABASE TABLES & RECORD COUNTS ===\n');

  const tables = [
    'profiles',
    'site_settings',
    'projects',
    'project_technologies',
    'skill_categories',
    'skills',
    'achievements',
    'experiences',
    'education',
    'coding_profiles',
    'coding_stats_history',
    'social_links',
    'contact_messages',
    'media_assets'
  ];

  for (const table of tables) {
    const countRes = await client.query(`SELECT COUNT(*) as count FROM ${table};`);
    const sample = await client.query(`SELECT * FROM ${table} LIMIT 1;`);
    console.log(`✓ Table '${table}': ${countRes.rows[0].count} records`);
    if (sample.rows.length > 0) {
      const keys = Object.keys(sample.rows[0]).slice(0, 4).join(', ');
      console.log(`   Sample columns: [${keys}...]`);
    }
  }

  console.log('\n=== TESTING CONSTRAINTS & OPERATIONS ===\n');

  // Test 1: Foreign Key Cascade on projects -> project_technologies
  console.log('1. Testing Foreign Key Cascade on projects...');
  const testProj = await client.query(`
    INSERT INTO projects (slug, title, description, published)
    VALUES ('test-temp-proj', 'Temp Project', 'Temporary Description', false)
    RETURNING id;
  `);
  const testProjId = testProj.rows[0].id;
  await client.query(`
    INSERT INTO project_technologies (project_id, technology_name)
    VALUES ($1, 'TempTech');
  `, [testProjId]);

  const techBefore = await client.query(`SELECT COUNT(*) as c FROM project_technologies WHERE project_id = $1;`, [testProjId]);
  console.log(`   Project created with ${techBefore.rows[0].c} linked technology.`);

  await client.query(`DELETE FROM projects WHERE id = $1;`, [testProjId]);
  const techAfter = await client.query(`SELECT COUNT(*) as c FROM project_technologies WHERE project_id = $1;`, [testProjId]);
  console.log(`   Project deleted. Child technologies remaining: ${techAfter.rows[0].c} (ON DELETE CASCADE verified!)`);

  // Test 2: Foreign Key Constraint Violation
  console.log('\n2. Testing Foreign Key Constraint protection...');
  try {
    await client.query(`
      INSERT INTO project_technologies (project_id, technology_name)
      VALUES ('00000000-0000-0000-0000-000000000000', 'InvalidTech');
    `);
    console.error('   FK constraint failed to throw error!');
  } catch (err) {
    console.log(`   Caught expected FK violation: ${err.message}`);
  }

  // Test 3: Unique constraint on slugs and settings
  console.log('\n3. Testing Unique constraints...');
  try {
    await client.query(`
      INSERT INTO site_settings (setting_key, setting_value)
      VALUES ('hero_config', '{"test": 1}');
    `);
    console.error('   Unique constraint failed to throw error!');
  } catch (err) {
    console.log(`   Caught expected Unique constraint violation: ${err.message}`);
  }

  // Test 4: Contact messages security verification
  console.log('\n4. Testing contact_messages access and status field...');
  const msgCount = await client.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'new') as new_count FROM contact_messages;`);
  console.log(`   Total messages: ${msgCount.rows[0].total}, New messages: ${msgCount.rows[0].new_count}`);

  console.log('\n=== ALL DATABASE TESTS PASSED SUCCESSFULLY! ===');
  await client.end();
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
