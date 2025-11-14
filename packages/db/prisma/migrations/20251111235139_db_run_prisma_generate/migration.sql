/*
  Warnings:

  - You are about to drop the column `description` on the `Clip` table. All the data in the column will be lost.
  - You are about to drop the column `durationSeconds` on the `Clip` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `Clip` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `Clip` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Clip` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Clip` table. All the data in the column will be lost.
  - You are about to drop the column `vimeoId` on the `Clip` table. All the data in the column will be lost.
  - Added the required column `vimeoShortId` to the `Clip` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ClipStatus" AS ENUM ('IN_REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PageStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Clip" DROP COLUMN "description",
DROP COLUMN "durationSeconds",
DROP COLUMN "published",
DROP COLUMN "thumbnailUrl",
DROP COLUMN "title",
DROP COLUMN "type",
DROP COLUMN "vimeoId",
ADD COLUMN     "status" "ClipStatus" NOT NULL DEFAULT 'IN_REVIEW',
ADD COLUMN     "vimeoShortId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "CompanyPage" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "PageStatus" NOT NULL DEFAULT 'DRAFT',
    "longVideoVimeoId" TEXT,
    "aboutLong" TEXT,
    "gallery" JSONB,
    "accentColor" TEXT,
    "titleFont" TEXT,
    "bodyFont" TEXT,
    "roundedCorners" BOOLEAN NOT NULL DEFAULT false,
    "showCompanyNameNextToLogo" BOOLEAN NOT NULL DEFAULT true,
    "socials" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyPage_companyId_key" ON "CompanyPage"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyPage_slug_key" ON "CompanyPage"("slug");

-- AddForeignKey
ALTER TABLE "CompanyPage" ADD CONSTRAINT "CompanyPage_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
