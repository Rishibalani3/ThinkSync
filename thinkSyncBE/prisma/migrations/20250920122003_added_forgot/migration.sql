/*
  Warnings:

  - You are about to drop the column `skills` on the `UserDetails` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."UserDetails" DROP COLUMN "skills",
ALTER COLUMN "themePreference" SET DEFAULT 'dark',
ALTER COLUMN "Mailnotification" SET DEFAULT true,
ALTER COLUMN "MessageNotification" SET DEFAULT true;

-- CreateTable
CREATE TABLE "public"."PasswordResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "public"."PasswordResetToken"("token");

-- AddForeignKey
ALTER TABLE "public"."PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
