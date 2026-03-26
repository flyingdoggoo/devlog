-- DropIndex
DROP INDEX "Comment_postId_createdAt_idx";

-- DropIndex
DROP INDEX "Follow_followerId_idx";

-- DropIndex
DROP INDEX "Follow_followingId_idx";

-- DropIndex
DROP INDEX "Like_postId_idx";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Follow" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Like" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Comment_postId_active_createdAt_idx" ON "Comment"("postId", "active", "createdAt");

-- CreateIndex
CREATE INDEX "Follow_followerId_active_idx" ON "Follow"("followerId", "active");

-- CreateIndex
CREATE INDEX "Follow_followingId_active_idx" ON "Follow"("followingId", "active");

-- CreateIndex
CREATE INDEX "Like_postId_active_idx" ON "Like"("postId", "active");
