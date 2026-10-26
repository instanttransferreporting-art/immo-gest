-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('fr', 'en');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "locale" "Locale" NOT NULL DEFAULT 'fr';
