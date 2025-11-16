import { del, list } from '@vercel/blob';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  try {
    if (request.method !== 'DELETE') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check basic auth
    const authHeader = request.headers.get('authorization');
    // eslint-disable-next-line no-undef
    const expectedUser = process.env.BASIC_AUTH_USER || 'admin';
    // eslint-disable-next-line no-undef
    const expectedPass = process.env.BASIC_AUTH_PASS || 'admin';
    const expectedToken = `Basic ${btoa(`${expectedUser}:${expectedPass}`)}`;
    
    if (authHeader !== expectedToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing id parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // List all blobs and find ones matching the id
    const { blobs } = await list();
    const toDelete = blobs.filter(blob => 
      blob.pathname.includes(id) || blob.pathname.includes(`metadata/${id}`)
    );

    // Delete all matching blobs
    await Promise.all(toDelete.map(blob => del(blob.url)));

    return new Response(JSON.stringify({ success: true, deleted: toDelete.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Delete error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Delete failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
