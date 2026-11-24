# Bản chuẩn thông số: đăng vào bảng riêng `spec_std` (nhánh spec-std-bang-rieng)

Khoa quyết 24/11/2026 (phương án A của chuan-hoa-b2.md mục 5 câu 1). Trạng thái: PR nháp, CHƯA chạy SQL, CHƯA bật `SPEC_STD_PUBLISH`, CHƯA đăng thật.

## 1. Đã đổi

- `web/supabase/schema.sql`: thêm bảng `spec_std` (đoạn dưới đây), đặt trước hàm `log_activity`. Không `alter publication`, không trigger.
- `suppliers/spec-standard.mjs`: `post()` / `remoteHashes()` ghi / đọc bảng `spec_std` (`TABLE`, `rowOf`): dòng `{ id, part, hash, data, updated_at }`, upsert `?on_conflict=id`. Vẫn chỉ ghi doc đổi hash, lô ≤ 200 dòng / 2 MB, doc biến mất ghi `gone` (hash "gone", `part` giữ). Cổng `SPEC_STD_PUBLISH=1` và `--dry` giữ nguyên. `standardOf` không đụng.
- `suppliers/spec-standard.test.mjs`: test mới cho `rowOf` / `TABLE`; ca lô dùng dòng mới.
- `.github/workflows/supplier-publish.yml`: chỉ đổi chú thích bước "Spec standard".

## 2. SQL nguyên văn

```sql
create table if not exists public.spec_std (
  id text primary key,               -- "<part>:<key>" (engine / alternator / controller) hoặc "genset:<NCC>"
  part text not null,                -- genset | engine | alternator | controller
  hash text not null,                -- hash nội dung; "gone" = doc không còn sinh ra
  data jsonb not null,
  updated_at timestamptz not null default now()
);
create index if not exists spec_std_part on public.spec_std (part, id);
alter table public.spec_std enable row level security;
drop policy if exists spec_std_read on public.spec_std;
create policy spec_std_read on public.spec_std for select to authenticated using (public.is_member());
```

Không có policy ghi: chỉ service role (bỏ qua RLS) ghi. Không thêm vào publication `supabase_realtime`, không trigger `activity_log`. Bảng lấy `public.is_member()` có sẵn của `schema.sql`.

## 3. Repo áp schema thế nào

Chạy TAY: `web/README.md` bước 1 "run `supabase/schema.sql` in the SQL editor", sửa schema thì chạy lại (an toàn chạy lại). Không có workflow / migration tự áp khi merge (`grep schema.sql|supabase db|psql` trong `.github`: 0 kết quả). Merge PR không đụng Supabase.

## 4. Việc Khoa / điều phối làm tay, theo thứ tự

1. Merge PR (squash) khi CI xanh. Bước này chưa đổi gì trên Supabase.
2. Supabase → SQL editor → dán đúng khối SQL ở mục 2 (hoặc cả `schema.sql`) → Run. Kiểm: `select count(*) from public.spec_std;` ra 0.
3. Kiểm không realtime / không nhật ký: `select * from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'spec_std';` phải 0 dòng; `select tgname from pg_trigger where tgrelid = 'public.spec_std'::regclass and not tgisinternal;` phải 0 dòng.
4. Đặt biến repo `SPEC_STD_PUBLISH = 1` (GitHub → Settings → Variables). Lần chạy `supplier-publish.yml` kế đó (push main đổi `suppliers/`) đăng 9.681 doc, 67 lô, ~44,8 MB; lần sau chỉ doc đổi hash.
5. Soát: `select part, count(*), sum(pg_column_size(data)) from public.spec_std group by 1;` rồi chạy `node suppliers/spec-standard.mjs --post --dry` có khoá: phải báo "0 sẽ ghi".

## 5. Quay lui

- Chưa bật `SPEC_STD_PUBLISH`: không gì phải quay lui (bước 1–2 chỉ thêm một bảng rỗng).
- Đã đăng: xoá biến `SPEC_STD_PUBLISH` (workflow quay về `--dry`), rồi `drop table public.spec_std;` (không bảng khác phụ thuộc; không có nhật ký / realtime để dọn).
- Revert PR không cần chạm Supabase; bảng thừa vô hại.

## 6. Kiểm

Xem kết quả cuối ở mục 7.

## 7. Kết quả chạy
(điền sau)
