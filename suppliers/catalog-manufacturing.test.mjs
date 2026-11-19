// node --test suppliers/catalog-manufacturing.test.mjs — web/catalog.js đọc nơi sản xuất của hãng đầu phát / bộ điều khiển từ
// `manufacturing[]` của hồ sơ hãng (catalog-manufacturing, Khoa duyệt 19/11/2026), thay cho bảng ghi cứng MADE_DEFAULT.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const CN = path.join(ROOT, "cn");
const real = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(CN, f), "utf8")));
const at = (kind, make, model) => C.madeIn(kind, [make], "| X |", model);
const maker = (id, role, brand, manufacturing) => ({ id, country: "GB", role, status: "incomplete", names: { en: id, brands: [brand] }, manufacturing });

test("hồ sơ thật: mỗi hãng có nơi sản xuất đúng như manufacturing[] (và như bảng cũ)", () => {
  C.useManufacturing(real);
  const gb = (m) => assert.equal(m.at, "GB");
  gb(at("alternator", "Stamford"));
  assert.equal(at("alternator", "Stamford").why, "mặc định theo hãng (Khoa chốt 16/11/2026)");
  assert.equal(at("alternator", "Leroy-Somer").at, "FR");
  assert.equal(at("alternator", "Mecc Alte").at, "IT");
  assert.equal(at("controller", "ComAp").at, "CZ"); // mục "design" (Praha) không tính; mục Khoa chốt 16/11
  assert.equal(at("controller", "Datakom").at, "TR");
  // AvK: nhà máy Craiova (Romania) của "AvK (all)", không phải mặc định Stamford → Anh.
  const avk = at("alternator", "AvK");
  assert.equal(avk.at, "RO");
  assert.match(avk.why, /^hãng ghi nơi sản xuất — hồ sơ hãng, nguồn 6002 \(Craiova/);
  // DSE, DEIF: một mục có nguồn "All products".
  const dse = at("controller", "Deep Sea");
  assert.equal(dse.at, "GB");
  assert.match(dse.why, /Hunmanby/);
  assert.equal(at("controller", "DEIF").at, "DK");
  // Woodward: chỉ các dòng easYgen nguồn nêu; easYgen-800 chưa xác minh → không rõ; không model → không rõ.
  assert.equal(at("controller", "Woodward", "easYgen-1500").at, "PL");
  assert.equal(at("controller", "Woodward", "easYgen-3000XT").at, "PL");
  assert.equal(at("controller", "Woodward", "easYgen-800").at, "?");
  assert.equal(at("controller", "Woodward", "").at, "?");
  // Hãng không có hồ sơ nơi sản xuất (Marathon chỉ có manufacturingNote, SICES chỉ "design"): giữ "không rõ".
  assert.equal(at("alternator", "Marathon").at, "?");
  assert.equal(at("controller", "SICES").at, "?");
});

test("why của nơi mặc định bắt đầu bằng 'hãng' / 'mặc định' (config-bot không coi là câu trích của dòng nguồn)", () => {
  C.useManufacturing(real);
  for (const [k, m, mo] of [["alternator", "Stamford"], ["alternator", "Leroy-Somer"], ["alternator", "Mecc Alte"], ["alternator", "AvK"], ["controller", "Deep Sea"], ["controller", "DEIF"],
    ["controller", "Datakom"], ["controller", "ComAp"], ["controller", "Woodward", "easYgen-3000"]]) assert.match(at(k, m, mo).why, /^(hãng|mặc định)/, `${m}`);
});

test("nơi sản xuất đọc từ dữ liệu, không từ bảng ghi cứng: đổi manufacturing[] thì đổi kết quả", () => {
  C.useManufacturing([maker("dse", "controller_maker", "Deep Sea", [{ country: "NL", scope: "manufacture", products: "All products", src: [6001], quote: ["x"] }])]);
  assert.equal(at("controller", "Deep Sea").at, "NL");
  // Hãng ngoài bảng cũ (Marathon) có nơi sản xuất có nguồn → đọc được.
  C.useManufacturing([maker("mar", "alternator_maker", "Marathon", [{ country: "US", city: "Wausau", scope: "manufacture", products: "All products", src: [6001], quote: ["x"] }])]);
  assert.equal(at("alternator", "Marathon").at, "US");
  // Nhà máy TQ ghi ở dòng nguồn vẫn thắng nơi mặc định của hồ sơ.
  assert.equal(C.madeIn("alternator", ["Stamford"], "| Manufacturer | WUXI STAMFORD").at, "CN");
});

test("mục 'design', mục không ghi sản phẩm và không Khoa chốt, hai nơi khác nhau: không cho nơi mặc định (giữ bảng cũ)", () => {
  // ComAp chỉ có mục design (Séc) → bảng cũ vẫn cho CZ (Khoa chốt 16/11), không phải mục design.
  C.useManufacturing([maker("comap", "controller_maker", "ComAp", [{ country: "NL", scope: "design", src: [6001], quote: ["x"] }])]);
  assert.equal(at("controller", "ComAp").at, "CZ");
  // Datakom: mục có nguồn mà không nêu sản phẩm → không cho biết sản phẩm nào; bảng cũ TR.
  C.useManufacturing([maker("dk", "controller_maker", "Datakom", [{ country: "NL", city: "X", scope: "manufacture", src: [6001], quote: ["x"] }])]);
  assert.equal(at("controller", "Datakom").at, "TR");
  // Hai mục "All products" ở hai nước → không chọn một.
  C.useManufacturing([maker("deif", "controller_maker", "DEIF", [
    { country: "NL", scope: "manufacture", products: "All products", src: [6001], quote: ["x"] },
    { country: "SE", scope: "manufacture", products: "All products", src: [6001], quote: ["y"] }])]);
  assert.equal(at("controller", "DEIF").at, "DK");
});

test("danh sách không có hồ sơ hãng (một NCC) không xoá bảng đã nạp", () => {
  C.useManufacturing(real);
  C.build([{ id: "t", role: "genset_maker", status: "verified", names: { en: "T" }, specTables: [] }]);
  assert.equal(at("alternator", "AvK").at, "RO");
  assert.match(at("alternator", "AvK").why, /Craiova/);
});

test("catalog.build tự nạp manufacturing[] của danh sách NCC (kể cả hồ sơ 'incomplete')", () => {
  C.useManufacturing([maker("seed", "controller_maker", "Deep Sea", [{ country: "NL", scope: "manufacture", products: "All products", src: [6001], quote: ["x"] }])]);
  C.build(real);
  assert.equal(at("controller", "Deep Sea").at, "GB");
});
