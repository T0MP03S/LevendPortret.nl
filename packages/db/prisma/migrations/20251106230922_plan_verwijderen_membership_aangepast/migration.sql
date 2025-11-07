/*
  Warnings:

  - A unique constraint covering the columns `[userId,companyId,product]` on the table `Membership` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "MembershipProduct" AS ENUM ('CLUB', 'COACH', 'FUND');

-- DropIndex
DROP INDEX "Membership_userId_companyId_key";

-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "product" "MembershipProduct" NOT NULL DEFAULT 'CLUB';

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_companyId_product_key" ON "Membership"("userId", "companyId", "product");
