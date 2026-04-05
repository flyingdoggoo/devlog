# Seed DevLog Mock Data vao Neon

Script: `backend/scripts/seed-devlog.ts`

## Muc tieu script

- Chi con 1 script seed duy nhat cho du an.
- Tao du lieu social realistic cho demo va test:
  - Users + credentials
  - Posts markdown (co heading/list/code block)
  - Tags
  - Follows, comments (co replies), likes, bookmarks

## Chay voi Neon (PowerShell)

```powershell
cd backend
$env:DATABASE_URL="postgresql://<pooled-url>?sslmode=require"
$env:DIRECT_URL="postgresql://<direct-url>?sslmode=require"
npx prisma migrate deploy
npm run seed:devlog
```

Tuy chinh so luong:

```powershell
npm run seed:devlog -- --users=30 --posts=120 --password=Devlog@123
```

## Reset + reseed an toan (PowerShell)

Canh bao: reset mode se xoa toan bo du lieu app (users/posts/tags/follows/comments/likes/bookmarks...).

```powershell
cd backend
$env:DATABASE_URL="postgresql://<pooled-url>?sslmode=require"
$env:DIRECT_URL="postgresql://<direct-url>?sslmode=require"
$env:SEED_CONFIRM_RESET="YES"
npx prisma migrate deploy
npm run seed:devlog:reset -- --users=30 --posts=120 --password=Devlog@123
```

Neu khong set `SEED_CONFIRM_RESET=YES` thi script se tu choi reset.

## Chay voi bash/zsh

```bash
cd backend
export DATABASE_URL="postgresql://<pooled-url>?sslmode=require"
export DIRECT_URL="postgresql://<direct-url>?sslmode=require"
npx prisma migrate deploy
npm run seed:devlog
```

## Luu y

- Dung dung bo `DATABASE_URL`/`DIRECT_URL` hien tai cua moi truong deploy.
- Khong commit connection string that.
- Script in ra sample accounts va mat khau seed de dang nhap nhanh.
