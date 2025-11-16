import { put } from '@vercel/blob';

export const config = { runtime: 'nodejs' };

function unauthorized(res) {
  res.status(401).json({ error: 'Unauthorized' });
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Basic Auth verification
    const authHeader = req.headers.authorization || '';
    const expectedUser = process.env.BASIC_AUTH_USER || 'admin';
    const expectedPass = process.env.BASIC_AUTH_PASS || 'admin';
    const expected = 'Basic ' + Buffer.from(`${expectedUser}:${expectedPass}`).toString('base64');
    if (authHeader !== expected) {
      return unauthorized(res);
    }

    // Parse multipart form data
    const formData = await req.formData?.();
    // If edge-style formData is not available (nodejs runtime), fall back to busboy-like error
    if (!formData) {
      return res.status(400).json({ error: 'formData API not available. Use fetch with FormData from client.' });
    }
    const file = formData.get('file');
    const title = formData.get('title');
    if (!file || !title) {
      return res.status(400).json({ error: 'Missing file or title' });
    }

    const safeName = file.name?.replace(/[^a-zA-Z0-9_.-]/g, '_') || 'upload.pdf';
    const blob = await put(`pdfs/${Date.now()}-${safeName}`, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    const id = blob.pathname.replace(/^pdfs\//, '').replace(/\.pdf$/i, '');
    const metadata = { id, title, file: blob.url, uploadedAt: new Date().toISOString() };
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
