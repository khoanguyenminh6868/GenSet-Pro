import { SB_URL } from "./_supabase.js";

// Files that lived in the claude.ai artifact store (/_blob/<id>) now live in the public "blobs" bucket.
export default function handler(req, res) {
  const id = String(req.query.id || "").replace(/[^a-zA-Z0-9._-]/g, "");
  // "." và ".." chỉ gồm ký tự hợp lệ nhưng trình duyệt chuẩn hoá /blobs/.. thành thư mục cha.
  if (!id || id === "." || id === "..") return res.status(400).end();
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.redirect(302, `${SB_URL}/storage/v1/object/public/blobs/${id}`);
}
