# Seed Mock Data IT Social vào Neon

Script: `backend/scripts/seed-it-social.ts`

## Mục tiêu script

- Tạo dữ liệu social thực tế theo chủ đề IT/AI/ML/Software Engineering.
- Sinh:
  - 20-50 users (default 30)
  - Mỗi user 2-5 posts
  - Mỗi post 2-10 comments
- Ghi snapshot JSON ra:
  - `backend/scripts/output/seed-it-social.json`

## Chạy local với Neon (PowerShell)

```powershell
cd backend
$env:DATABASE_URL="postgresql://<pooled-url>"
$env:DIRECT_URL="postgresql://<direct-url>"
npm run seed:it-social
```

Custom số user:

```powershell
npm run seed:it-social -- --users=40
```

## Chạy local với Neon (bash/zsh)

```bash
cd backend
export DATABASE_URL="postgresql://<pooled-url>"
export DIRECT_URL="postgresql://<direct-url>"
npm run seed:it-social
```

## Lưu ý

- Script dùng PrismaClient, dữ liệu sẽ ghi trực tiếp vào DB đang trỏ bởi `DATABASE_URL`.
- Cần chạy migrate trước seed nếu schema vừa thay đổi:
  - `npx prisma migrate deploy`
