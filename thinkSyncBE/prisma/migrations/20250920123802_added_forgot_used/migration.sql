-- AlterTable
ALTER TABLE "public"."PasswordResetToken" ADD COLUMN     "used" BOOLEAN DEFAULT false;
