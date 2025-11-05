/*
  Warnings:

  - You are about to drop the column `phone` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `vatNumber` on the `Company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Company" DROP COLUMN "phone",
DROP COLUMN "vatNumber";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT;
