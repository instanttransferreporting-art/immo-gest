-- CreateEnum
CREATE TYPE "StatutReversement" AS ENUM ('BROUILLON', 'VALIDE');

-- AlterTable
ALTER TABLE "proprietaires" ADD COLUMN     "tauxCommission" DOUBLE PRECISION NOT NULL DEFAULT 10;

-- CreateTable
CREATE TABLE "reversements" (
    "id" TEXT NOT NULL,
    "proprietaireId" TEXT NOT NULL,
    "mois" INTEGER NOT NULL,
    "annee" INTEGER NOT NULL,
    "totalEncaisse" DOUBLE PRECISION NOT NULL,
    "tauxCommission" DOUBLE PRECISION NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL,
    "netAPayer" DOUBLE PRECISION NOT NULL,
    "statut" "StatutReversement" NOT NULL DEFAULT 'BROUILLON',
    "dateGeneration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateValidation" TIMESTAMP(3),

    CONSTRAINT "reversements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reversements_proprietaireId_mois_annee_key" ON "reversements"("proprietaireId", "mois", "annee");

-- AddForeignKey
ALTER TABLE "reversements" ADD CONSTRAINT "reversements_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "proprietaires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
