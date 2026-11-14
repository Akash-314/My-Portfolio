import { neon } from '@neondatabase/serverless';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL environment variable is not defined');
    return res.status(503).json({
      success: false,
      error: 'DATABASE_URL is not configured in Vercel environment variables. Please add it to Vercel Project Settings.',
    });
  }

  const sql = neon(dbUrl);

  if (req.method === 'GET') {
    try {
      const messages = await sql.query(
        'SELECT id, name, email, message, timestamp, date_formatted, read FROM contact_messages ORDER BY timestamp DESC;'
      );
      return res.status(200).json({
        success: true,
        messages: messages.map((m: any) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          message: m.message,
          timestamp: Number(m.timestamp),
          dateFormatted: m.date_formatted,
          read: Boolean(m.read),
        })),
      });
    } catch (err: any) {
      console.error('Error fetching messages from Neon:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Database query error' });
    }
  }

  if (req.method === 'POST') {
    // Parse body if string
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // ignore
      }
    }

    const { name, email, message, timestamp, dateFormatted, id } = body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Missing required fields: name, email, and message are required.' });
    }

    const messageId = id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const ts = timestamp || Date.now();
    const df =
      dateFormatted ||
      new Date(ts).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

    try {
      await sql.query(
        `INSERT INTO contact_messages (id, name, email, message, timestamp, date_formatted, read)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET read = EXCLUDED.read;`,
        [messageId, name.trim(), email.trim(), message.trim(), ts, df, false]
      );

      return res.status(200).json({
        success: true,
        message: {
          id: messageId,
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          timestamp: ts,
          dateFormatted: df,
          read: false,
        },
      });
    } catch (err: any) {
      console.error('Error inserting message into Neon:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Database insert error' });
    }
  }

  // DELETE: Delete a specific message or all messages
  if (req.method === 'DELETE') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // ignore
      }
    }

    const id = req.query?.id || body?.id;
    const deleteAll = req.query?.all === 'true' || body?.all === true;

    if (!id && !deleteAll) {
      return res.status(400).json({ success: false, error: 'Missing message id parameter for deletion.' });
    }

    try {
      if (deleteAll) {
        await sql.query('DELETE FROM contact_messages;');
        return res.status(200).json({ success: true, message: 'All messages successfully deleted from database.' });
      }

      const deleteRes = await sql.query('DELETE FROM contact_messages WHERE id = $1 RETURNING id;', [id]);
      if (deleteRes.length === 0) {
        // Message might have already been deleted or not exist in DB
        return res.status(200).json({ success: true, message: 'Message removed.', deletedId: id });
      }

      return res.status(200).json({
        success: true,
        message: 'Message successfully deleted from database.',
        deletedId: id,
      });
    } catch (err: any) {
      console.error('Error deleting message from Neon:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Database delete error' });
    }
  }

  // PATCH: Update read status of a message
  if (req.method === 'PATCH') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // ignore
      }
    }

    const id = req.query?.id || body?.id;
    const read = body?.read !== undefined ? Boolean(body.read) : true;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Missing message id parameter.' });
    }

    try {
      await sql.query('UPDATE contact_messages SET read = $1 WHERE id = $2;', [read, id]);
      return res.status(200).json({ success: true, id, read });
    } catch (err: any) {
      console.error('Error updating message status in Neon:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Database update error' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

