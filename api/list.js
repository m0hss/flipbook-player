import { list } from '@vercel/blob';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  try {
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // List all metadata files
    const { blobs } = await list({ prefix: 'metadata/' });

    // Fetch each metadata file content
    const pdfs = await Promise.all(
      blobs.map(async (blob) => {
        try {
          const response = await fetch(blob.url);
          const data = await response.json();
          return data;
        } catch {
          return null;
        }
      })
    );

    // Filter out nulls and return
    const validPdfs = pdfs.filter(Boolean);

    return new Response(JSON.stringify({ success: true, data: validPdfs }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('List error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to list PDFs' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
