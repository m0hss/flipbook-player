import { put } from "@vercel/blob";

// Use edge runtime so we can access request.formData()
export const config = { runtime: "edge" };

export default async function handler(request) {
  try {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Basic auth (edge still exposes process.env values at build/deploy time)
    const authHeader = request.headers.get("authorization") || "";
    const expectedUser = process.env.BASIC_AUTH_USER || "admin";
    const expectedPass = process.env.BASIC_AUTH_PASS || "admin";
    const expectedToken = "Basic " + btoa(`${expectedUser}:${expectedPass}`);
    if (authHeader !== expectedToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const title = formData.get("title");
    if (!file || !title) {
      return new Response(JSON.stringify({ error: "Missing file or title" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const originalName = file.name || "upload.pdf";
    const safeName = originalName.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const blob = await put(`pdfs/${Date.now()}-${safeName}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    const id = blob.pathname.replace(/^pdfs\//, "").replace(/\.pdf$/i, "");
    const metadata = {
      id,
      title,
      file: blob.url,
      uploadedAt: new Date().toISOString(),
    };
    await put(`metadata/${id}.json`, JSON.stringify(metadata), {
      access: "public",
      contentType: "application/json",
    });
    return new Response(JSON.stringify({ success: true, data: metadata }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Upload failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
