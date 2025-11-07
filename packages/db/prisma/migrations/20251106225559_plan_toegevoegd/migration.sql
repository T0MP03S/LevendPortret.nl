-- CreateEnum
CREATE TYPE "AccountPlan" AS ENUM ('FREE', 'PAID');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "plan" "AccountPlan" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "planUpdatedAt" TIMESTAMP(3);
