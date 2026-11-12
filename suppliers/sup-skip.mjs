// NCC đã Loại trừ trên web (supexcl/<id> {on:true}) hoặc xoá mềm (supdeleted/<id>) không được xuất hiện ở đầu ra nào của
// bot (Khoa 2026-11-11). Các đường đọc qua web (allDocs / api "supplier") đã được /api/requests lọc sẵn; module này dành
// cho đường đọc tệp suppliers/cn/*.json (gaps.mjs, GENBID_LOCAL_SUPPLIERS=1).
//
// skippedOf(read): read(coll) → [{ id, data }] của supexcl / supdeleted. Trả { ids: Set, ok }:
//   ok = false khi không đọc được (mạng, thiếu khoá) — nơi gọi phải coi danh sách là CHƯA lọc.
// Chỉ supexcl có `on === true` được tính (bỏ loại trừ rồi thì NCC quay lại); mọi doc của supdeleted đều tính.
export async function skippedOf(read) {
  try {
    const [exc, del] = await Promise.all([read("supexcl"), read("supdeleted")]);
    if (!Array.isArray(exc) || !Array.isArray(del)) return { ids: new Set(), ok: false };
    return { ids: new Set([...del.map((d) => d.id), ...exc.filter((d) => d.data?.on === true).map((d) => d.id)]), ok: true };
  } catch { return { ids: new Set(), ok: false }; }
}
export const dropSkipped = (list, ids, idOf = (x) => x.id) => (ids?.size ? list.filter((x) => !ids.has(idOf(x))) : list);
export const UNFILTERED_WARNING = "chưa lọc NCC loại trừ";
