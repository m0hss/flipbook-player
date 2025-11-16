import { put } from '@vercel/blob';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  try {
    // Only allow POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check basic auth (using TextEncoder for edge runtime)
    const authHeader = request.headers.get('authorization');
    
    // Read from environment (Vercel Edge uses different env var names)
    // eslint-disable-next-line no-undef
    const expectedUser = process.env.BASIC_AUTH_USER || 'admin';
    // eslint-disable-next-line no-undef
    const expectedPass = process.env.BASIC_AUTH_PASS || 'admin';
    
    // Use btoa for base64 encoding in edge runtime
    const expectedToken = `Basic ${btoa(`${expectedUser}:${expectedPass}`)}`;
    
    if (authHeader !== expectedToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const title = formData.get('title');

    if (!file || !title) {
      return new Response(JSON.stringify({ error: 'Missing file or title' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Upload to Vercel Blob
    const blob = await put(`pdfs/${Date.now()}-${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    // Store metadata in Vercel Blob as well (simple JSON file)
    const metadataKey = `metadata/${blob.pathname.replace('pdfs/', '').replace('.pdf', '')}.json`;
    const metadata = {
      id: blob.pathname.replace('pdfs/', '').replace('.pdf', ''),
      title,
      file: blob.url,
      uploadedAt: new Date().toISOString(),
    };

    await put(metadataKey, JSON.stringify(metadata), {
      access: 'public',
      contentType: 'application/json',
    });

    return new Response(JSON.stringify({ success: true, data: metadata }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Upload failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
