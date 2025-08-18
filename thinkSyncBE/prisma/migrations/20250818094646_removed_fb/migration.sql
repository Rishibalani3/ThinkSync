/*
  Warnings:

  - You are about to drop the column `facebookAccessToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `facebookId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `facebookRefreshToken` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."User_facebookId_key";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "facebookAccessToken",
DROP COLUMN "facebookId",
DROP COLUMN "facebookRefreshToken";
