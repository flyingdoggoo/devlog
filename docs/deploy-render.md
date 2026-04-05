# Deploy DevLog Len Render + Neon

Tai lieu nay di kem voi `render.yaml` trong root repo.

## 1) Tao Neon database truoc

1. Vao Neon, tao project moi.
2. Chon region gan Render backend.
3. Lay 2 connection strings:
   - `DATABASE_URL` (pooled, host co `-pooler`)
   - `DIRECT_URL` (direct, khong pooler)
4. Dam bao URL co `sslmode=require`.

## 2) Tao Blueprint tren Render

1. Push code len GitHub.
2. Vao Render Dashboard -> `New` -> `Blueprint`.
3. Chon repo chua file `render.yaml`.
4. Render se tao 3 resources:
   - `devlog-api` (NestJS web service)
   - `devlog-web` (Vite static site)
   - `devlog-cache` (Key Value / Redis-compatible)

`render.yaml` hien tai KHONG tao Render Postgres nua (dung Neon thay the).

## 3) Dien env bat buoc sau khi sync

Trong service `devlog-api`:

- `FRONTEND_URL` = URL cua static site.
  - Vi du: `https://devlog-web.onrender.com`
- `DATABASE_URL` = Neon pooled URL.
- `DIRECT_URL` = Neon direct URL.
- `REDIS_URL` = internal URL cua `devlog-cache`.
  - Lay trong trang `devlog-cache` -> Connect.
- `GOOGLE_REDIRECT_URI` = callback URL backend.
  - Vi du: `https://devlog-api.onrender.com/api/auth/google/callback`
- Neu dung Google login thi cap nhat:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`

Trong service `devlog-web`:

- `VITE_API_BASE_URL` = URL backend (khong co `/api` o cuoi).
  - Vi du: `https://devlog-api.onrender.com`

## 4) Kiem tra deploy

1. `https://<api-domain>/api` phai tra response OK.
2. Frontend load duoc danh sach post.
3. Dang ky / dang nhap hoat dong.
4. Search hoat dong.

## 5) Seed du lieu (khong tu dong)

Seed KHONG tu chay khi deploy.

- Seed nhe:
  - `npm run seed:posts-tags`
- Seed lon:
  - `npm run seed:large`

Chay trong Shell cua service `devlog-api` sau khi deploy xong.

## 6) Ghi chu quan trong

- `devlog-api` start command co chay `prisma migrate deploy` truoc khi start.
- Frontend da duoc setup su dung `VITE_API_BASE_URL`; local dev van fallback qua Vite proxy.
- Google strategy hien tai dung `getOrThrow`, nen 3 bien `GOOGLE_*` phai ton tai.
