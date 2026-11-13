import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { neon } from '@neondatabase/serverless';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL is not set!');
  process.exit(1);
}

const sql = neon(dbUrl);

async function testContactDb() {
  console.log('--- 1. VERIFYING NEON DATABASE CONNECTION ---');
  const ping = await sql.query('SELECT NOW() as now, current_database() as db, current_user as user_name;');
  console.log('Database:', ping[0].db);
  console.log('User:', ping[0].user_name);
  console.log('Server Time:', ping[0].now);

  console.log('\n--- 2. VERIFYING CONTACT_MESSAGES TABLE SCHEMA ---');
  const columns = await sql.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'contact_messages'
    ORDER BY ordinal_position;
  `);
  console.log('Columns:');
  columns.forEach((c) => {
    console.log(`  - ${c.column_name}: ${c.data_type} (nullable: ${c.is_nullable})`);
  });

  const countBefore = await sql.query('SELECT count(*)::int as count FROM contact_messages;');
  console.log('Current stored messages in DB:', countBefore[0].count);

  console.log('\n--- 3. TESTING INSERT INTO CONTACT_MESSAGES ---');
  const testId = `msg_test_${Date.now()}`;
  const now = Date.now();
  const dateFormatted = new Date(now).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  await sql.query(
    `INSERT INTO contact_messages (id, name, email, message, timestamp, date_formatted, read)
     VALUES ($1, $2, $3, $4, $5, $6, $7);`,
    [
      testId,
      'Spider-Man Signal Test',
      'peter.parker@dailybugle.com',
      'Friendly neighborhood contact verification message.',
      now,
      dateFormatted,
      false
    ]
  );
  console.log('✓ Successfully inserted message:', testId);

  console.log('\n--- 4. TESTING SELECT FROM CONTACT_MESSAGES ---');
  const fetched = await sql.query('SELECT * FROM contact_messages WHERE id = $1;', [testId]);
  console.log('✓ Retrieved message from database:');
  console.log('  ID:', fetched[0].id);
  console.log('  Name:', fetched[0].name);
  console.log('  Email:', fetched[0].email);
  console.log('  Message:', fetched[0].message);
  console.log('  Date:', fetched[0].date_formatted);
  console.log('  Read:', fetched[0].read);

  console.log('\n--- 5. TESTING UPDATE (MARK AS READ) ---');
  await sql.query('UPDATE contact_messages SET read = true WHERE id = $1;', [testId]);
  const updated = await sql.query('SELECT read FROM contact_messages WHERE id = $1;', [testId]);
  console.log('✓ Message read status updated to:', updated[0].read);

  console.log('\n--- 6. CLEANING UP TEST RECORD ---');
  await sql.query('DELETE FROM contact_messages WHERE id = $1;', [testId]);
  const verifyDelete = await sql.query('SELECT count(*)::int as count FROM contact_messages WHERE id = $1;', [testId]);
  console.log('✓ Deleted successfully (matches found:', verifyDelete[0].count, ')');

  console.log('\n✅ CONTACT DATABASE CONNECTION & OPERATIONS FULLY VERIFIED!');
}

testContactDb().catch((err) => {
  console.error('DATABASE CONTACT VERIFICATION FAILED:', err);
  process.exit(1);
});

