/*
  Warnings:

  - You are about to drop the column `username` on the `Credential` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- 1) Add column as nullable first
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- 2) Backfill from old Credential.username
UPDATE "User" u
SET "username" = c."username"
FROM "Credential" c
WHERE c."userId" = u."id"
  AND u."username" IS NULL;

-- 3) Fallback for any user still missing username
WITH missing AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
  FROM "User"
  WHERE "username" IS NULL
)
UPDATE "User" u
SET "username" = 'user-' || m.rn || '-' || substring(replace(u.id, '-', ''), 1, 6)
FROM missing m
WHERE u.id = m.id;

-- 4) Enforce required + unique
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- 5) Remove legacy username from Credential
ALTER TABLE "Credential" DROP COLUMN "username";

