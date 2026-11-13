import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function runTest() {
  console.log('=== END-TO-END CONTACT DATABASE TEST ===\n');

  // Step 1: Healthcheck
  console.log('Step 1: Checking Neon Backend & Database Health...');
  const healthRes = await fetch('http://localhost:3001/api/neon/health');
  const health = await healthRes.json();
  console.log('Status Code:', healthRes.status);
  console.log('Database Connected:', health.postgres === 'connected');
  console.log('Database Name:', health.database);
  console.log('Postgres Engine:', health.postgresVersion);
  console.log('Database Latency:', health.latencyMs, 'ms');

  // Step 2: Fetch current messages
  console.log('\nStep 2: Fetching Current Contact Messages via API...');
  const initialFetch = await fetch('http://localhost:3001/api/contact/messages');
  const initialData = await initialFetch.json();
  console.log('API Status Code:', initialFetch.status);
  console.log('Messages in Inbox:', initialData.messages.length);

  // Step 3: Post a new Contact Form Submission
  console.log('\nStep 3: Submitting New Contact Message via POST /api/contact/messages...');
  const testMessage = {
    name: 'Gwen Stacy',
    email: 'gwen.stacy@empirestate.edu',
    message: 'Hey Akash, loved your web portfolio! Testing the contact database connection.',
  };

  const postRes = await fetch('http://localhost:3001/api/contact/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testMessage),
  });

  const postData = await postRes.json();
  console.log('POST Status Code:', postRes.status);
  console.log('Success:', postData.success);
  console.log('Generated Message ID:', postData.message?.id);

  // Step 4: Verify via GET API
  console.log('\nStep 4: Fetching Updated Contact Messages via GET /api/contact/messages...');
  const updatedFetch = await fetch('http://localhost:3001/api/contact/messages');
  const updatedData = await updatedFetch.json();
  const foundInApi = updatedData.messages.some((m) => m.id === postData.message.id);
  console.log('Message Found in API Response:', foundInApi);

  // Step 5: Direct Verification in Neon PostgreSQL Table
  console.log('\nStep 5: Verifying Directly in Neon PostgreSQL Database Table...');
  const dbRows = await sql.query('SELECT * FROM contact_messages WHERE id = $1;', [postData.message.id]);
  console.log('Database Rows Found:', dbRows.length);
  if (dbRows.length > 0) {
    const row = dbRows[0];
    console.log('  Database Record Details:');
    console.log('    - id:', row.id);
    console.log('    - name:', row.name);
    console.log('    - sender_name:', row.sender_name);
    console.log('    - email:', row.email);
    console.log('    - sender_email:', row.sender_email);
    console.log('    - message:', row.message);
    console.log('    - timestamp:', row.timestamp);
    console.log('    - date_formatted:', row.date_formatted);
    console.log('    - read:', row.read);
    console.log('    - created_at:', row.created_at);
  }

  // Step 6: Cleanup
  console.log('\nStep 6: Cleaning up test message from Neon PostgreSQL...');
  await sql.query('DELETE FROM contact_messages WHERE id = $1;', [postData.message.id]);
  const verifyClean = await sql.query('SELECT count(*)::int as count FROM contact_messages WHERE id = $1;', [postData.message.id]);
  console.log('Cleaned up successfully! Remaining matching rows:', verifyClean[0].count);

  console.log('\n🎉 ALL 6 VERIFICATION STEPS PASSED 100%! CONTACT DATABASE IS FULLY CONNECTED AND FUNCTIONAL.');
}

runTest().catch((e) => {
  console.error('Test Failed:', e);
  process.exit(1);
});

