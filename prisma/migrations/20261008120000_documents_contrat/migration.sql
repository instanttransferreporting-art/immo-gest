-- CreateEnum
CREATE TYPE "TypeDocumentContrat" AS ENUM ('CONTRAT_SIGNE', 'ETAT_LIEUX_ENTREE', 'ETAT_LIEUX_SORTIE');

-- CreateTable
CREATE TABLE "documents_contrat" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "contratId" TEXT NOT NULL,
    "type" "TypeDocumentContrat" NOT NULL,
    "nomFichier" TEXT NOT NULL,
    "cheminFichier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_contrat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "documents_contrat_organizationId_idx" ON "documents_contrat"("organizationId");

-- CreateIndex
CREATE INDEX "documents_contrat_contratId_idx" ON "documents_contrat"("contratId");

-- AddForeignKey
ALTER TABLE "documents_contrat" ADD CONSTRAINT "documents_contrat_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents_contrat" ADD CONSTRAINT "documents_contrat_contratId_fkey" FOREIGN KEY ("contratId") REFERENCES "contrats_bail"("id") ON DELETE CASCADE ON UPDATE CASCADE;
