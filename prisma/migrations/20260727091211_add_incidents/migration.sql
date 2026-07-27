-- CreateEnum
CREATE TYPE "PrioriteIncident" AS ENUM ('BASSE', 'MOYENNE', 'HAUTE');

-- CreateEnum
CREATE TYPE "StatutIncident" AS ENUM ('NOUVEAU', 'EN_COURS', 'RESOLU');

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priorite" "PrioriteIncident" NOT NULL,
    "statut" "StatutIncident" NOT NULL DEFAULT 'NOUVEAU',
    "uniteId" TEXT,
    "immeubleId" TEXT,
    "prestataire" TEXT,
    "dateSignalement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateResolution" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_uniteId_fkey" FOREIGN KEY ("uniteId") REFERENCES "unites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_immeubleId_fkey" FOREIGN KEY ("immeubleId") REFERENCES "immeubles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
