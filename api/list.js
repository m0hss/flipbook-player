/* eslint-env node */
import { list } from '@vercel/blob';

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    const { blobs } = await list({ prefix: "metadata/" });
    const pdfs = await Promise.all(
      blobs.map(async (blob) => {
        try {
          const r = await fetch(blob.url);
          return await r.json();
        } catch {
          return null;
        }
      })
    );
    const valid = pdfs
      .filter(Boolean)
      .sort(
        (a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0)
      );
    return res
      .status(200)
      .setHeader?.("Cache-Control", "no-cache, no-store, must-revalidate")
      .json({ success: true, data: valid });
  } catch (error) {
    console.error("List error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to list PDFs" });
  }
}
