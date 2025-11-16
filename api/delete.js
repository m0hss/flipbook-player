import { del, list } from "@vercel/blob";

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  try {
    if (req.method !== "DELETE") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    const authHeader = req.headers.authorization || "";
    const expectedUser = process.env.BASIC_AUTH_USER || "admin";
    const expectedPass = process.env.BASIC_AUTH_PASS || "admin";
    const expected =
      "Basic " +
      Buffer.from(`${expectedUser}:${expectedPass}`).toString("base64");
    if (authHeader !== expected) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const id =
      req.query?.id ||
      new URL(req.url, "http://localhost").searchParams.get("id");
    if (!id) {
      return res.status(400).json({ error: "Missing id parameter" });
    }
    const { blobs } = await list();
    const toDelete = blobs.filter(
      (b) => b.pathname.includes(id) || b.pathname.includes(`metadata/${id}`)
    );
    await Promise.all(toDelete.map((b) => del(b.url)));
    return res.status(200).json({ success: true, deleted: toDelete.length });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ error: error.message || "Delete failed" });
  }
}
