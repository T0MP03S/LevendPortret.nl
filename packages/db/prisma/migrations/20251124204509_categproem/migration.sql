-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'nieuws';

-- CreateIndex
CREATE INDEX "Article_category_status_publishedAt_idx" ON "Article"("category", "status", "publishedAt");
