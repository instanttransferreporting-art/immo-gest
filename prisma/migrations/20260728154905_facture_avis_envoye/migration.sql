-- AlterTable
ALTER TABLE "factures" ADD COLUMN     "avisEnvoye" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "avisEnvoyeAt" TIMESTAMP(3);
