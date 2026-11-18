// Sync theo lịch khi mọi máy Windows tắt (Khoa, 2026-11-18): Vercel Cron (web/vercel.json, 10:10 / 14:10 / 18:10 giờ Việt
// Nam, thứ Hai đến thứ Sáu; thứ Bảy, Chủ nhật không Sync theo lịch) gọi hàm này. Còn máy bật (tim < 1 phút) thì thôi: máy đó
// tự Sync theo lịch của nó (GenBid-Bot.ps1). Không máy nào bật thì đánh thức bot trong Vercel Sandbox (api/_wake.js); bot đó
// chạy cùng vòng lịch, tính giờ Việt Nam, Sync mốc vừa tới rồi tự dừng khi rảnh 5 phút (api/_sandbox.js decide).
// Chỉ nhận lời gọi của Vercel Cron: Authorization: Bearer <CRON_SECRET> (biến Vercel, Khoa đặt). Chưa đặt thì không làm gì.
import { wakeSandbox } from "./_wake.js";

export const VN_OFFSET_MS = 7 * 3600e3;
// Thứ Hai đến thứ Sáu theo giờ Việt Nam (cron chạy theo UTC; 03:10 UTC vẫn cùng ngày ở Việt Nam).
export const isWorkday = (now = Date.now()) => { const d = new Date(now + VN_OFFSET_MS).getUTCDay(); return d >= 1 && d <= 5; };

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return res.status(503).json({ error: "chưa đặt CRON_SECRET" });
  if (req.headers?.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: "unauthorized" });
  if (!isWorkday()) return res.json({ wake: "weekend" });
  // "off" (SANDBOX_WAKE chưa bật) | "bot-on" (có máy bật) | "waking" | "sent" | "error".
  res.json({ wake: await wakeSandbox() });
}
