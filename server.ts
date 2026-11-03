import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { neon } from '@neondatabase/serverless';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 1. Neon Postgres Client setup
const dbUrl = process.env.DATABASE_URL;
const sql = dbUrl ? neon(dbUrl) : null;

// 2. Neon Object Storage (S3-compatible) Client setup
const s3 =
  process.env.AWS_ENDPOINT_URL_S3 && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? new S3Client({
        region: process.env.AWS_REGION || 'ap-southeast-1',
        endpoint: process.env.AWS_ENDPOINT_URL_S3,
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      })
    : null;

const upload = multer({ storage: multer.memoryStorage() });

// Healthcheck & Neon Status
app.get('/api/neon/health', async (_req, res) => {
  try {
    let pgStatus = 'disabled';
    let s3Status = 'disabled';

    if (sql) {
      const result = await sql.query('SELECT NOW() as now, version() as version;');
      pgStatus = result ? 'connected' : 'error';
    }

    if (s3) {
      s3Status = 'configured';
    }

    res.json({
      status: 'ok',
      branch: process.env.NEON_BRANCH || 'production',
      postgres: pgStatus,
      objectStorage: s3Status,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err?.message || String(err) });
  }
});

// --- POSTGRES: Contact Messages ---
app.get('/api/contact/messages', async (_req, res) => {
  if (!sql) return res.status(503).json({ error: 'Neon Postgres not configured' });
  try {
    const messages = await sql.query(
      'SELECT id, name, email, message, timestamp, date_formatted, read FROM contact_messages ORDER BY timestamp DESC;'
    );
    res.json({
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
    res.status(500).json({ error: err?.message || 'Database query error' });
  }
});

app.post('/api/contact/messages', async (req, res) => {
  if (!sql) return res.status(503).json({ error: 'Neon Postgres not configured' });
  const { name, email, message, timestamp, dateFormatted, id } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
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
      [messageId, name, email, message, ts, df, false]
    );

    res.json({
      success: true,
      message: {
        id: messageId,
        name,
        email,
        message,
        timestamp: ts,
        dateFormatted: df,
        read: false,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Database insert error' });
  }
});

// --- OBJECT STORAGE: Assets / Resume Upload & Download ---
app.post('/api/storage/upload', upload.single('file'), async (req, res) => {
  if (!s3) return res.status(503).json({ error: 'Neon Object Storage not configured' });
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const bucket = req.body.bucket || 'assets';
  const key = req.body.key || `resumes/${Date.now()}_${file.originalname}`;

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype || 'application/octet-stream',
      })
    );

    const fileUrl = `/api/storage/file?bucket=${bucket}&key=${encodeURIComponent(key)}`;
    res.json({
      success: true,
      bucket,
      key,
      url: fileUrl,
      size: file.size,
      fileName: file.originalname,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to upload to Object Storage' });
  }
});

app.get('/api/storage/file', async (req, res) => {
  if (!s3) return res.status(503).json({ error: 'Neon Object Storage not configured' });
  const bucket = (req.query.bucket as string) || 'assets';
  const key = req.query.key as string;

  if (!key) return res.status(400).json({ error: 'Missing key parameter' });

  try {
    const object = await s3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    if (object.ContentType) {
      res.setHeader('Content-Type', object.ContentType);
    }
    if (object.ContentLength) {
      res.setHeader('Content-Length', object.ContentLength.toString());
    }

    const stream = object.Body as NodeJS.ReadableStream;
    stream.pipe(res);
  } catch (err: any) {
    res.status(404).json({ error: 'File not found or failed to retrieve' });
  }
});

app.listen(port, () => {
  console.log(`Neon backend server running on http://localhost:${port}`);
});
export default app;

