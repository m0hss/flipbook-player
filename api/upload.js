/* eslint-env node */
import { put } from '@vercel/blob';
import { IncomingForm } from 'formidable';
import { readFile } from 'fs/promises';

export const config = {
  api: {
    bodyParser: false, // Disable default body parser
  },
};

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Basic auth
    const authHeader = req.headers.authorization || '';
    const expectedUser = process.env.BASIC_AUTH_USER || 'admin';
    const expectedPass = process.env.BASIC_AUTH_PASS || 'admin';
    const expected = 'Basic ' + Buffer.from(`${expectedUser}:${expectedPass}`).toString('base64');
    if (authHeader !== expected) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Parse multipart form data
    const form = new IncomingForm();
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.file?.[0] || files.file;
    const title = fields.title?.[0] || fields.title || 'Untitled';

    if (!file) {
      return res.status(400).json({ error: 'Missing file' });
    }

    // Read file buffer
    const fileBuffer = await readFile(file.filepath);
    const originalName = file.originalFilename || 'upload.pdf';
    const safeName = originalName.replace(/[^a-zA-Z0-9_.-]/g, '_');

    // Upload to Vercel Blob
    const blob = await put(`pdfs/${Date.now()}-${safeName}`, fileBuffer, {
      access: 'public',
      addRandomSuffix: true,
    });

    const id = blob.pathname.replace(/^pdfs\//, '').replace(/\.pdf$/i, '');
    const metadata = {
      id,
      title,
      file: blob.url,
      uploadedAt: new Date().toISOString(),
    };

    // Save metadata
    await put(`metadata/${id}.json`, JSON.stringify(metadata), {
      access: 'public',
      contentType: 'application/json',
    });

    return res.status(200).json({ success: true, data: metadata });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message || 'Upload failed' });
  }
}
